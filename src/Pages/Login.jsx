import React, { useState } from "react";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";

function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setMessage("Email and password are required");
            return;
        }

        try {
            const res = await axios.get(
                `http://localhost:5000/users?email=${formData.email.trim()}&password=${formData.password.trim()}`
            );

            if (res.data.length > 0) {
                localStorage.setItem("user", JSON.stringify(res.data[0]));
                setMessage("Login Successful!");
                setTimeout(() => navigate("/"), 1000);
            } else {
                setMessage("Invalid Email or Password");
            }
        } catch (err) {
            console.error(err);
            setMessage("Error logging in");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg"
            >
                <h2 className="text-3xl font-bold text-center mb-6">Login</h2>

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full mb-2 p-2 border rounded focus:outline-none focus:border-blue-500"
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full mb-2 p-2 border rounded focus:outline-none focus:border-blue-500"
                />

                <button className="w-full bg-blue-600 text-white py-2 rounded mt-4 hover:bg-blue-500">
                    Login
                </button>

                {message && (
                    <p
                        className={`mt-3 text-center ${message.includes("Successful") ? "text-green-600" : "text-red-600"
                            }`}
                    >
                        {message}
                    </p>
                )}

                <p className="text-center mt-4 text-sm">
                    Don’t have an account?{" "}
                    <NavLink to="/register" className="text-blue-600 hover:underline">
                        Sign Up
                    </NavLink>
                </p>
            </form>
        </div>
    );
}

export default Login;
