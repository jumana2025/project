// src/context/WishlistContext.jsx
import React, { createContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

export const WishlistContext = createContext();

const safeParse = (s) => {
    try { return JSON.parse(s); } catch { return null; }
};

const getId = (item) => item && (item.id ?? item._id ?? item.productId ?? null);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [userId, setUserId] = useState(null);

    const getCurrentUserId = useCallback(() => {
        const raw = localStorage.getItem("currentUser") || localStorage.getItem("user");
        const u = safeParse(raw);
        return u ? (u.id ?? u._id ?? null) : null;
    }, []);

    const storageKeyFor = (uid) => `wishlist_${uid}`;

    // Load current user + wishlist on mount
    useEffect(() => {
        const uid = getCurrentUserId();
        setUserId(uid);
        if (uid) {
            const saved = localStorage.getItem(storageKeyFor(uid));
            setWishlist(saved ? safeParse(saved) || [] : []);
        } else {
            setWishlist([]);
        }
    }, [getCurrentUserId]);

    // Sync when storage changes (other tab or login/logout)
    useEffect(() => {
        const onStorage = (e) => {
            // if currentUser changed, reload wishlist for new user
            if (e.key === "currentUser" || e.key === "user" || e.key === null) {
                const uid = getCurrentUserId();
                setUserId(uid);
                if (uid) {
                    const saved = localStorage.getItem(storageKeyFor(uid));
                    setWishlist(saved ? safeParse(saved) || [] : []);
                } else {
                    setWishlist([]);
                }
                return;
            }

            // if wishlist for current user changed elsewhere, sync it
            const expected = userId ? storageKeyFor(userId) : null;
            if (e.key === expected) {
                const saved = localStorage.getItem(expected);
                setWishlist(saved ? safeParse(saved) || [] : []);
            }
        };

        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [getCurrentUserId, userId]);

    // Add item — functional update + immediate localStorage write
    const addToWishlist = (item) => {
        const uid = getCurrentUserId();
        if (!uid) {
            toast.warn("Please log in to add to wishlist", { theme: "colored" });
            return;
        }
        const itemId = getId(item);
        if (!itemId) {
            toast.error("Product missing id", { theme: "colored" });
            return;
        }

        setUserId(uid);

        setWishlist((prev) => {
            // dedupe
            if (prev.some((p) => getId(p) === itemId)) {
                toast.info(`${item.name ?? "Item"} is already in wishlist`, { theme: "colored" });
                return prev;
            }

            const next = [...prev, item];
            try {
                localStorage.setItem(storageKeyFor(uid), JSON.stringify(next));
            } catch (err) {
                console.error("Failed to save wishlist:", err);
            }
            toast.success(`${item.name ?? "Item"} added to wishlist!`, { theme: "colored" });
            return next;
        });
    };

    // Remove item — functional update + immediate write
    const removeFromWishlist = (id) => {
        const uid = getCurrentUserId();
        setWishlist((prev) => {
            const next = prev.filter((p) => getId(p) !== id);
            if (uid) {
                try {
                    localStorage.setItem(storageKeyFor(uid), JSON.stringify(next));
                } catch (err) { }
            }
            return next;
        });
        toast.error("Item removed from wishlist", { theme: "colored" });
    };

    // Clear wishlist for current user
    const clearWishlist = () => {
        const uid = getCurrentUserId();
        if (uid) {
            try { localStorage.removeItem(storageKeyFor(uid)); } catch { }
        }
        setWishlist([]);
        toast.info("Wishlist cleared", { theme: "colored" });
    };

    return (
        <WishlistContext.Provider value={{
            wishlist,
            addToWishlist,
            removeFromWishlist,
            clearWishlist,
            userId
        }}>
            {children}
        </WishlistContext.Provider>
    );
};
