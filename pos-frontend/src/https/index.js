import { axiosWrapper } from "./axiosWrapper";

// API Endpoints

// Auth Endpoints
export const login = (data) => axiosWrapper.post("/api/user/login", data);
export const register = (data) => axiosWrapper.post("/api/user/register", data);
export const getUserData = () => axiosWrapper.get("/api/user");
export const logout = () => axiosWrapper.post("/api/user/logout");

// Table Endpoints
export const addTable = (data) => axiosWrapper.post("/api/table/", data);
export const getTables = () => axiosWrapper.get("/api/table");
export const updateTable = ({ tableId, ...tableData }) =>
  axiosWrapper.put(`/api/table/${tableId}`, tableData);

// Payment Endpoints
export const createOrderRazorpay = (data) =>
  axiosWrapper.post("/api/payment/create-order", data);
export const verifyPaymentRazorpay = (data) =>
  axiosWrapper.post("/api/payment//verify-payment", data);

// Order Endpoints
export const addOrder = (data) => axiosWrapper.post("/api/order/", data);
export const getOrders = () => axiosWrapper.get("/api/order");
export const updateOrderStatus = ({ orderId, orderStatus ,paymentStatus }) =>
  axiosWrapper.put(`/api/order/${orderId}`, { orderStatus, paymentStatus });
export const updatePaymentStatus = ({ orderId, paymentStatus }) =>
  axiosWrapper.put(`/api/order/${orderId}`, { paymentStatus });

// Dishes Endpoints
export const addDish = (data) => axiosWrapper.post("/api/dishes/", data);
export const getDishes = () => axiosWrapper.get("/api/dishes");
export const updateDish = (dishId, dishData) =>
  axiosWrapper.put(`/api/dishes/${dishId}`, dishData);
export const deleteDish = (dishId) => axiosWrapper.delete(`/api/dishes/${dishId}`);
export const getFrequentDishes = () => axiosWrapper.get(`/api/dishes/frequent`);

// Earnings
export const getDailyEarnings = () => axiosWrapper.get(`/api/earnings/daywise`);
// param   periodType: 'day', 'week', 'month', 'year'
export const getPeriodEarnings = (periodType) => axiosWrapper.get(`/api/earnings/${periodType}`);

