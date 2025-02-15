// src/pages/Cart.jsx
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useCartStore from '../store/cartStore'
import useAuthStore from '../store/authStore'

const Cart = () => {
    const navigate = useNavigate()
    const { token } = useAuthStore()
    const { items, totalPrice, removeItem, updateQuantity } = useCartStore()

    const handleCheckout = () => {
        if (!token) {
            navigate('/login', { state: { from: '/cart' } })
        } else {
            navigate('/checkout')
        }
    }

    if (items.length === 0) {
        return (
            <div className="text-center">
                <h2>Your cart is empty</h2>
                <Link to="/" className="btn btn-primary mt-3">
                    Continue Shopping
                </Link>
            </div>
        )
    }

    return (
        <div className="container py-4">
            <h2 className="mb-4">Shopping Cart</h2>
            <div className="row">
                <div className="col-md-8">
                    {items.map(item => (
                        <div key={item.id} className="card mb-3">
                            <div className="row g-0">
                                <div className="col-md-4">
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="img-fluid rounded-start"
                                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="col-md-8">
                                    <div className="card-body">
                                        <h5 className="card-title">{item.name}</h5>
                                        <p className="card-text">₸{item.price.toLocaleString()}</p>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="input-group" style={{ width: '150px' }}>
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    type="button"
                                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    className="form-control text-center"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                                                    min="1"
                                                />
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    type="button"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                className="btn btn-outline-danger"
                                                onClick={() => removeItem(item.id)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Order Summary</h5>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Subtotal:</span>
                                    <span>₸{totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Estimated Delivery:</span>
                                    <span>₸1,000</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between fw-bold">
                                    <span>Total:</span>
                                    <span>₸{(totalPrice + 1000).toLocaleString()}</span>
                                </div>
                            </div>
                            <button
                                className="btn btn-primary w-100 mb-2"
                                onClick={handleCheckout}
                            >
                                Proceed to Checkout
                            </button>
                            <Link
                                to="/"
                                className="btn btn-outline-secondary w-100"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cart