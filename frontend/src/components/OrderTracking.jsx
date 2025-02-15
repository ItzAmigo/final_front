// src/components/OrderTracking.jsx
import React from 'react';

const getStatusStep = (status) => {
    const steps = ['pending', 'confirmed', 'shipped', 'delivered'];
    return steps.indexOf(status) + 1;
};

const OrderTracking = ({ order }) => {
    const currentStep = getStatusStep(order.status);

    return (
        <div className="card">
            <div className="card-body">
                <h5 className="card-title">Delivery Tracking</h5>
                {order.tracking_number && (
                    <p className="text-muted">
                        Tracking Number: {order.tracking_number}
                    </p>
                )}

                <div className="tracking-progress mb-4">
                    <div className="progress" style={{ height: '2px' }}>
                        <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${(currentStep / 4) * 100}%` }}
                        />
                    </div>

                    <div className="d-flex justify-content-between mt-2">
                        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                            <div className="step-dot"></div>
                            <small>Order Placed</small>
                        </div>
                        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                            <div className="step-dot"></div>
                            <small>Confirmed</small>
                        </div>
                        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                            <div className="step-dot"></div>
                            <small>Shipped</small>
                        </div>
                        <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
                            <div className="step-dot"></div>
                            <small>Delivered</small>
                        </div>
                    </div>
                </div>

                {order.delivery_updates?.length > 0 && (
                    <div className="delivery-updates">
                        <h6>Delivery Updates</h6>
                        {order.delivery_updates.map((update, index) => (
                            <div key={index} className="update-item">
                                <small className="text-muted">
                                    {new Date(update.timestamp).toLocaleString()}
                                </small>
                                <p className="mb-1">{update.description}</p>
                                <p className="mb-0 text-muted">{update.location}</p>
                            </div>
                        ))}
                    </div>
                )}

                {order.estimated_delivery && (
                    <div className="mt-3">
                        <strong>Estimated Delivery:</strong>
                        <p>{new Date(order.estimated_delivery).toLocaleDateString()}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderTracking;