import React, { useState, useEffect, useContext } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";

function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Get context functions for updating user state
    const { updateUser: updateCartUser } = useContext(CartContext);
    const { updateUser: updateWishlistUser } = useContext(WishlistContext);

    // ✅ Auto-login if already logged in
    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser");
        const isLoggedIn = localStorage.getItem("isLoggedIn");

        if (storedUser && isLoggedIn === "true") {
            try {
                const user = JSON.parse(storedUser);
                redirectUser(user.role);
            } catch (error) {
                console.error("Error parsing stored user:", error);
                // Clear invalid data
                localStorage.removeItem("currentUser");
                localStorage.removeItem("isLoggedIn");
            }
        }
    }, []);

    // ✅ Input change
    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    // ✅ Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const { email, password } = formData;

        if (!email || !password) {
            toast.warn("Please enter email and password");
            setIsLoading(false);
            return;
        }

        try {
            let allUsers = [];

            // 🔹 Try JSON server users
            try {
                const response = await fetch("http://localhost:5000/users");
                if (response.ok) {
                    const data = await response.json();
                    allUsers = [...allUsers, ...data];
                }
            } catch (err) {
                console.log("⚠️ JSON server not running, using localStorage users only");
            }

            // 🔹 Add localStorage users
            const localUsers = JSON.parse(localStorage.getItem("users") || "[]");
            allUsers = [...allUsers, ...localUsers];

            // 🔍 Find user
            const user = allUsers.find(
                (u) =>
                    u.email?.toLowerCase() === email.toLowerCase() &&
                    u.password === password
            );

            if (!user) {
                toast.error("Invalid email or password");
                setIsLoading(false);
                return;
            }

            // ✅ Login successful
            const userData = {
                id: user.id || user._id,
                name: user.name,
                email: user.email,
                role: user.role || "user",
            };

            // ✅ Save user data
            localStorage.setItem("currentUser", JSON.stringify(userData));
            localStorage.setItem("isLoggedIn", "true");

            // ✅ Update context providers with user data
            if (updateCartUser) updateCartUser(userData);
            if (updateWishlistUser) updateWishlistUser(userData);

            toast.success("🎉 Login successful!");

            // Clear form
            setFormData({ email: "", password: "" });

            setTimeout(() => redirectUser(userData.role), 1500);
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Redirect user based on role
    const redirectUser = (role) => {
        if (role === "admin") {
            navigate("/admin/products");
        } else {
            navigate("/");
        }
    };

    // ✅ Add sample users (optional for testing)
    const addSampleUsers = () => {
        const sampleUsers = [
            {
                id: Date.now().toString(),
                name: "Admin User",
                email: "admin@example.com",
                password: "admin123",
                role: "admin",
            },
            {
                id: (Date.now() + 1).toString(),
                name: "Regular User",
                email: "user@example.com",
                password: "user123",
                role: "user",
            },
        ];

        // Get existing users to avoid duplicates
        const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const newUsers = sampleUsers.filter(
            newUser => !existingUsers.some(existing => existing.email === newUser.email)
        );

        if (newUsers.length > 0) {
            localStorage.setItem("users", JSON.stringify([...existingUsers, ...newUsers]));
            toast.success(`✅ ${newUsers.length} sample user(s) added!`);
        } else {
            toast.info("Sample users already exist!");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center mb-6">Login</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 rounded mt-4 font-medium transition-colors ${isLoading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-pink-500 hover:bg-pink-600"
                            } text-white`}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>

                    <p className="text-center mt-4 text-sm text-gray-600">
                        Don't have an account?{" "}
                        <NavLink
                            to="/register"
                            className="text-pink-500 hover:underline font-medium"
                        >
                            Sign Up
                        </NavLink>
                    </p>





                </form>
            </div >

            <ToastContainer
                position="top-center"
                autoClose={2000}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
                theme="light"
            />
        </div >
    );
}

export default Login;