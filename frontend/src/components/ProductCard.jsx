// src/components/ProductCard.jsx
import React from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import useCartStore from '../store/cartStore'
import useAuthStore from '../store/authStore'  // Добавляем этот импорт

const ProductCard = ({ product }) => {
    const navigate = useNavigate()
    const addToCart = useCartStore(state => state.addItem)
    const { user } = useAuthStore()  // Используем хук для получения пользователя

    const handleAddToCart = (e) => {
        e.stopPropagation()
        console.log('Adding to cart:', product); // Добавить
        if (!user) {
            navigate('/login');
            return;
        }
        addToCart({ ...product, quantity: 1 })
    }

    const handleClick = () => {
        console.log('Navigating to product:', product.id)
        navigate(`/product/${product.id}`)
    }

    return (
        <div
            className="card h-100"
            onClick={handleClick}
            style={{ cursor: 'pointer' }}
        >
            <img
                src={product.image_url}
                className="card-img-top"
                alt={product.name}
                style={{ height: '200px', objectFit: 'cover' }}
            />
            <div className="card-body d-flex flex-column">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text">{product.description}</p>
                <p className="card-text fw-bold">₸{product.price.toLocaleString()}</p>
                <button
                    className="btn btn-primary mt-auto"
                    onClick={handleAddToCart}
                    disabled={!product.stock}
                >
                    {product.stock ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </div>
    )
}

ProductCard.propTypes = {
    product: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        stock: PropTypes.number.isRequired,
        image_url: PropTypes.string.isRequired,
        category: PropTypes.string
    }).isRequired
}

export default ProductCard