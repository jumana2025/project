import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";


function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen overflow-x-hidden">

            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 text-white text-center overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-amber-400 rounded-b-3xl">
                {/* Optional static background image */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1950&q=80')" }}


                >

                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/40 via-pink-500/30 to-amber-400/20"></div>

                {/* Hero Content */}
                <div className=" max-w-4xl mx-auto z-10 ">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
                        Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-pink-200">Thushk</span>
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-95">
                        Discover premium products curated for your lifestyle
                    </p>
                    <button
                        onClick={() => navigate("/products")}
                        className="bg-white/95 text-gray-800 px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:scale-105 transition-all duration-300 flex items-center  justify-center gap-3 mx-auto shadow-lg hover:shadow-xl backdrop-blur-sm"
                    >
                        Shop Now
                        <FaArrowRight className="transition-transform duration-300" />
                    </button>
                </div>
            </section>

            {/* Featured Product Section */}
            <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800">
                            Featured Collection
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Discover our signature pieces that embody elegance and modern style
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="relative group">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src="https://i.pinimg.com/1200x/97/38/f1/9738f1bcc4bf48d43cf80356f526ef0c.jpg"
                                    alt="Elegant Product"
                                    className="w-full h-[600px] object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg animate-float">
                                    <span className="text-sm font-semibold text-pink-400">Coming Soon...</span>
                                </div>
                            </div>
                            <div className="absolute -z-10 top-4 -left-4 w-24 h-24 bg-gradient-to-r from-amber-200 to-pink-200 rounded-full blur-xl opacity-60 animate-pulse-slow"></div>
                            <div className="absolute -z-10 bottom-4 -right-4 w-32 h-32 bg-gradient-to-r from-rose-200 to-orange-200 rounded-full blur-xl opacity-40 animate-pulse-slower"></div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <span className="inline-block px-4 py-2 bg-gradient-to-r from-amber-500 to-pink-500 text-white text-sm font-semibold rounded-full mb-4">
                                    Summer Collection
                                </span>
                                <h3 className="text-4xl font-bold text-gray-800 mb-4">
                                    Fashion Acessories Set
                                </h3>
                                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                    “Experience elegance and quality with our handcrafted Fashion acessories Set, designed to complement your style effortlessly. Made with premium materials, it combines timeless design with modern sophistication.”.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                    <span>This is our own Product</span>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                    <span>Available in 8 stocks</span>
                                </div>
                            </div>

                            <div className="pt-6">
                                <div className="flex items-baseline gap-4 mb-6">
                                    <span className="text-3xl font-bold text-gray-800">₹ 5000</span>
                                    <span className="text-lg text-gray-500 line-through">₹ 4500</span>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                                        30% OFF
                                    </span>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-slate-50 to-gray-100">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-gray-800">
                        Shop by Category
                    </h2>
                    <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                        Discover our curated collections across different categories
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Rings */}
                        <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                            <div className="relative h-64 sm:h-72 overflow-hidden">
                                <img
                                    src="https://i.pinimg.com/736x/60/84/64/60846433f00da90a15f59c93b5b95a72.jpg"
                                    alt="Rings"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                <div className="absolute bottom-6 left-6 text-white">
                                    <h3 className="text-2xl font-bold mb-2">Ring</h3>
                                    <p className="text-white/90">Elegant designs</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate("/ring")}
                                className="w-full py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center justify-center gap-2 group"
                            >
                                Explore Rings
                                <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                            </button>

                        </div>

                        {/* Bracelets */}
                        <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                            <div className="relative h-64 sm:h-72 overflow-hidden">
                                <img
                                    src="https://i.pinimg.com/736x/54/af/a5/54afa5e3d9cd6b7ee6305d70cbde8724.jpg"
                                    alt="Bracelets"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                <div className="absolute bottom-6 left-6 text-white">
                                    <h3 className="text-2xl font-bold mb-2">Bracelets</h3>
                                    <p className="text-white/90">Stylish collections</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate("/bracelets")}
                                className="w-full py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center justify-center gap-2 group"
                            >
                                Explore Braclets
                                <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                            </button>

                        </div>

                        {/* Necklaces */}
                        <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                            <div className="relative h-64 sm:h-72 overflow-hidden">
                                <img
                                    src="https://i.pinimg.com/1200x/ec/66/c4/ec66c4b39529b17f35ee6ba65edde770.jpg"
                                    alt="Necklaces"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                <div className="absolute bottom-6 left-6 text-white">
                                    <h3 className="text-2xl font-bold mb-2">Necklace</h3>
                                    <p className="text-white/90">Premium style</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate("/necklace")}
                                className="w-full py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center justify-center gap-2 group"
                            >
                                Explore Necklaces
                                <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-white text-center relative overflow-hidden">
                <div className="relative max-w-4xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                        Ready to Start Shopping?
                    </h2>
                    <p className="text-xl mb-10 opacity-95 max-w-2xl mx-auto">
                        Join thousands of satisfied customers and discover your perfect style today
                    </p>
                    <button
                        onClick={() => navigate("/products")}
                        className="bg-white text-gray-800 px-10 py-4 rounded-2xl font-semibold text-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-3"
                    >
                        Browse All Products
                        <FaArrowRight className="transition-transform duration-300" />
                    </button>
                </div>
            </section>

        </div>
    );
}

export default Home;
