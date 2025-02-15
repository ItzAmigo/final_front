// src/pages/ProductDetail.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProduct } from '../services/api'
import useCartStore from '../store/cartStore'

const ProductDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [quantity, setQuantity] = useState(1)

    const addToCart = useCartStore(state => state.addItem)

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true)
                console.log('Fetching product with ID:', id)
                const data = await getProduct(id)
                console.log('Received product data:', data)
                setProduct(data)
            } catch (err) {
                console.error('Error fetching product:', err)
                setError(err.error || 'Failed to load product')
            } finally {
                setLoading(false)
            }
        }

        fetchProduct()
    }, [id])

    const handleAddToCart = () => {
        if (product) {
            addToCart({ ...product, quantity })
            // Опционально: показать уведомление об успешном добавлении
            navigate('/cart')
        }
    }

    if (loading) return <div className="text-center">Loading...</div>
    if (error) return <div className="alert alert-danger">{error}</div>
    if (!product) return <div className="text-center">Product not found</div>

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-md-6">
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="img-fluid rounded"
                    />
                </div>
                <div className="col-md-6">
                    <h2>{product.name}</h2>
                    <p className="text-muted">{product.category}</p>
                    <p className="h4 mb-4">₸{product.price.toLocaleString()}</p>
                    <p>{product.description}</p>

                    <div className="mb-4">
                        <label className="form-label">Quantity</label>
                        <div className="input-group" style={{ maxWidth: '150px' }}>
                            <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                className="form-control text-center"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                min="1"
                            />
                            <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => setQuantity(quantity + 1)}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleAddToCart}
                        disabled={!product.stock}
                    >
                        Add to Cart
                    </button>

                    {!product.stock && (
                        <p className="text-danger mt-2">Out of stock</p>
                    )}

                    <div className="mt-4">
                        <h5>Product Details</h5>
                        <ul className="list-unstyled">
                            <li><strong>Category:</strong> {product.category}</li>
                            <li><strong>Stock:</strong> {product.stock} units</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetail