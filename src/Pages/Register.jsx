import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirm: ""
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" });
        }
        setMessage("");
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";

        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

        if (!formData.confirm) newErrors.confirm = "Please confirm password";
        else if (formData.password !== formData.confirm) newErrors.confirm = "Passwords do not match";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            // Get existing users from ALL sources
            let allUsers = [];

            // 1. Try JSON Server
            try {
                const response = await fetch("http://localhost:5000/users");
                if (response.ok) {
                    const serverUsers = await response.json();
                    allUsers = [...allUsers, ...serverUsers];
                }
            } catch (error) {
                console.log("Server not available");
            }

            // 2. Try localStorage
            try {
                const localUsers = JSON.parse(localStorage.getItem("users") || "[]");
                allUsers = [...allUsers, ...localUsers];
            } catch (error) {
                console.log("Error reading localStorage");
            }

            // Check if email already exists (case insensitive)
            const existingUser = allUsers.find(user =>
                user.email?.toLowerCase().trim() === formData.email.toLowerCase().trim()
            );

            if (existingUser) {
                setMessage("Email already exists! Please use a different email.");
                return;
            }

            // Create new user
            const newUser = {
                id: Date.now().toString(),
                name: formData.name.trim(),
                email: formData.email.toLowerCase().trim(), // Store email in lowercase
                password: formData.password,
                role: "user",
                createdAt: new Date().toISOString()
            };

            console.log("Registering new user:", newUser);

            // Save to JSON server if available
            try {
                await fetch("http://localhost:5000/users", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newUser),
                });
                console.log("User saved to server");
            } catch (error) {
                console.log("Could not save to server, using localStorage");
            }

            // Always save to localStorage
            const updatedUsers = [...allUsers.filter(u => u.id !== newUser.id), newUser];
            localStorage.setItem("users", JSON.stringify(updatedUsers));

            setMessage("Registration successful! You can now login.");

            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (error) {
            console.error("Registration error:", error);
            setMessage("Registration failed. Please try again.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>

                {message && (
                    <p className={`text-center mb-4 font-medium ${message.includes("successful") ? "text-green-600" : "text-red-600"
                        }`}>
                        {message}
                    </p>
                )}

                <div className="mb-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-400"
                    />
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>

                <div className="mb-4">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-400"
                    />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                <div className="mb-4">
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-400"
                    />
                    {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                </div>

                <div className="mb-6">
                    <input
                        type="password"
                        name="confirm"
                        placeholder="Confirm Password"
                        value={formData.confirm}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-400"
                    />
                    {errors.confirm && <p className="text-red-600 text-sm mt-1">{errors.confirm}</p>}
                </div>

                <button
                    type="submit"
                    className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
                >
                    Create Account
                </button>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <NavLink to="/login" className="text-pink-500 hover:underline font-medium">
                        Sign in here
                    </NavLink>
                </p>
            </form>
        </div>
    );
}

export default Register;