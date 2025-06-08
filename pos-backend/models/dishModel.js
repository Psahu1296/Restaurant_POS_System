const mongoose = require("mongoose");

const dishSchema = new mongoose.Schema(
  {
    image: {
      type: String, // URL to the image
      required: true,
    },
    name: {
      type: String,
      required: true,
      unique: true, // Dish names should ideally be unique
      trim: true,
    },
    numberOfOrders: {
      type: Number,
      default: 0, // Initialize to 0, will be incremented/decremented by order logic
    },
    type: {
      type: String,
      enum: ["starter", "main_course", "dessert", "beverage", "bread", "soup", "salad"],
      required: true,
    },
    category: {
      type: String,
      enum: ["veg", "non_veg", "egg"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    // NEW FIELD ADDED HERE:
    isFrequent: {
      type: Boolean,
      default: false, // Default to false, so only explicitly marked dishes are frequent
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Dish = mongoose.model("Dish", dishSchema);
module.exports = Dish;