import React, { createContext } from "react";
import axios from "axios";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
    const addOrder = async (newOrder) => {
        try {
            // ✅ Save to JSON server
            const res = await axios.post("http://localhost:5000/orders", newOrder);
            return res.data;
        } catch (error) {
            console.error("❌ Error adding order:", error);
            throw error;
        }
    };

    return (
        <OrderContext.Provider value={{ addOrder }}>
            {children}
        </OrderContext.Provider>
    );
};
