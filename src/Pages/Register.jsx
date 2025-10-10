import React, { useState } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirm: "",
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validate = () => {
        const newErrors = {};
        const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

        if (!formData.name) newErrors.name = "Name is required";
        if (!formData.email) newErrors.email = "Email is required";
        else if (!emailPattern.test(formData.email)) newErrors.email = "Invalid email";

        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 8)
            newErrors.password = "Password must be 8+ chars";
        else if (formData.password[0] !== formData.password[0].toUpperCase())
            newErrors.password = "Password must start with uppercase";

        if (!formData.confirm) newErrors.confirm = "Confirm password is required";
        else if (formData.password !== formData.confirm)
            newErrors.confirm = "Passwords do not match";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const res = await axios.get(`http://localhost:5000/users?email=${formData.email}`);
            if (res.data.length > 0) {
                alert("Email already exists!");
                return;
            }

            const newUser = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
            };
            await axios.post("http://localhost:5000/users", newUser);

            // Save user and redirect
            localStorage.setItem("user", JSON.stringify(newUser));
            navigate("/"); // automatically go to Home
        } catch (err) {
            console.error(err);
            alert("Something went wrong! Please try again.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg"
            >
                <h2 className="text-3xl font-bold text-center mb-6">Sign Up</h2>

                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full mb-2 p-2 border rounded focus:outline-none focus:border-blue-500"
                />
                {errors.name && <p className="text-red-600 text-sm mb-2">{errors.name}</p>}

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full mb-2 p-2 border rounded focus:outline-none focus:border-blue-500"
                />
                {errors.email && <p className="text-red-600 text-sm mb-2">{errors.email}</p>}

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full mb-2 p-2 border rounded focus:outline-none focus:border-blue-500"
                />
                {errors.password && <p className="text-red-600 text-sm mb-2">{errors.password}</p>}

                <input
                    type="password"
                    name="confirm"
                    placeholder="Confirm Password"
                    value={formData.confirm}
                    onChange={handleChange}
                    className="w-full mb-2 p-2 border rounded focus:outline-none focus:border-blue-500"
                />
                {errors.confirm && <p className="text-red-600 text-sm mb-2">{errors.confirm}</p>}

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded mt-4 hover:bg-blue-500"
                >
                    Register
                </button>

                <p className="mt-4 text-center text-sm">
                    Already have an account?{" "}
                    <NavLink to="/" className="text-blue-600 hover:underline">
                        Login here
                    </NavLink>
                </p>
            </form>
        </div>
    );
}

export default Register;



