// src/context/WishlistContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem("wishlist");
        if (saved) {
            try {
                setWishlist(JSON.parse(saved));
            } catch {
                setWishlist([]);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }, [wishlist]);

    const addToWishlist = (product) => {
        const productId = product.id || product._id;
        const exists = wishlist.some((i) => (i.id || i._id) === productId);

        if (exists) {
            toast.info(`${product.name} is already in your wishlist!`);
            return;
        }

        setWishlist([...wishlist, product]);
        toast.success(`${product.name} added to wishlist!`);
    };

    const removeFromWishlist = (id) => {
        const item = wishlist.find((i) => (i.id || i._id) === id);
        setWishlist((prev) => prev.filter((i) => (i.id || i._id) !== id));
        if (item) toast.error(`${item.name} removed from wishlist!`);
    };

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                addToWishlist,
                removeFromWishlist,
                isInWishlist: (id) =>
                    wishlist.some((i) => (i.id || i._id) === id),
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};
