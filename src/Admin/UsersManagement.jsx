// Admin/UsersManagement.jsx
import React, { useState, useEffect } from "react";

function UsersManagement() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState(() => {
        try {
            return localStorage.getItem('admin.users.search') || '';
        } catch (e) {
            return '';
        }
    });
    const [roleFilter, setRoleFilter] = useState(() => {
        try {
            return localStorage.getItem('admin.users.roleFilter') || 'all';
        } catch (e) {
            return 'all';
        }
    });
    const [sortBy, setSortBy] = useState(() => {
        try {
            return localStorage.getItem('admin.users.sortBy') || 'recent';
        } catch (e) {
            return 'recent';
        }
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch users from API
    useEffect(() => {
        fetchUsers();
    }, []);

    // Persist admin users search/filters
    useEffect(() => {
        try {
            localStorage.setItem('admin.users.search', searchTerm);
        } catch (e) {
            // ignore
        }
    }, [searchTerm]);

    useEffect(() => {
        try {
            localStorage.setItem('admin.users.roleFilter', roleFilter);
        } catch (e) {
            // ignore
        }
    }, [roleFilter]);

    useEffect(() => {
        try {
            localStorage.setItem('admin.users.sortBy', sortBy);
        } catch (e) {
            // ignore
        }
    }, [sortBy]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('http://localhost:5000/users');

            if (!response.ok) {
                throw new Error(`Failed to fetch users: ${response.status}`);
            }

            const usersData = await response.json();
            setUsers(usersData);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.message);
            // Fallback to localStorage if API fails
            const savedUsers = JSON.parse(localStorage.getItem("users")) || [];
            setUsers(savedUsers);
        } finally {
            setLoading(false);
        }
    };

    // Update user via API
    const updateUserInAPI = async (userId, updatedData) => {
        try {
            const response = await fetch(`http://localhost:5000/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                throw new Error('Failed to update user');
            }

            return await response.json();
        } catch (err) {
            console.error('Error updating user:', err);
            // Fallback to localStorage
            const savedUsers = JSON.parse(localStorage.getItem("users")) || [];
            const updatedUsers = savedUsers.map(user =>
                user.id === userId ? { ...user, ...updatedData } : user
            );
            localStorage.setItem("users", JSON.stringify(updatedUsers));
            return updatedData;
        }
    };

    // Delete user via API
    const deleteUserInAPI = async (userId) => {
        try {
            const response = await fetch(`http://localhost:5000/users/${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            // Fallback to localStorage
            const savedUsers = JSON.parse(localStorage.getItem("users")) || [];
            const updatedUsers = savedUsers.filter(user => user.id !== userId);
            localStorage.setItem("users", JSON.stringify(updatedUsers));
        }
    };

    // Filter and sort users
    const filteredUsers = users
        .filter(user => {
            const matchesSearch =
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRole = roleFilter === "all" || user.role === roleFilter;

            return matchesSearch && matchesRole;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.name?.localeCompare(b.name);
                case "email":
                    return a.email?.localeCompare(b.email);
                case "role":
                    return a.role?.localeCompare(b.role);
                case "recent":
                    return new Date(b.createdAt) - new Date(a.createdAt);
                default:
                    return 0;
            }
        });

    const toggleUserBlock = async (userId, userName, currentStatus) => {
        if (window.confirm(`Are you sure you want to ${currentStatus ? 'unblock' : 'block'} user "${userName}"?`)) {
            try {
                const updatedUser = await updateUserInAPI(userId, { isBlocked: !currentStatus });

                // Update local state
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user.id === userId ? { ...user, isBlocked: !currentStatus } : user
                    )
                );
            } catch (err) {
                console.error('Error toggling user block:', err);
            }
        }
    };

    const toggleUserActive = async (userId, userName, currentStatus) => {
        if (window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} user "${userName}"?`)) {
            try {
                const updatedUser = await updateUserInAPI(userId, { isActive: !currentStatus });

                // Update local state
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user.id === userId ? { ...user, isActive: !currentStatus } : user
                    )
                );
            } catch (err) {
                console.error('Error toggling user active status:', err);
            }
        }
    };

    const deleteUser = async (userId, userName) => {
        if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
            try {
                await deleteUserInAPI(userId);

                // Update local state
                setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));

                // Close modal if the deleted user is currently selected
                if (selectedUser && selectedUser.id === userId) {
                    setShowUserModal(false);
                    setSelectedUser(null);
                }
            } catch (err) {
                console.error('Error deleting user:', err);
            }
        }
    };

    const viewUserDetails = (user) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    const getUsersStats = () => {
        const totalUsers = users.length;
        const adminUsers = users.filter(user => user.role === "admin").length;
        const regularUsers = users.filter(user => user.role === "user").length;
        const activeUsers = users.filter(user => user.isActive && !user.isBlocked).length;
        const blockedUsers = users.filter(user => user.isBlocked).length;

        return { totalUsers, adminUsers, regularUsers, activeUsers, blockedUsers };
    };

    const stats = getUsersStats();

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
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
                        <p className="mt-4 text-gray-600">Loading users...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error && users.length === 0) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Users</h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchUsers}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Users Management</h1>
                    <p className="text-gray-600">Manage store users and administrators</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon="👥"
                    color="blue"
                />
                <StatCard
                    title="Admins"
                    value={stats.adminUsers}
                    icon="👑"
                    color="purple"
                />
                <StatCard
                    title="Regular Users"
                    value={stats.regularUsers}
                    icon="👤"
                    color="green"
                />
                <StatCard
                    title="Active Users"
                    value={stats.activeUsers}
                    icon="✅"
                    color="green"
                />
                <StatCard
                    title="Blocked Users"
                    value={stats.blockedUsers}
                    icon="🚫"
                    color="red"
                />
            </div>

            {/* Error banner */}
            {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <span className="text-yellow-600 mr-2">⚠️</span>
                        <p className="text-yellow-800">
                            Showing cached data. {error}
                        </p>
                    </div>
                </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Users
                        </label>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Sort By */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sort By
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="recent">Most Recent</option>
                            <option value="name">Name</option>
                            <option value="email">Email</option>
                            <option value="role">Role</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role & Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <UserRow
                                    key={user.id}
                                    user={user}
                                    onView={viewUserDetails}
                                    onBlockToggle={toggleUserBlock}
                                    onDelete={deleteUser}
                                    formatDate={formatDate}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">👥</div>
                        <p className="text-gray-500 text-lg">No users found</p>
                        <p className="text-gray-400">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            {showUserModal && selectedUser && (
                <UserDetailsModal
                    user={selectedUser}
                    onClose={() => setShowUserModal(false)}
                    onActiveToggle={toggleUserActive}
                    onBlockToggle={toggleUserBlock}
                    onDelete={deleteUser}
                    formatDate={formatDate}
                />
            )}
        </div>
    );
}

// User Row Component - With Block and Delete
function UserRow({ user, onView, onBlockToggle, onDelete, formatDate }) {
    if (!user || !user.id || !user.name) {
        return null;
    }

    const getUserInitials = (name) => {
        if (!name) return 'UU';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRandomColor = (str) => {
        if (!str) return 'bg-gray-100 text-gray-600';
        const colors = [
            'bg-blue-100 text-blue-600',
            'bg-green-100 text-green-600',
            'bg-purple-100 text-purple-600',
            'bg-orange-100 text-orange-600',
            'bg-pink-100 text-pink-600',
            'bg-indigo-100 text-indigo-600'
        ];
        const index = str.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const getUserOrders = () => {
        const orders = JSON.parse(localStorage.getItem("orders")) || [];
        return orders.filter(order => order.userEmail === user.email);
    };

    const userOrders = getUserOrders();
    const totalSpent = userOrders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
    const displayId = user.id ? user.id.slice(0, 8) : 'N/A';

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            {/* User Info */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${getRandomColor(user.name)}`}>
                        <span className="font-semibold text-sm">{getUserInitials(user.name)}</span>
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name || 'Unknown User'}</div>
                        <div className="text-sm text-gray-500">ID: {displayId}</div>
                    </div>
                </div>
            </td>

            {/* Contact */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{user.email || 'No email'}</div>
                <div className="text-sm text-gray-500">
                    {userOrders.length} orders • ${totalSpent.toFixed(2)}
                </div>
            </td>

            {/* Role & Status */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="space-y-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                        }`}>
                        {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                    </span>

                    <div className="flex space-x-1">
                        {user.isBlocked ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                🚫 Blocked
                            </span>
                        ) : user.isActive ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✅ Active
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                ⏸️ Inactive
                            </span>
                        )}
                    </div>
                </div>
            </td>

            {/* Joined Date */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(user.createdAt)}
            </td>

            {/* Actions - View, Block, Delete */}
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                    <button
                        onClick={() => onView(user)}
                        className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1 text-sm"
                        title="View User Details"
                    >
                        <span>👁️</span>
                        <span>View</span>
                    </button>

                    <button
                        onClick={() => onBlockToggle(user.id, user.name, user.isBlocked)}
                        className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-1 text-sm ${user.isBlocked
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                    >
                        <span>{user.isBlocked ? '🔓' : '🚫'}</span>
                        <span>{user.isBlocked ? 'Unblock' : 'Block'}</span>
                    </button>

                    {user.role !== 'admin' && (
                        <button
                            onClick={() => onDelete(user.id, user.name)}
                            className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-1 text-sm"
                            title="Delete User"
                        >
                            <span>🗑️</span>
                            <span>Delete</span>
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}

// User Details Modal Component - With Active/Inactive toggle
function UserDetailsModal({ user, onClose, onActiveToggle, onBlockToggle, onDelete, formatDate }) {
    if (!user) return null;

    const getUserOrders = () => {
        const orders = JSON.parse(localStorage.getItem("orders")) || [];
        return orders.filter(order => order.userEmail === user.email);
    };

    const userOrders = getUserOrders();
    const totalSpent = userOrders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
    const averageOrder = userOrders.length > 0 ? totalSpent / userOrders.length : 0;

    const getUserInitials = (name) => {
        if (!name) return 'UU';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-800">User Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* User Profile */}
                    <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                {getUserInitials(user.name)}
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-800">{user.name || 'Unknown User'}</h3>
                            <p className="text-gray-600">{user.email || 'No email'}</p>
                            <p className="text-sm text-gray-500">User ID: {user.id || 'N/A'}</p>
                        </div>
                        <div className="space-y-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                                }`}>
                                {user.role === 'admin' ? '👑 Administrator' : '👤 Regular User'}
                            </span>
                            <div>
                                {user.isBlocked ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                        🚫 Blocked
                                    </span>
                                ) : user.isActive ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        ✅ Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                        ⏸️ Inactive
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <div className="text-xl font-bold text-blue-600">{userOrders.length}</div>
                            <div className="text-sm text-gray-600">Total Orders</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-xl font-bold text-green-600">${totalSpent.toFixed(2)}</div>
                            <div className="text-sm text-gray-600">Total Spent</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <div className="text-xl font-bold text-purple-600">
                                ${averageOrder.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-600">Avg. Order</div>
                        </div>
                    </div>

                    {/* User Management Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <button
                            onClick={() => onActiveToggle(user.id, user.name, user.isActive)}
                            className={`px-4 py-3 rounded-lg transition-colors font-semibold ${user.isActive
                                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                                }`}
                        >
                            {user.isActive ? '⏸️ Deactivate User' : '✅ Activate User'}
                        </button>

                        <button
                            onClick={() => onBlockToggle(user.id, user.name, user.isBlocked)}
                            className={`px-4 py-3 rounded-lg transition-colors font-semibold ${user.isBlocked
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-red-500 hover:bg-red-600 text-white'
                                }`}
                        >
                            {user.isBlocked ? '🔓 Unblock User' : '🚫 Block User'}
                        </button>
                    </div>

                    {/* Delete User Button */}
                    {user.role !== 'admin' && (
                        <div className="mb-6">
                            <button
                                onClick={() => onDelete(user.id, user.name)}
                                className="w-full bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors font-semibold"
                            >
                                🗑️ Delete User Account
                            </button>
                        </div>
                    )}

                    {/* User Information */}
                    <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">Account Information</h4>
                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium">Account Created:</span>
                                <span>{formatDate(user.createdAt)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium">Account Status:</span>
                                <span className={
                                    user.isBlocked ? "text-red-600 font-medium" :
                                        user.isActive ? "text-green-600 font-medium" :
                                            "text-gray-600 font-medium"
                                }>
                                    {user.isBlocked ? "Blocked" : user.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium">User Role:</span>
                                <span className={user.role === 'admin' ? "text-purple-600 font-medium" : "text-blue-600 font-medium"}>
                                    {user.role === 'admin' ? "Administrator" : "Regular User"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">Recent Orders</h4>
                        {userOrders.length > 0 ? (
                            <div className="space-y-3">
                                {userOrders.slice(0, 5).map(order => (
                                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">Order #{order.id ? order.id.slice(0, 8) : 'N/A'}</p>
                                            <p className="text-sm text-gray-600">{order.date || formatDate(order.createdAt) || 'No date'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">${(order.total || 0).toFixed(2)}</p>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {order.status || 'pending'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">No orders found for this user.</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({ title, value, icon, color }) {
    const colorClasses = {
        blue: 'bg-blue-50 border-blue-200',
        green: 'bg-green-50 border-green-200',
        purple: 'bg-purple-50 border-purple-200',
        red: 'bg-red-50 border-red-200',
        yellow: 'bg-yellow-50 border-yellow-200'
    };

    const textColors = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        purple: 'text-purple-600',
        red: 'text-red-600',
        yellow: 'text-yellow-600'
    };

    return (
        <div className={`${colorClasses[color]} rounded-lg shadow-sm border p-4`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className={`text-2xl font-bold ${textColors[color]}`}>{value}</p>
                </div>
                <div className="text-2xl">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default UsersManagement;