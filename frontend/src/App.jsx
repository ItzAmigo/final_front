// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import ReturnRequest from './pages/ReturnRequest'
import AdminPanel from './pages/AdminPanel'
import AdminRoute from './components/AdminRoute'
import Returns from "./pages/Returns.jsx";

function App() {
    return (
        <Router>
            <div className="app">
                <Navbar />
                <div className="container mt-4">
                    <Routes>
                        <Route path="/" element={<ProductList />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/returns/create/:orderId" element={<ReturnRequest />} />
                        <Route path="/returns" element={<Returns />} />

                        <Route
                            path="/admin"
                            element={
                                <AdminRoute>
                                    <AdminPanel />
                                </AdminRoute>
                            }
                        />
                    </Routes>
                </div>
            </div>
        </Router>
    )
}

export default App