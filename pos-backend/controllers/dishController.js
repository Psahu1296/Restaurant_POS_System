// controllers/dishController.js
const createHttpError = require("http-errors");
const Dish = require("../models/dishModel");
const { default: mongoose } = require("mongoose");

// @desc    Add a new dish
// @route   POST /api/dishes
// @access  Private (e.g., Admin)
const addDish = async (req, res, next) => {
  try {
    const { image, name, type, category, price, description, isAvailable, isFrequent } = req.body; // Include isFrequent

    if (!image || !name || !type || !category || price === undefined || price === null) {
      const error = createHttpError(400, "Missing required dish fields (image, name, type, category, price)!");
      return next(error);
    }

    const existingDish = await Dish.findOne({ name });
    if (existingDish) {
      const error = createHttpError(409, "Dish with this name already exists!");
      return next(error);
    }

    const dish = new Dish({
      image,
      name,
      type,
      category,
      price,
      description,
      isAvailable,
      isFrequent // Assign the new field
    });

    await dish.save();
    res
      .status(201)
      .json({ success: true, message: "Dish added successfully!", data: dish });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all dishes
// @route   GET /api/dishes
// @access  Public
const getDishes = async (req, res, next) => {
  try {
    const dishes = await Dish.find({});
    res.status(200).json({ success: true, data: dishes });
  } catch (error) {
    next(error);
  }
};

// @desc    Get only frequently ordered dishes
// @route   GET /api/dishes/frequent
// @access  Public
const getFrequentDishes = async (req, res, next) => {
  try {
    // You can make the limit configurable via query parameters (e.g., ?limit=5)
    const limit = parseInt(req.query.limit) || 10; // Default to top 10
    const minOrders = parseInt(req.query.minOrders) || 1; // Only show dishes with at least 1 order

    const frequentDishes = await Dish.find({ numberOfOrders: { $gte: minOrders } }) // Filter by minimum orders
                                     .sort({ numberOfOrders: -1, name: 1 }) // Sort by orders (desc), then name (asc)
                                     .limit(limit); // Limit the results

    res.status(200).json({ success: true, data: frequentDishes });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dish by ID
// @route   GET /api/dishes/:id
// @access  Public
const getDishById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(400, "Invalid Dish ID format!");
      return next(error);
    }

    const dish = await Dish.findById(id);
    if (!dish) {
      const error = createHttpError(404, "Dish not found!");
      return next(error);
    }

    res.status(200).json({ success: true, data: dish });
  } catch (error) {
    next(error);
  }
};


// @desc    Update an existing dish
// @route   PUT /api/dishes/:id
// @access  Private (e.g., Admin)
const updateDish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(400, "Invalid Dish ID format!");
      return next(error);
    }

    // You can now pass 'isFrequent' in the updates object directly.
    // If 'name' is being updated, you might want to add a check for uniqueness
    // if (updates.name) { /* check for existing dish with new name */ }

    const dish = await Dish.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!dish) {
      const error = createHttpError(404, "Dish not found!");
      return next(error);
    }

    res
      .status(200)
      .json({ success: true, message: "Dish updated successfully!", data: dish });
  }
  // This catch block might need refinement if you want to handle specific validation errors differently
  catch (error) {
    next(error);
  }
};

// @desc    Delete a dish
// @route   DELETE /api/dishes/:id
// @access  Private (e.g., Admin)
const deleteDish = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(400, "Invalid Dish ID format!");
      return next(error);
    }

    const dish = await Dish.findByIdAndDelete(id);

    if (!dish) {
      const error = createHttpError(404, "Dish not found!");
      return next(error);
    }

    res.status(200).json({ success: true, message: "Dish deleted successfully!", data: dish });
  } catch (error) {
    next(error);
  }
};

module.exports = { addDish, getDishes, getFrequentDishes, getDishById, updateDish, deleteDish };