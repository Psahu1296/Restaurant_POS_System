import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addItems } from "../../redux/slices/cartSlice";
import { FaShoppingCart } from "react-icons/fa";
const MenuItem = ({ item }) => {
  const [itemCount, setItemCount] = useState(0);
  const [itemId, setItemId] = useState(null);
  const dispatch = useDispatch();

  const increment = (id) => {
    console.log(id);
    setItemId(id);
    setItemCount((prev) => prev + 1);
  };

  const decrement = (id) => {
    setItemId(id);
    if (itemCount <= 0) return;
    setItemCount((prev) => prev - 1);
  };

  const handleAddToCart = (item) => {
    if (itemCount === 0) return;

    const { name, price } = item;
    const newObj = {
      id: item._id,
      name,
      pricePerQuantity: price,
      quantity: itemCount,
      price: price * itemCount,
    };

    dispatch(addItems(newObj));
    setItemCount(0);
  };
  return (
    <div
      key={item._id}
      className={`${
        item.isAvailable
          ? ""
          : "pointer-events-none bg-red-700/10"
      } flex flex-col items-start justify-between p-4 min-w-[280px] rounded-lg h-[150px] cursor-pointer hover:bg-[#2a2a2a] bg-[#1a1a1a]`}
    >
      <div className="flex items-start justify-between w-full">
        <h1 className="text-[#f5f5f5] text-lg font-semibold">{item.name}</h1>
        <button
          onClick={() => handleAddToCart(item)}
          className="bg-[#2e4a40] text-[#02ca3a] p-2 rounded-lg"
        >
          <FaShoppingCart size={20} />
        </button>
      </div>
      <div className="flex items-center justify-between w-full">
        <p className="text-[#f5f5f5] text-xl font-bold">₹ {item.price}</p>
        <div className="flex items-center justify-between bg-[#1f1f1f] px-4 py-3 rounded-lg gap-6 w-[50%]">
          <button
            onClick={() => decrement(item._id)}
            className="text-yellow-500 text-2xl"
          >
            &minus;
          </button>
          <span className="text-white">{itemCount}</span>
          <button
            onClick={() => increment(item._id)}
            className="text-yellow-500 text-2xl"
          >
            &#43;
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
