import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        // Load cart from localStorage if exists
        const savedCart = localStorage.getItem("cart");
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Persist cart in localStorage
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    // Add product to cart
    const addToCart = (product, quantity = 1) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                return [...prev, { ...product, quantity }];
            }
        });
    };

    // Remove product from cart
    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    // Update quantity
    const updateQuantity = (id, quantity) => {
        if (quantity < 1) return;
        setCart(prev =>
            prev.map(item => (item.id === id ? { ...item, quantity } : item))
        );
    };

    // Get cart total
    const cartTotal = cart.reduce(
        (acc, item) => acc + Number(item.offerPrice) * Number(item.quantity),
        0
    );

    // Get cart count
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                cartTotal,
                cartCount
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
