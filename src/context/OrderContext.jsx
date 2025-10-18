import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);
    const baseURL = "http://localhost:5000/orders"; // ✅ JSON Server URL

    // ✅ Load all orders initially (optional — mainly for admin or caching)
    useEffect(() => {
        const fetchAllOrders = async () => {
            try {
                const res = await axios.get(baseURL);
                setOrders(res.data);
            } catch (error) {
                console.error("Failed to load orders:", error);
                setOrders([]);
            }
        };

        fetchAllOrders();
    }, []);

    // ✅ Add new order (POST to JSON Server)
    const addOrder = async (order) => {
        try {
            const res = await axios.post(baseURL, order);
            setOrders((prev) => [...prev, res.data]);
            return res.data;
        } catch (error) {
            console.error("Error adding order:", error);
            throw error;
        }
    };

    // ✅ Get orders for the currently logged-in user (from JSON Server)
    const getUserOrders = async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return [];

        try {
            const res = await axios.get(`${baseURL}?userEmail=${user.email}`);
            return res.data;
        } catch (error) {
            console.error("Failed to fetch user orders:", error);
            return [];
        }
    };

    return (
        <OrderContext.Provider value={{ orders, addOrder, getUserOrders }}>
            {children}
        </OrderContext.Provider>
    );
};
