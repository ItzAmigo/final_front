// src/pages/ReturnRequest.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder, createReturn } from '../services/api';

const RETURN_REASONS = [
    'Wrong item received',
    'Item damaged/defective',
    'Item not as described',
    'Changed mind',
    'Other'
];

const ITEM_CONDITIONS = [
    { value: 'new', label: 'New/Unused' },
    { value: 'used', label: 'Used' },
    { value: 'damaged', label: 'Damaged' }
];

const ReturnRequest = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [returnItems, setReturnItems] = useState([]);
    const [reason, setReason] = useState('');
    const [comments, setComments] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await getOrder(orderId);
                setOrder(data);
                // Инициализируем состояние для каждого товара
                setReturnItems(data.items.map(item => ({
                    order_item_id: item.id,
                    product_name: item.product_name,
                    max_quantity: item.quantity,
                    quantity: 0,
                    reason: '',
                    condition: 'used'
                })));
            } catch (err) {
                setError('Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    const handleQuantityChange = (index, value) => {
        const newQuantity = Math.max(0, Math.min(value, returnItems[index].max_quantity));
        setReturnItems(items =>
            items.map((item, i) =>
                i === index ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Проверяем, что хотя бы один товар выбран для возврата
        const itemsToReturn = returnItems.filter(item => item.quantity > 0);
        if (itemsToReturn.length === 0) {
            setError('Please select at least one item to return');
            return;
        }

        if (!reason) {
            setError('Please select a return reason');
            return;
        }

        if (response.return_id) {
            navigate('/returns');  // Add this route
        }

        setSubmitting(true);
        setError(null);

        try {
            await createReturn({
                order_id: orderId,
                reason,
                comments,
                items: itemsToReturn
            });
            navigate('/returns', { state: { success: true } });
        } catch (err) {
            setError(err.message || 'Failed to create return request');
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!order) return <div className="alert alert-warning">Order not found</div>;

    return (
        <div className="container py-4">
            <h2 className="mb-4">Create Return Request</h2>
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0">Order #{orderId}</h5>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <h6>Select Items to Return</h6>
                            {returnItems.map((item, index) => (
                                <div key={index} className="card mb-3">
                                    <div className="card-body">
                                        <div className="row align-items-center">
                                            <div className="col-md-4">
                                                <h6 className="mb-0">{item.product_name}</h6>
                                            </div>
                                            <div className="col-md-2">
                                                <label className="form-label">Quantity</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    min="0"
                                                    max={item.max_quantity}
                                                    value={item.quantity}
                                                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                                                />
                                            </div>
                                            {item.quantity > 0 && (
                                                <>
                                                    <div className="col-md-3">
                                                        <label className="form-label">Condition</label>
                                                        <select
                                                            className="form-select"
                                                            value={item.condition}
                                                            onChange={(e) => setReturnItems(items =>
                                                                items.map((i, idx) =>
                                                                    idx === index ? { ...i, condition: e.target.value } : i
                                                                )
                                                            )}
                                                        >
                                                            {ITEM_CONDITIONS.map(condition => (
                                                                <option key={condition.value} value={condition.value}>
                                                                    {condition.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label className="form-label">Specific Reason</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={item.reason}
                                                            onChange={(e) => setReturnItems(items =>
                                                                items.map((i, idx) =>
                                                                    idx === index ? { ...i, reason: e.target.value } : i
                                                                )
                                                            )}
                                                            placeholder="Optional"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Return Reason</label>
                            <select
                                className="form-select"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                            >
                                <option value="">Select a reason</option>
                                {RETURN_REASONS.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="form-label">Additional Comments</label>
                            <textarea
                                className="form-control"
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                rows="3"
                                placeholder="Optional: Provide any additional information"
                            />
                        </div>

                        <div className="d-flex gap-2">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting}
                            >
                                {submitting ? 'Submitting...' : 'Submit Return Request'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => navigate('/orders')}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReturnRequest;