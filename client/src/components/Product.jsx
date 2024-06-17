import React, { useState, useEffect } from "react";
import axios from "axios";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for async fetch

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products/all");
        setProducts(response.data); // Assuming backend returns an array of products
        setLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false); // Set loading to false on error as well
      }
    };

    fetchProducts();
  }, []); // Empty dependency array ensures useEffect runs only once

  return (
    <div className="products-container" >
      <h2>Our Products</h2>
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="products-list" style={{display: "flex", flexDirection: "row"}}>
          {products.map((product) => (
            <div key={product._id} className="product-item" style={{margin: "5px"}}>
              <h3>{product.name}</h3>
              <p>Price: ₹{product.price}</p>
              {product.imageLink && <img src={product.imageLink} alt={product.name} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;
