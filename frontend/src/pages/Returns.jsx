import React, { useState, useEffect } from 'react';
import { getReturns } from '../services/api';

const Returns = () => {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReturns = async () => {
            try {
                const response = await getReturns();
                setReturns(response.returns || []);
            } catch (err) {
                setError('Failed to load returns');
            } finally {
                setLoading(false);
            }
        };
        fetchReturns();
    }, []);

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container py-4">
            <h2 className="mb-4">My Returns</h2>
            {returns.length === 0 ? (
                <div className="alert alert-info">No return requests found</div>
            ) : (
                returns.map(returnRequest => (
                    <div key={returnRequest.id} className="card mb-3">
                        <div className="card-header">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Return #{returnRequest.id}</h5>
                                <span className="badge bg-secondary">{returnRequest.status_display}</span>
                            </div>
                        </div>
                        <div className="card-body">
                            <p><strong>Order:</strong> #{returnRequest.order_id}</p>
                            <p><strong>Reason:</strong> {returnRequest.reason}</p>
                            <p><strong>Created:</strong> {new Date(returnRequest.created_at).toLocaleDateString()}</p>
                            <div className="mt-3">
                                <h6>Items:</h6>
                                {returnRequest.items.map((item, index) => (
                                    <div key={index} className="d-flex justify-content-between align-items-center border-bottom py-2">
                                        <div>
                                            <span className="fw-bold">{item.product_name}</span>
                                            <span className="text-muted ms-2">x{item.quantity}</span>
                                        </div>
                                        <span>Condition: {item.condition}</span>
                                    </div>
                                ))}
                            </div>
                            {returnRequest.comments && (
                                <div className="mt-3">
                                    <strong>Comments:</strong>
                                    <p className="mb-0">{returnRequest.comments}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Returns;