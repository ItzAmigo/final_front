// src/components/Navbar.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useCartStore from '../store/cartStore'

const Navbar = () => {
    const { token, user, logout } = useAuthStore()
    const { totalItems, resetCart } = useCartStore()

    const isAdmin = user?.email === 'admin@example.com'

    const handleLogout = () => {
        resetCart(); // Очищаем корзину при выходе
        logout();
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link className="navbar-brand" to="/">Electronics Store</Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        {isAdmin && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/admin">
                                    Admin Panel
                                </Link>
                            </li>
                        )}
                    </ul>
                    <ul className="navbar-nav">
                        {!isAdmin && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/cart">
                                    Cart {totalItems > 0 && `(${totalItems})`}
                                </Link>
                            </li>
                        )}
                        {!token ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">Login</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/register">Register</Link>
                                </li>
                            </>
                        ) : (
                            <>
                                {!isAdmin && (
                                    <>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/orders">My Orders</Link>
                                    </li>
                                    <li className="nav-item">
                                    <Link className="nav-link" to="/returns">My Returns</Link>
                                    </li>
                                    </>
                                )}
                                <li className="nav-item">
                                    <button
                                        className="nav-link btn btn-link"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Navbar