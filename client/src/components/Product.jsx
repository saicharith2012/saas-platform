import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for async fetch
  const { user } = useSelector((state) => state.auth);

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
  }, []);

  const addToCart = async (productId) => {
    try {
      if (!user) {
        alert('Please log in to add products to the cart');
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/users/${user._id}/add-to-cart`,
        { productId, quantity: 1 },
        { withCredentials: true }
      );

      alert('Product added to cart successfully!');
    } catch (error) {
      console.error('Error adding product to cart:', error);
      alert('Failed to add product to cart');
    }
  };

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
              <button onClick={() => addToCart(product._id)}>Add to Cart</button>
            </div>
          ))}
        </div>
        
      )}
    </div>
  );
}

export default Products;
