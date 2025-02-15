import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus, getAdminReturns, updateReturnStatus } from '../services/api';

const ORDER_STATUSES = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
];

const RETURN_STATUSES = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' }
];

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (activeTab === 'orders') {
            fetchOrders();
        } else {
            fetchReturns();
        }
    }, [activeTab]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await getAllOrders();
            setOrders(response.orders || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchReturns = async () => {
        try {
            setLoading(true);
            const response = await getAdminReturns();
            setReturns(response.returns || []);
        } catch (err) {
            console.error('Error fetching returns:', err);
            setError('Failed to load returns');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, {
                status: newStatus,
                location: 'Almaty Warehouse',
                description: `Order status updated to ${newStatus}`
            });
            await fetchOrders();
        } catch (err) {
            console.error('Error updating order:', err);
            alert('Failed to update order status');
        }
    };

    const handleReturnStatusUpdate = async (returnId, newStatus) => {
        try {
            await updateReturnStatus(returnId, {
                status: newStatus,
                comments: `Return status updated to ${newStatus}`
            });
            await fetchReturns();
        } catch (err) {
            console.error('Error updating return:', err);
            alert('Failed to update return status');
        }
    };

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container py-4">
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        Orders
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'returns' ? 'active' : ''}`}
                        onClick={() => setActiveTab('returns')}
                    >
                        Returns
                    </button>
                </li>
            </ul>

            {activeTab === 'orders' ? (
                <div>
                    <h2 className="mb-4">Admin Panel - Order Management</h2>
                    {orders.length === 0 ? (
                        <div className="alert alert-info">No orders found</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Status</th>
                                    <th>Total Amount</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {orders.map(order => (
                                    <tr key={order.id}>
                                        <td>#{order.id}</td>
                                        <td>{order.shipping_address?.split(',')[0] || 'N/A'}</td>
                                        <td>
                                            <select
                                                className="form-select form-select-sm"
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                            >
                                                {ORDER_STATUSES.map(status => (
                                                    <option key={status.value} value={status.value}>
                                                        {status.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>₸{order.total_amount?.toLocaleString() || 0}</td>
                                        <td>{new Date(order.created_at).toLocaleString()}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => {
                                                    console.log('Order details:', order);
                                                }}
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <h2 className="mb-4">Admin Panel - Returns Management</h2>
                    {returns.length === 0 ? (
                        <div className="alert alert-info">No returns found</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                <tr>
                                    <th>Return ID</th>
                                    <th>Order ID</th>
                                    <th>Status</th>
                                    <th>Reason</th>
                                    <th>Items</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {returns.map(returnReq => (
                                    <tr key={returnReq.id}>
                                        <td>#{returnReq.id}</td>
                                        <td>#{returnReq.order_id}</td>
                                        <td>
                                            <select
                                                className="form-select form-select-sm"
                                                value={returnReq.status}
                                                onChange={(e) => handleReturnStatusUpdate(returnReq.id, e.target.value)}
                                            >
                                                {RETURN_STATUSES.map(status => (
                                                    <option key={status.value} value={status.value}>
                                                        {status.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>{returnReq.reason}</td>
                                        <td>
                                            {returnReq.items.map(item =>
                                                `${item.product_name} (${item.quantity})`
                                            ).join(', ')}
                                        </td>
                                        <td>{new Date(returnReq.created_at).toLocaleString()}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => console.log('Return details:', returnReq)}
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminPanel;