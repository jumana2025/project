import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const SearchResults = () => {
    const location = useLocation();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get("q") || "";
        setQuery(q);

        if (q.trim() !== "") {
            setLoading(true);

            const urls = [
                "http://localhost:5000/products",
                "http://localhost:5000/rings",
                "http://localhost:5000/bracelets",
                "http://localhost:5000/necklaces",
                "http://localhost:5000/earrings",
            ];

            Promise.all(urls.map((url) => axios.get(url)))
                .then((responses) => {
                    const allProducts = responses.flatMap((res) => res.data);

                    const filtered = allProducts.filter((item) => {
                        const name = item.name || item.title || "";
                        return name.toLowerCase().includes(q.toLowerCase());
                    });

                    setResults(filtered);
                })
                .catch((err) => console.error("Search error:", err))
                .finally(() => setLoading(false));
        } else {
            setResults([]);
            setLoading(false);
        }
    }, [location.search]);

    if (loading) return <p className="p-4">Loading...</p>;

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">
                Search Results for: <span className="text-blue-600">{query}</span>
            </h1>

            {results.length === 0 ? (
                <p>No products found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {results.map((product) => (
                        <div key={product.id} className="border p-4 rounded shadow">
                            <img
                                src={product.image}
                                alt={product.name || product.title}
                                className="w-full h-48 object-cover mb-2"
                            />
                            <h2 className="text-lg font-semibold">
                                {product.name || product.title}
                            </h2>
                            <p className="text-gray-600">₹{product.price}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchResults;
