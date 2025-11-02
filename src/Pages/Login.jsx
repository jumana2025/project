import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // ✅ Auto-login if already logged in
    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            redirectUser(user.role);
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
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role || "user",
            };

            // ❌ Don't clear all data (keeps wishlist)
            // localStorage.clear();

            // ✅ Remove only login-related keys
            localStorage.removeItem("currentUser");
            localStorage.removeItem("isLoggedIn");

            // ✅ Save user data
            localStorage.setItem("currentUser", JSON.stringify(userData));
            localStorage.setItem("isLoggedIn", "true");

            toast.success("🎉 Login successful!");
            setTimeout(() => redirectUser(userData.role), 1500);
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Something went wrong. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Redirect user based on role
    const redirectUser = (role) => {
        if (role === "admin") navigate("/admin/products");
        else navigate("/");
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

        localStorage.setItem("users", JSON.stringify(sampleUsers));
        toast.success("✅ Sample users added!");
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
                            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-pink-400"
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
                            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-pink-400"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 rounded mt-4 ${isLoading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-pink-500 hover:bg-pink-600"
                            } text-white`}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>

                    <p className="text-center mt-4 text-sm text-gray-600">
                        Don’t have an account?{" "}
                        <NavLink
                            to="/register"
                            className="text-pink-500 hover:underline font-medium"
                        >
                            Sign Up
                        </NavLink>
                    </p>

                    <div className="text-center mt-4">
                        <button
                            type="button"
                            onClick={addSampleUsers}
                            className="text-blue-500 underline text-sm"
                        >
                            Add Sample Users
                        </button>
                    </div>
                </form>
            </div>

            <ToastContainer position="top-center" autoClose={2000} hideProgressBar />
        </div>
    );
}

export default Login;
