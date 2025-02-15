// src/pages/Orders.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders } from '../services/api';
import useAuthStore from '../store/authStore';

const OrderStatus = ({ status }) => {
    const getStatusColor = () => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-warning';
            case 'confirmed':
                return 'bg-info';
            case 'shipped':
                return 'bg-primary';
            case 'delivered':
                return 'bg-success';
            case 'cancelled':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    };

    return (
        <span className={`badge ${getStatusColor()}`}>
      {status}
    </span>
    );
};

const Orders = () => {
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await getOrders();
                console.log('Orders response:', response);
                setOrders(response.orders || []);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [token, navigate]);

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    if (orders.length === 0) {
        return (
            <div className="text-center">
                <h2>No orders found</h2>
                <p>You haven't placed any orders yet.</p>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <h2 className="mb-4">My Orders</h2>
            {orders.map(order => (
                <div key={order.id} className="card mb-4">
                    <div className="card-header">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="mb-0">Order #{order.id}</h5>
                                <small className="text-muted">
                                    Placed on {new Date(order.created_at).toLocaleDateString()}
                                </small>
                            </div>
                            <OrderStatus status={order.status} />
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-8">
                                <h6 className="mb-3">Order Items:</h6>
                                {order.items.map((item, index) => (
                                    <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                                        <div>
                                            <span className="fw-bold">{item.product_name}</span>
                                            <span className="text-muted ms-2">x{item.quantity}</span>
                                        </div>
                                        <span>₸{(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="col-md-4 border-start">
                                <h6>Order Details</h6>
                                <div className="mb-2">
                                    <strong>Delivery Method:</strong>
                                    <p>{order.delivery_method}</p>
                                </div>
                                <div className="mb-2">
                                    <strong>Shipping Address:</strong>
                                    <p className="mb-0">{order.shipping_address}</p>
                                </div>
                                {order.tracking_number && (
                                    <div className="mb-2">
                                        <strong>Tracking Number:</strong>
                                        <p>{order.tracking_number}</p>
                                    </div>
                                )}
                                {order.estimated_delivery && (
                                    <div className="mb-2">
                                        <strong>Estimated Delivery:</strong>
                                        <p>{new Date(order.estimated_delivery || '').toLocaleDateString()}</p>
                                    </div>
                                )}
                                <div className="mt-3">
                                    <strong>Total Amount:</strong>
                                    <h5 className="mb-0">₸{order.total_amount.toLocaleString()}</h5>
                                </div>
                                {order.status === 'delivered' && (
                                    <div className="mt-3">
                                        <button
                                            className="btn btn-outline-primary"
                                            onClick={() => navigate(`/returns/create/${order.id}`)}
                                        >
                                            Request Return
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Orders;