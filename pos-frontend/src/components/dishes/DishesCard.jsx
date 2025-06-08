import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa"; // Import edit and delete icons from react-icons
import { Img } from "react-image"; // Import react-image

// Define chip colors based on category
const CATEGORY_COLORS = {
  veg: "bg-green-500 text-green-900",
  non_veg: "bg-red-500 text-red-900",
  egg: "bg-orange-500 text-orange-900",
};

const DishCard = ({ dish, onEdit, onDelete }) => {
  // Get the appropriate color class for the category chip
  const chipColorClass =
    CATEGORY_COLORS[dish.category] || "bg-gray-500 text-gray-900";

  return (
    <div className="flex items-center bg-[#1f1f1f] rounded-lg shadow-md overflow-hidden text-[#f5f5f5] p-4 border border-gray-700">
      {/* Circular Image */}
      <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
        <Img
          src={[dish.image, "https://via.placeholder.com/150?text=No+Image"]} // Fallback image using react-image
          alt={dish.name}
          className="w-full h-full object-cover"
          loader={<div className="w-full h-full bg-gray-700 animate-pulse" />} // Optional loading placeholder
          unloader={
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              Image failed to load
            </div>
          } // Optional error placeholder
        />
      </div>

      {/* Dish Details */}
      <div className="flex gap-6 flex-grow items-center">
        <h3 className="text-lg font-semibold mb-1">{dish.name}</h3>
        <p className="text-sm text-gray-400">Orders: {dish.numberOfOrders}</p>
        
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${chipColorClass} mr-4`}
        >
          {dish.category.replace(/_/g, " ").toUpperCase()}
        </span>
      </div>

      {/* Category Chip */}

      {/* Action Icons */}
      <div className="flex items-center space-x-2 gap-6">
        {onEdit && (
          <button
            onClick={() => onEdit(dish._id)} // Pass dish ID to edit handler
            className="text-blue-500 hover:text-blue-700 transition-colors"
            aria-label={`Edit ${dish.name}`}
          >
            <FaEdit size={20} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(dish._id)} // Pass dish ID to delete handler
            className="text-red-500 hover:text-red-700 transition-colors"
            aria-label={`Delete ${dish.name}`}
          >
            <FaTrash size={20} />
          </button>
        )}
        <p className="text-lg font-bold text-yellow-400">
          ₹{dish.price ? dish.price.toFixed(2) : "N/A"}
        </p>
      </div>
    </div>
  );
};

export default DishCard;
