// src/pages/Checkout.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useCartStore from '../store/cartStore'
import useAuthStore from '../store/authStore'
import { createOrder } from '../services/api'

const DELIVERY_METHODS = [
    { id: 'standard', name: 'Standard Delivery', price: 1000, time: '3-5 days' },
    { id: 'express', name: 'Express Delivery', price: 2000, time: '1-2 days' }
]

const Checkout = () => {
    const navigate = useNavigate()
    const { items, totalPrice, clearCart } = useCartStore()
    const { token } = useAuthStore()

    useEffect(() => {
        if (!token) {
            navigate('/login')
            return
        }

        if (!items.length) {
            navigate('/cart')
            return
        }
    }, [token, items, navigate])

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        city: '',
        address: '',
        deliveryMethod: 'standard'
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const selectedDelivery = DELIVERY_METHODS.find(m => m.id === formData.deliveryMethod)
    const finalPrice = totalPrice + (selectedDelivery?.price || 0)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const orderData = {
                items: items.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity
                })),
                shipping_address: `${formData.fullName}, ${formData.phone}, ${formData.city}, ${formData.address}`,
                delivery_method: formData.deliveryMethod,
                total_amount: finalPrice
            }

            console.log('Submitting order:', orderData)
            const response = await createOrder(orderData)
            console.log('Order created:', response)

            clearCart()
            navigate('/orders', { state: { success: true } })
        } catch (err) {
            console.error('Order error:', err)
            setError(err.message || 'Failed to create order')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    if (!token || !items.length) return null

    return (
        <div className="container py-4">
            <h2 className="mb-4">Checkout</h2>

            {error && (
                <div className="alert alert-danger mb-4">
                    {error}
                </div>
            )}

            <div className="row">
                <div className="col-md-8">
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5 className="card-title mb-4">Shipping Information</h5>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">City</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Address</label>
                                    <textarea
                                        className="form-control"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows="3"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">Delivery Method</label>
                                    {DELIVERY_METHODS.map(method => (
                                        <div key={method.id} className="form-check">
                                            <input
                                                type="radio"
                                                className="form-check-input"
                                                name="deliveryMethod"
                                                value={method.id}
                                                checked={formData.deliveryMethod === method.id}
                                                onChange={handleChange}
                                                id={`delivery-${method.id}`}
                                                required
                                            />
                                            <label className="form-check-label" htmlFor={`delivery-${method.id}`}>
                                                {method.name} (₸{method.price.toLocaleString()}) - {method.time}
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Place Order'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title mb-4">Order Summary</h5>
                            {items.map(item => (
                                <div key={item.id} className="d-flex justify-content-between mb-2">
                                    <span>{item.name} x {item.quantity}</span>
                                    <span>₸{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                            <hr />
                            <div className="d-flex justify-content-between mb-2">
                                <span>Subtotal:</span>
                                <span>₸{totalPrice.toLocaleString()}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Delivery:</span>
                                <span>₸{selectedDelivery.price.toLocaleString()}</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between fw-bold">
                                <span>Total:</span>
                                <span>₸{finalPrice.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout