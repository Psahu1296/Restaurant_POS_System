// components/AddDishModal.jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdClose } from 'react-icons/io';
import { useMutation, useQueryClient } from '@tanstack/react-query'; // Import useQueryClient
import { enqueueSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { addDish, updateDish } from '../../https'; // Ensure updateDish is imported

// Define your constants for dish types and categories
const DISH_TYPES = [
  'starter',
  'main_course',
  'dessert',
  'beverage',
  'bread',
  'soup',
  'salad',
];

const DISH_CATEGORIES = [
  'veg',
  'non_veg',
  'egg',
];

// Define the shape of the data for a dish (from your backend schema)
// This is for clarity; remember it's JavaScript so it's not strictly enforced at runtime
// but helps in understanding the data structure.
// _id is for existing dishes (edit mode)
const DISH_DATA_SHAPE = {
  _id: null, // Only present when editing
  image: '',
  name: '',
  price: 0,
  type: 'main_course',
  category: 'veg',
  description: '',
  isAvailable: true,
  isFrequent: false,
  numberOfOrders: 0, // This field is typically managed by the backend
};

const AddDishModal = ({ isOpen, onClose, onDishAdded, dish = null }) => {
  const queryClient = useQueryClient(); // Get the query client instance

  // Determine if it's an edit operation
  const isEditMode = !!dish;
  const modalTitle = isEditMode ? "Edit Dish" : "Add New Dish";
  const submitButtonText = isEditMode ? "Update Dish" : "Add Dish";

  // react-hook-form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting }, // Renamed isSubmitting from useForm
  } = useForm({
    // Set default values based on whether a dish prop is provided
    defaultValues: isEditMode ? {
      // Use the dish data, but provide fallbacks in case a field is missing from `dish`
      image: dish.image || '',
      name: dish.name || '',
      price: dish.price || 0,
      type: dish.type || 'main_course',
      category: dish.category || 'veg',
      description: dish.description || '',
      isAvailable: dish.isAvailable !== undefined ? dish.isAvailable : true,
      isFrequent: dish.isFrequent !== undefined ? dish.isFrequent : false,
    } : {
      image: '',
      name: '',
      price: 0,
      type: 'main_course',
      category: 'veg',
      description: '',
      isAvailable: true,
      isFrequent: false,
    },
  });

  // TanStack Query mutation for adding a dish
  const addDishMutation = useMutation({
    mutationFn: (dishData) => addDish(dishData),
    onSuccess: (res) => {
      enqueueSnackbar(res.message || "Dish added successfully!", { variant: "success" });
      queryClient.invalidateQueries(['dishes']); // Invalidate dishes list
      reset(); // Reset form fields on success
      onClose(); // Close the modal
      onDishAdded && onDishAdded(); // Trigger optional callback
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "Failed to add dish. Please try again.";
      enqueueSnackbar(errorMessage, { variant: "error" });
      console.error("Add Dish Error:", error);
    },
  });

  // TanStack Query mutation for updating a dish
  const {
    mutate: updateDishMutation,
    isPending: isUpdating, // Renamed for clarity in loading state
    data: updatedDishData,
    error: updateError,
  } = useMutation({
    mutationFn: ({ id, updates }) => updateDish(id, updates), // Correctly call your API function
    onSuccess: (data) => {
      enqueueSnackbar(data.message || "Dish updated successfully!", { variant: "success" });
      queryClient.invalidateQueries(['dishes']); // Invalidate the dishes list to re-fetch
      onClose(); // Close the modal
      onDishAdded && onDishAdded(); // Trigger optional callback
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "Failed to update dish.";
      enqueueSnackbar(errorMessage, { variant: "error" });
      console.error("Update Dish Error:", error);
    },
  });

  // Handle form submission based on whether it's an add or edit operation
  const onSubmit = (data) => {
    if (isEditMode) {
      updateDishMutation({ id: dish._id, updates: data }); // Pass dish._id and all form data as updates
    } else {
      addDishMutation.mutate(data); // Trigger add mutation
    }
  };

  // Effect to reset form when modal opens or when `dish` prop changes (for edit mode)
  useEffect(() => {
    if (isOpen) {
      // When opening, either prefill with dish data or reset to defaults
      if (isEditMode && dish) {
        // Use reset with the actual dish data
        reset({
          image: dish.image || '',
          name: dish.name || '',
          price: dish.price || 0,
          type: dish.type || 'main_course',
          category: dish.category || 'veg',
          description: dish.description || '',
          isAvailable: dish.isAvailable !== undefined ? dish.isAvailable : true,
          isFrequent: dish.isFrequent !== undefined ? dish.isFrequent : false,
        });
      } else {
        reset(); // Reset to default values for add mode
      }
    }
  }, [isOpen, dish, isEditMode, reset]); // Add dish to dependency array

  // Combine loading states for the submit button
  const isActionPending = isFormSubmitting || addDishMutation.isPending || isUpdating;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-[#262626] p-6 rounded-lg shadow-lg w-full max-w-lg mx-auto border border-[#333] max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[#f5f5f5] text-xl font-semibold">{modalTitle}</h2>
              <button
                onClick={onClose}
                className="text-[#f5f5f5] hover:text-red-500 transition-colors"
              >
                <IoMdClose size={24} />
              </button>
            </div>

            {/* Modal Body - Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              {/* Dish Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-[#ababab] mb-1 text-sm font-medium"
                >
                  Dish Name
                </label>
                <input
                  type="text"
                  id="name"
                  {...register("name", { required: "Dish name is required" })}
                  className="w-full rounded-lg p-3 px-4 bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Image URL */}
              <div>
                <label
                  htmlFor="image"
                  className="block text-[#ababab] mb-1 text-sm font-medium"
                >
                  Image URL
                </label>
                <input
                  type="url"
                  id="image"
                  {...register("image", {
                    required: "Image URL is required",
                    pattern: {
                      value:
                        /^https?:\/\/.+\.(png|jpg|jpeg|gif|svg|webp|avif)$/i,
                      message:
                        "Must be a valid image URL (png, jpg, jpeg, gif, svg, webp, avif)",
                    },
                  })}
                  className="w-full rounded-lg p-3 px-4 bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                {errors.image && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.image.message}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <label
                  htmlFor="price"
                  className="block text-[#ababab] mb-1 text-sm font-medium"
                >
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  step="0.01"
                  {...register("price", {
                    required: "Price is required",
                    min: {
                      value: 0.01,
                      message: "Price must be greater than 0",
                    },
                    valueAsNumber: true, // Converts input string to number
                  })}
                  className="w-full rounded-lg p-3 px-4 bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                {errors.price && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>

              {/* Type (Select) */}
              <div>
                <label
                  htmlFor="type"
                  className="block text-[#ababab] mb-1 text-sm font-medium"
                >
                  Dish Type
                </label>
                <select
                  id="type"
                  {...register("type", { required: "Dish type is required" })}
                  className="w-full rounded-lg p-3 px-4 bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none pr-8"
                >
                  <option value="" disabled>
                    Select a type
                  </option>
                  {DISH_TYPES.map((type) => (
                    <option
                      key={type}
                      value={type}
                      className="bg-[#262626] text-white"
                    >
                      {type
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (char) => char.toUpperCase())}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.type.message}
                  </p>
                )}
              </div>

              {/* Category (Select) */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-[#ababab] mb-1 text-sm font-medium"
                >
                  Category
                </label>
                <select
                  id="category"
                  {...register("category", {
                    required: "Category is required",
                  })}
                  className="w-full rounded-lg p-3 px-4 bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none pr-8"
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {DISH_CATEGORIES.map((category) => (
                    <option
                      key={category}
                      value={category}
                      className="bg-[#262626] text-white"
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Description (Optional) */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-[#ababab] mb-1 text-sm font-medium"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  rows="3"
                  {...register("description")}
                  className="w-full rounded-lg p-3 px-4 bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-y"
                ></textarea>
              </div>

              {/* isAvailable Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  {...register("isAvailable")}
                  className="h-4 w-4 text-yellow-400 rounded border-gray-600 focus:ring-yellow-500 bg-[#1f1f1f]"
                />
                <label
                  htmlFor="isAvailable"
                  className="ml-2 block text-sm text-[#f5f5f5]"
                >
                  Available for Order
                </label>
              </div>

              {/* isFrequent Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFrequent"
                  {...register("isFrequent")}
                  className="h-4 w-4 text-yellow-400 rounded border-gray-600 focus:ring-yellow-500 bg-[#1f1f1f]"
                />
                <label
                  htmlFor="isFrequent"
                  className="ml-2 block text-sm text-[#f5f5f5]"
                >
                  Frequently Ordered (e.g., Tea/Coffee)
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isActionPending}
                className="w-full rounded-lg mt-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isActionPending ? (isEditMode ? "Updating Dish..." : "Adding Dish...") : submitButtonText}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddDishModal;