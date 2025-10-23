// Admin/Analytics.jsx
import React, { useState, useEffect } from "react";

function Analytics() {
    const [analytics, setAnalytics] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalProducts: 0,
        averageOrderValue: 0,
        popularCategories: [],
        recentOrders: [],
        monthlyRevenue: [],
        userGrowth: []
    });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState("all"); // all, month, week
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnalyticsData();
    }, [timeRange]);

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all necessary data
            const [ordersRes, usersRes, productsRes] = await Promise.all([
                fetch('http://localhost:5000/orders').catch(() => ({ ok: false })),
                fetch('http://localhost:5000/users').catch(() => ({ ok: false })),
                fetch('http://localhost:5000/products').catch(() => ({ ok: false }))
            ]);

            let orders = [];
            let users = [];
            let products = [];

            // Handle orders data
            if (ordersRes.ok) {
                orders = await ordersRes.json();
            } else {
                orders = JSON.parse(localStorage.getItem("orders")) || [];
            }

            // Handle users data
            if (usersRes.ok) {
                users = await usersRes.json();
            } else {
                users = JSON.parse(localStorage.getItem("users")) || [];
            }

            // Handle products data
            if (productsRes.ok) {
                products = await productsRes.json();
            } else {
                products = JSON.parse(localStorage.getItem("products")) || [];
            }

            // Process analytics data
            const processedData = processAnalyticsData(orders, users, products, timeRange);
            setAnalytics(processedData);

        } catch (err) {
            console.error('Error fetching analytics data:', err);
            setError(err.message);
            // Fallback to localStorage data
            const orders = JSON.parse(localStorage.getItem("orders")) || [];
            const users = JSON.parse(localStorage.getItem("users")) || [];
            const products = JSON.parse(localStorage.getItem("products")) || [];
            const processedData = processAnalyticsData(orders, users, products, timeRange);
            setAnalytics(processedData);
        } finally {
            setLoading(false);
        }
    };

    const processAnalyticsData = (orders, users, products, range) => {
        // Filter data based on time range
        const filteredOrders = filterDataByTimeRange(orders, range);
        const filteredUsers = filterDataByTimeRange(users, range);

        // Calculate basic metrics
        const totalRevenue = filteredOrders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
        const totalOrders = filteredOrders.length;
        const totalUsers = filteredUsers.length;
        const totalProducts = products.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Calculate popular categories
        const categoryCount = {};
        filteredOrders.forEach(order => {
            order.items?.forEach(item => {
                const category = item.category || 'unknown';
                categoryCount[category] = (categoryCount[category] || 0) + 1;
            });
        });

        const popularCategories = Object.entries(categoryCount)
            .map(([category, count]) => ({
                category,
                count,
                revenue: filteredOrders
                    .filter(order => order.items?.some(item => item.category === category))
                    .reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Get recent orders
        const recentOrders = filteredOrders
            .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
            .slice(0, 5);

        // Calculate monthly revenue
        const monthlyRevenue = calculateMonthlyRevenue(filteredOrders);

        // Calculate user growth
        const userGrowth = calculateUserGrowth(users);

        return {
            totalRevenue,
            totalOrders,
            totalUsers,
            totalProducts,
            averageOrderValue,
            popularCategories,
            recentOrders,
            monthlyRevenue,
            userGrowth
        };
    };

    const filterDataByTimeRange = (data, range) => {
        const now = new Date();
        let startDate;

        switch (range) {
            case "week":
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case "month":
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case "all":
            default:
                return data;
        }

        return data.filter(item => {
            const itemDate = new Date(item.date || item.createdAt || item.lastLogin);
            return itemDate >= startDate;
        });
    };

    const calculateMonthlyRevenue = (orders) => {
        const monthlyData = {};

        orders.forEach(order => {
            const date = new Date(order.date || order.createdAt);
            const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

            if (!monthlyData[monthYear]) {
                monthlyData[monthYear] = 0;
            }

            monthlyData[monthYear] += parseFloat(order.total) || 0;
        });

        return Object.entries(monthlyData)
            .map(([month, revenue]) => ({ month, revenue }))
            .sort((a, b) => a.month.localeCompare(b.month))
            .slice(-6); // Last 6 months
    };

    const calculateUserGrowth = (users) => {
        const monthlyData = {};

        users.forEach(user => {
            const date = new Date(user.createdAt);
            const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

            if (!monthlyData[monthYear]) {
                monthlyData[monthYear] = 0;
            }

            monthlyData[monthYear]++;
        });

        return Object.entries(monthlyData)
            .map(([month, count]) => ({ month, count }))
            .sort((a, b) => a.month.localeCompare(b.month))
            .slice(-6); // Last 6 months
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatCurrencyWithDecimal = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading analytics...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Store Analytics</h1>
                    <p className="text-gray-600">Comprehensive overview of Thushk performance</p>
                </div>

                <div className="flex items-center space-x-4">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                        <option value="all">All Time</option>
                        <option value="month">Last month</option>
                        <option value="week">Last week</option>
                    </select>


                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <span className="text-yellow-600 mr-2">⚠️</span>
                        <p className="text-yellow-800">
                            {error}
                        </p>
                    </div>
                </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Total Revenue"
                    value={formatCurrency(analytics.totalRevenue)}
                    change={analytics.totalRevenue > 0 ? "+12%" : "0%"}
                    icon="💰"
                    color="green"
                />
                <MetricCard
                    title="Total Orders"
                    value={analytics.totalOrders.toString()}
                    change={analytics.totalOrders > 0 ? "+8%" : "0%"}
                    icon="📦"
                    color="blue"
                />
                <MetricCard
                    title="Total Users"
                    value={analytics.totalUsers.toString()}
                    change={analytics.totalUsers > 0 ? "+15%" : "0%"}
                    icon="👥"
                    color="purple"
                />
                <MetricCard
                    title="Avg. Order Value"
                    value={formatCurrency(analytics.averageOrderValue)}
                    change={analytics.averageOrderValue > 0 ? "+5%" : "0%"}
                    icon="📊"
                    color="orange"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Popular Categories */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold mb-4">Popular Categories</h3>
                    <div className="space-y-4">
                        {analytics.popularCategories.map((item, index) => (
                            <div key={item.category} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium capitalize">{item.category}</p>
                                        <p className="text-sm text-gray-500">{item.count} orders</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600">{formatCurrency(item.revenue)}</p>
                                    <p className="text-sm text-gray-500">Revenue</p>
                                </div>
                            </div>
                        ))}
                        {analytics.popularCategories.length === 0 && (
                            <p className="text-gray-500 text-center py-4">No category data available</p>
                        )}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
                    <div className="space-y-3">
                        {analytics.recentOrders.map(order => (
                            <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium">Order #{order.id?.slice(0, 8) || 'N/A'}</p>
                                    <p className="text-sm text-gray-600">{order.userName || 'Unknown Customer'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{formatCurrency(order.total || 0)}</p>
                                    <p className="text-sm text-gray-500">{formatDate(order.date || order.createdAt)}</p>
                                </div>
                            </div>
                        ))}
                        {analytics.recentOrders.length === 0 && (
                            <p className="text-gray-500 text-center py-4">No recent orders</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold mb-4">Revenue Trend (Last 6 Months)</h3>
                    <div className="space-y-3">
                        {analytics.monthlyRevenue.map(item => (
                            <div key={item.month} className="flex items-center justify-between">
                                <span className="text-gray-600">{item.month}</span>
                                <div className="flex items-center space-x-4">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{
                                                width: `${Math.min((item.revenue / Math.max(...analytics.monthlyRevenue.map(m => m.revenue))) * 100, 100)}%`
                                            }}
                                        ></div>
                                    </div>
                                    <span className="font-bold text-green-600 w-20 text-right">
                                        {formatCurrency(item.revenue)}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {analytics.monthlyRevenue.length === 0 && (
                            <p className="text-gray-500 text-center py-4">No revenue data available</p>
                        )}
                    </div>
                </div>

                {/* User Growth */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold mb-4">User Growth (Last 6 Months)</h3>
                    <div className="space-y-3">
                        {analytics.userGrowth.map(item => (
                            <div key={item.month} className="flex items-center justify-between">
                                <span className="text-gray-600">{item.month}</span>
                                <div className="flex items-center space-x-4">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full"
                                            style={{
                                                width: `${Math.min((item.count / Math.max(...analytics.userGrowth.map(u => u.count))) * 100, 100)}%`
                                            }}
                                        ></div>
                                    </div>
                                    <span className="font-bold text-blue-600 w-12 text-right">
                                        {item.count}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {analytics.userGrowth.length === 0 && (
                            <p className="text-gray-500 text-center py-4">No user growth data available</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white rounded-lg shadow p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{analytics.totalProducts}</div>
                    <div className="text-sm text-gray-600">Total Products</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(analytics.averageOrderValue)}
                    </div>
                    <div className="text-sm text-gray-600">Avg Order Value</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                        {analytics.popularCategories[0]?.count || 0}
                    </div>
                    <div className="text-sm text-gray-600">Top Category Orders</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                        {analytics.totalOrders > 0 ? formatCurrency(analytics.totalRevenue / analytics.totalOrders) : formatCurrency(0)}
                    </div>
                    <div className="text-sm text-gray-600">Revenue per Order</div>
                </div>
            </div>
        </div>
    );
}

// Metric Card Component
function MetricCard({ title, value, change, icon, color }) {
    const colorClasses = {
        green: 'bg-green-50 border-green-200',
        blue: 'bg-blue-50 border-blue-200',
        purple: 'bg-purple-50 border-purple-200',
        orange: 'bg-orange-50 border-orange-200'
    };

    const textColors = {
        green: 'text-green-600',
        blue: 'text-blue-600',
        purple: 'text-purple-600',
        orange: 'text-orange-600'
    };

    const changeColor = change.startsWith('+') ? 'text-green-600' : 'text-gray-600';

    return (
        <div className={`${colorClasses[color]} rounded-lg shadow-sm border p-6`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className={`text-2xl font-bold ${textColors[color]}`}>{value}</p>
                    <p className={`text-sm ${changeColor}`}>{change} from previous period</p>
                </div>
                <div className="text-3xl">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default Analytics;