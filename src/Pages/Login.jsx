import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";

function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [message, setMessage] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Check login status when page loads
    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser") || localStorage.getItem("user");
        if (storedUser) {
            setIsLoggedIn(true);
            const user = JSON.parse(storedUser);
            redirectUser(user.role);
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        if (!formData.email || !formData.password) {
            setMessage("Email and password are required");
            setIsLoading(false);
            return;
        }

        try {
            // Get users from ALL possible sources
            let users = [];

            // 1. Try JSON Server first
            try {
                const response = await fetch("http://localhost:5000/users");
                if (response.ok) {
                    const serverUsers = await response.json();
                    users = [...users, ...serverUsers];
                    console.log("Users from server:", serverUsers);
                }
            } catch (serverError) {
                console.log("Server not available");
            }

            // 2. Try localStorage 'users'
            try {
                const localUsers = JSON.parse(localStorage.getItem("users") || "[]");
                users = [...users, ...localUsers];
                console.log("Users from localStorage 'users':", localUsers);
            } catch (error) {
                console.log("Error reading localStorage users");
            }

            // 3. Check if there are any registered users at all
            if (users.length === 0) {
                setMessage("No users found. Please register first or add sample users.");
                setIsLoading(false);
                return;
            }

            console.log("All available users:", users);

            // Find user with matching email and password (case insensitive)
            const user = users.find(u => {
                const emailMatch = u.email?.toLowerCase().trim() === formData.email.toLowerCase().trim();
                const passwordMatch = u.password === formData.password;
                console.log(`Checking user: ${u.email}, email match: ${emailMatch}, password match: ${passwordMatch}`);
                return emailMatch && passwordMatch;
            });

            if (user) {
                console.log("Login successful for user:", user);

                // Store user data without password for security
                const userData = {
                    id: user.id,
                    email: user.email,
                    role: user.role || "user",
                    name: user.name
                };

                // Save to both currentUser and user for compatibility
                localStorage.setItem("currentUser", JSON.stringify(userData));
                localStorage.setItem("user", JSON.stringify(userData));
                localStorage.setItem("isLoggedIn", "true");

                setIsLoggedIn(true);
                setMessage("Login Successful!");

                // Redirect based on role
                redirectUser(userData.role);

            } else {
                console.log("Login failed - no matching user found");
                setMessage("Invalid Email or Password. Please check your credentials.");

                // Debug info
                const foundUserByEmail = users.find(u =>
                    u.email?.toLowerCase().trim() === formData.email.toLowerCase().trim()
                );

                if (foundUserByEmail) {
                    console.log("User found by email but password mismatch");
                    console.log("Stored password:", foundUserByEmail.password);
                    console.log("Entered password:", formData.password);
                } else {
                    console.log("No user found with this email");
                    console.log("Available emails:", users.map(u => u.email));
                }
            }
        } catch (err) {
            console.error("Login error:", err);
            setMessage("Error logging in. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Helper function to redirect users based on role
    const redirectUser = (role) => {
        setTimeout(() => {
            if (role === "admin") {
                navigate("/admin/products");
            } else {
                navigate("/");
            }
        }, 1500);
    };

    const handleLogout = () => {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("user");
        localStorage.removeItem("isLoggedIn");
        setIsLoggedIn(false);
        setMessage("You have been logged out");
        navigate("/");
    };

    // Function to add sample users for testing
    const addSampleUsers = () => {
        const sampleUsers = [
            {
                id: Date.now().toString(),
                name: "Admin User",
                email: "admin@example.com",
                password: "admin123",
                role: "admin",
                createdAt: new Date().toISOString()
            },
            {
                id: (Date.now() + 1).toString(),
                name: "Regular User",
                email: "user@example.com",
                password: "user123",
                role: "user",
                createdAt: new Date().toISOString()
            }
        ];

        // Save to localStorage
        const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const updatedUsers = [...existingUsers, ...sampleUsers];
        localStorage.setItem("users", JSON.stringify(updatedUsers));

        // Also try to save to JSON server
        sampleUsers.forEach(async (user) => {
            try {
                await fetch("http://localhost:5000/users", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(user),
                });
            } catch (error) {
                console.log("Could not save to server, using localStorage only");
            }
        });

        setMessage("Sample users added! You can now login with: admin@example.com / admin123 or user@example.com / user123");
    };

    // Function to view all registered users (for debugging)
    const viewAllUsers = () => {
        let allUsers = [];

        // Check localStorage
        try {
            const localUsers = JSON.parse(localStorage.getItem("users") || "[]");
            allUsers = [...allUsers, ...localUsers];
        } catch (error) {
            console.log("Error reading localStorage users");
        }

        // Check JSON server
        try {
            fetch("http://localhost:5000/users")
                .then(res => res.json())
                .then(serverUsers => {
                    allUsers = [...allUsers, ...serverUsers];
                    console.log("All registered users:", allUsers);
                    alert(`Found ${allUsers.length} users:\n${allUsers.map(u => `${u.email} (${u.name})`).join('\n')}`);
                })
                .catch(err => {
                    console.log("Could not fetch from server");
                    alert(`Found ${allUsers.length} users in localStorage:\n${allUsers.map(u => `${u.email} (${u.name})`).join('\n')}`);
                });
        } catch (error) {
            alert(`Found ${allUsers.length} users in localStorage:\n${allUsers.map(u => `${u.email} (${u.name})`).join('\n')}`);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            {!isLoggedIn ? (
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
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-pink-400"
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
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-pink-400"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 rounded mt-4 ${isLoading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-pink-500 hover:bg-pink-600"
                                } text-white transition-colors`}
                        >
                            {isLoading ? "Logging in..." : "Login"}
                        </button>

                        {message && (
                            <p
                                className={`mt-3 text-center font-medium ${message.includes("Successful") || message.includes("added")
                                    ? "text-green-600"
                                    : "text-red-600"
                                    }`}
                            >
                                {message}
                            </p>
                        )}

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


                </div>
            ) : (
                // Logout Section (when already logged in)
                <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
                    <h2 className="text-2xl font-semibold mb-4 text-green-600">
                        ✅ Login Successful!
                    </h2>
                    <p className="mb-6 text-gray-600">
                        You will be redirected shortly...
                    </p>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                        Logout Now
                    </button>
                </div>
            )}
        </div>
    );
}

export default Login;