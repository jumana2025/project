import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 mt-10">
            <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {/* About */}
                <div>
                    <h3 className="text-white text-lg font-semibold mb-4">About</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/" className="hover:text-white">Our Story</Link></li>
                        <li><Link to="/" className="hover:text-white">Careers</Link></li>
                        <li><Link to="/" className="hover:text-white">Press</Link></li>
                        <li><Link to="/" className="hover:text-white">Blog</Link></li>
                    </ul>
                </div>

                {/* Help */}
                <div>
                    <h3 className="text-white text-lg font-semibold mb-4">Help</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/" className="hover:text-white">Payments</Link></li>
                        <li><Link to="/" className="hover:text-white">Shipping</Link></li>
                        <li><Link to="/" className="hover:text-white">Cancellation & Returns</Link></li>
                        <li><Link to="/" className="hover:text-white">FAQ</Link></li>
                    </ul>
                </div>

                {/* Policy */}
                <div>
                    <h3 className="text-white text-lg font-semibold mb-4">Policy</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/" className="hover:text-white">Return Policy</Link></li>
                        <li><Link to="/" className="hover:text-white">Terms of Use</Link></li>
                        <li><Link to="/" className="hover:text-white">Security</Link></li>
                        <li><Link to="/" className="hover:text-white">Privacy</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h3 className="text-white text-lg font-semibold mb-4">Contact Us</h3>
                    <ul className="space-y-2 text-sm">
                        <li>Email: support@thushk.com</li>
                        <li>Phone: +91 98765 43210</li>
                        <li>Mon - Sat: 9am - 7pm</li>
                        <li><Link to="/contact" className="hover:text-white">Contact Page</Link></li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-gray-700 mt-8 py-4 text-center text-sm">
                © {new Date().getFullYear()} <span className="font-semibold">Thushk</span>. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
