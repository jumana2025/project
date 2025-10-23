import React, { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [userId, setUserId] = useState(null);

    // Load cart when user is available
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUserId(storedUser.id);
            const savedCart = localStorage.getItem(`cart_${storedUser.id}`);
            setCart(savedCart ? JSON.parse(savedCart) : []);
        }
    }, []);

    // Persist cart whenever it changes
    useEffect(() => {
        if (userId !== null) {
            localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
        }
    }, [cart, userId]);

    // Add product to cart
    const addToCart = (product, quantity = 1) => {
        if (!userId) {
            toast.warning("Please Login First!");
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                toast.info(`Increased quantity of ${product.name}`)
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                toast.success(`${product.name} added to cart`);
                return [...prev, { ...product, quantity }];
            }
        });
    };

    // Remove product from cart
    const removeFromCart = (id) => {
        const item = cart.find(i => i.id === id);
        if (item) toast.error(`${item.name} removed from cart`)
        setCart(prev => prev.filter(item => item.id !== id));
    };

    // Update quantity
    const updateQuantity = (id, quantity) => {
        if (quantity < 1) return;
        const item = cart.find(i => i.id === id);
        if (item) toast.info(`Updated quantity of ${item.name}`);
        setCart(prev =>
            prev.map(item => (item.id === id ? { ...item, quantity } : item))
        );
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                cartCount: cart.reduce((total, item) => total + item.quantity, 0),
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
