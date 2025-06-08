import React, { useState, useEffect, useMemo } from "react";
import BottomNav from "../components/shared/BottomNav";
import OrderCard from "../components/orders/OrderCard";
import BackButton from "../components/shared/BackButton";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getOrders } from "../https/index";
import { enqueueSnackbar } from "notistack";

const Orders = () => {
  const [status, setStatus] = useState("all");

  useEffect(() => {
    document.title = "POS | Orders";
  }, []);

  const { data: resData, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return await getOrders();
    },
    placeholderData: keepPreviousData,
  });

  if (isError) {
    enqueueSnackbar("Something went wrong!", { variant: "error" });
  }

  const orderList = useMemo(() => {
    let res = [];
    if (!resData?.data) return;
    if (status === "all") {
      res = resData?.data.data;
    } else {
      res = resData?.data.data.filter((order) => order?.orderStatus === status);
      console.log(res);
    }
    return res;
  }, [status, resData]);

  console.log(orderList?.length, resData?.data?.data);
  return (
    <section className="bg-[#1f1f1f]  h-[calc(100vh-5rem)] overflow-hidden">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Orders
          </h1>
        </div>
        <div className="flex items-center justify-around gap-4">
          <button
            onClick={() => setStatus("all")}
            className={`text-[#ababab] text-lg ${
              status === "all" && "bg-[#383838] rounded-lg px-5 py-2"
            }  rounded-lg px-5 py-2 font-semibold`}
          >
            All
          </button>
          <button
            onClick={() => setStatus("In Progress")}
            className={`text-[#ababab] text-lg ${
              status === "progress" && "bg-[#383838] rounded-lg px-5 py-2"
            }  rounded-lg px-5 py-2 font-semibold`}
          >
            In Progress
          </button>
          <button
            onClick={() => setStatus("Ready")}
            className={`text-[#ababab] text-lg ${
              status === "ready" && "bg-[#383838] rounded-lg px-5 py-2"
            }  rounded-lg px-5 py-2 font-semibold`}
          >
            Ready
          </button>
          <button
            onClick={() => setStatus("Complete")}
            className={`text-[#ababab] text-lg ${
              status === "completed" && "bg-[#383838] rounded-lg px-5 py-2"
            }  rounded-lg px-5 py-2 font-semibold`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 px-16 py-4 overflow-y-scroll scrollbar-hide">
        {orderList?.length > 0 ? (
          orderList?.map((order) => {
            return <OrderCard key={order._id} order={order} />;
          })
        ) : (
          <p className="flex-1 text-gray-500">No orders available</p>
        )}
      </div>

      <BottomNav />
    </section>
  );
};

export default Orders;
