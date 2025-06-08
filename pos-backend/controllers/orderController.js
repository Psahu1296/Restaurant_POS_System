const createHttpError = require("http-errors");
const Order = require("../models/orderModel");
const DailyEarning = require("../models/dailyEarningModel");
const { default: mongoose } = require("mongoose");
const { calculateAndSaveDailyEarnings } = require("./earningController"); // Adjust path if needed
const { getZonedStartOfDayUtc } = require("./earningController");

const addOrder = async (req, res, next) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res
      .status(201)
      .json({ success: true, message: "Order created!", data: order });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(404, "Invalid id!");
      return next(error);
    }

    const order = await Order.findById(id);
    if (!order) {
      const error = createHttpError(404, "Order not found!");
      return next(error);
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate("table");
    res.status(200).json({ data: orders });
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(400, "Invalid Order ID format!");
      return next(error);
    }

    const currentOrder = await Order.findById(id);
    if (!currentOrder) {
      const error = createHttpError(404, "Order not found!");
      return next(error);
    }

    const updates = {};
    if (orderStatus !== undefined) {
      updates.orderStatus = orderStatus;
    }

    let shouldUpdateDailyEarningsImmediately = false;
    let amountChange = 0; // This will be the amount to add or subtract from earnings
    let dateForEarningUpdate = null; // The start of the day for the earning record

    if (paymentStatus !== undefined) {
      if (!["Pending", "Paid", "Refunded"].includes(paymentStatus)) {
        const error = createHttpError(400, "Invalid paymentStatus value!");
        return next(error);
      }

      // Scenario 1: Payment status changes TO 'Paid' from anything else
      if (paymentStatus === 'Paid' && currentOrder.paymentStatus !== 'Paid') {
        shouldUpdateDailyEarningsImmediately = true;
        amountChange = currentOrder.bills.totalWithTax; // Add the order's total
        dateForEarningUpdate = getZonedStartOfDayUtc(currentOrder.orderDate); // Earning attributed to order's date
        console.log(`[Earning Update] Order ${id}: Changing to PAID. Incrementing ${amountChange} for ${dateForEarningUpdate.toISOString()}`);
      }
      // Scenario 2: Payment status changes FROM 'Paid' to 'Refunded'
      else if (paymentStatus === 'Refunded' && currentOrder.paymentStatus === 'Paid') {
        shouldUpdateDailyEarningsImmediately = true;
        amountChange = -currentOrder.bills.totalWithTax; // Subtract the order's total
        dateForEarningUpdate = getZonedStartOfDayUtc(currentOrder.orderDate);
        console.log(`[Earning Update] Order ${id}: Changing to REFUNDED from PAID. Decrementing ${Math.abs(amountChange)} for ${dateForEarningUpdate.toISOString()}`);
      }
      // Scenario 3: Payment status changes FROM 'Paid' to 'Pending' (if allowed)
      else if (paymentStatus === 'Pending' && currentOrder.paymentStatus === 'Paid') {
          shouldUpdateDailyEarningsImmediately = true;
          amountChange = -currentOrder.bills.totalWithTax; // Subtract the amount
          dateForEarningUpdate = getZonedStartOfDayUtc(currentOrder.orderDate);
          console.log(`[Earning Update] Order ${id}: Changing to PENDING from PAID. Decrementing ${Math.abs(amountChange)} for ${dateForEarningUpdate.toISOString()}`);
      }
      // If status is "Paid" and remains "Paid", no direct earning change needed via this path.
      // The aggregate calculation handles it.

      updates.paymentStatus = paymentStatus;
    }

    // Perform the actual update on the order document
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    // After successfully updating the order, perform the direct DailyEarning update
    if (shouldUpdateDailyEarningsImmediately) {
      try {
        const dailyEarningRecord = await DailyEarning.findOneAndUpdate(
          { date: dateForEarningUpdate },
          {
            $inc: { totalEarnings: amountChange }, // Atomically increment/decrement
            $setOnInsert: { // Set these fields if a new document is inserted
                date: dateForEarningUpdate,
                percentageChangeFromYesterday: 0 // Default for new records
            }
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log(`[Earning Update Success] Daily earning record for ${dateForEarningUpdate.toISOString().split('T')[0]} adjusted. New total: ${dailyEarningRecord.totalEarnings}`);

      } catch (earningUpdateError) {
        console.error("Error directly updating daily earnings:", earningUpdateError);
        // Log the error but do not prevent the order update response
      }
    }

    res
      .status(200)
      .json({ success: true, message: "Order updated", data: updatedOrder });
  } catch (error) {
    next(error);
  }
};


module.exports = { addOrder, getOrderById, getOrders, updateOrder };
