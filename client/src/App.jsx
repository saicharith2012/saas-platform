import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Plans from "./pages/Plans";
import LoginForm from "./components/LoginForm.jsx";
import SuperAdminDashboard from "./pages/SuperAdminDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Home from "./pages/Home.jsx";
import Products from "./components/Product.jsx";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { loadUserFromToken } from "./authSlice.js";
import Cart from "./pages/Cart.jsx";


function App() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    if(!user) {
      dispatch(loadUserFromToken())
    }
  }, [dispatch, user])


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/superadmin-dashboard" element={<SuperAdminDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </Router>
  );
}

export default App;
