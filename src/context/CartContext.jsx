import React, { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [userId, setUserId] = useState(null);

    // ✅ Load user and cart data on mount - Check both 'user' and 'currentUser'
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("currentUser") || localStorage.getItem("user") || "null");
        if (storedUser) {
            setUserId(storedUser.id);
            const savedCart = localStorage.getItem(`cart_${storedUser.id}`);
            setCart(savedCart ? JSON.parse(savedCart) : []);
        }
    }, []);

    // ✅ Save cart to localStorage when changed
    useEffect(() => {
        if (userId !== null) {
            localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
        }
    }, [cart, userId]);

    // ✅ Add item to cart
    const addToCart = (product, quantity = 1) => {
        // Check both 'currentUser' and 'user' for compatibility
        const storedUser = JSON.parse(localStorage.getItem("currentUser") || localStorage.getItem("user") || "null");

        if (!storedUser) {
            toast.warning("Please login to add items to your cart!", {
                position: "top-right",
            });
            return;
        }

        // Update userId if not set
        if (!userId) {
            setUserId(storedUser.id);
        }

        setCart((prevCart) => {
            const existing = prevCart.find((item) => item.id === product.id);
            if (existing) {
                toast.info(`Increased quantity of ${product.name}`, {
                    position: "top-right",
                });
                return prevCart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                toast.success(`${product.name} added to cart!`, {
                    position: "top-right",
                });
                return [...prevCart, { ...product, quantity }];
            }
        });
    };

    // ✅ Remove item
    const removeFromCart = (id) => {
        const item = cart.find((i) => i.id === id);
        if (item) {
            toast.error(`${item.name} removed from cart`, {
                position: "top-right",
            });
        }
        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    // ✅ Update quantity
    const updateQuantity = (id, quantity) => {
        if (quantity < 1) {
            removeFromCart(id);
            return;
        }

        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === id ? { ...item, quantity } : item
            )
        );
    };

    // ✅ Clear entire cart
    const clearCart = () => {
        setCart([]);
        toast.info("Cart cleared!", {
            position: "top-right",
        });
    };

    // ✅ Calculate total price
    const getCartTotal = () => {
        return cart.reduce((total, item) => {
            const price = item.offerPrice || item.price;
            return total + (parseFloat(price) * item.quantity);
        }, 0);
    };

    // ✅ Update user function for login
    const updateUser = (user) => {
        if (user) {
            setUserId(user.id);
            const savedCart = localStorage.getItem(`cart_${user.id}`);
            setCart(savedCart ? JSON.parse(savedCart) : []);
        } else {
            setUserId(null);
            setCart([]);
        }
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getCartTotal,
                updateUser,
                cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
                cartTotal: getCartTotal(),
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

// Custom hook for easier usage
export const useCart = () => {
    const context = React.useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};