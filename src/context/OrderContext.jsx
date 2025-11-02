import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);
    const baseURL = "http://localhost:5000/orders"; // JSON Server / Backend URL

    // ✅ Fetch existing orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get(baseURL);
                setOrders(res.data);
            } catch (err) {
                console.error("Error fetching orders:", err);
            }
        };
        fetchOrders();
    }, []);

    // ✅ Add new order
    const addOrder = async (orderData) => {
        try {
            const res = await axios.post(baseURL, orderData);
            setOrders((prev) => [...prev, res.data]);
            return res.data;
        } catch (err) {
            console.error("Error adding order:", err);
            throw err;
        }
    };

    // ✅ Get orders for logged-in user
    const getUserOrders = async (email) => {
        try {
            const res = await axios.get(`${baseURL}?userEmail=${email}`);
            return res.data;
        } catch (err) {
            console.error("Error fetching user orders:", err);
            return [];
        }
    };

    return (
        <OrderContext.Provider value={{ orders, addOrder, getUserOrders }}>
            {children}
        </OrderContext.Provider>
    );
};
