// src/pages/ProductList.jsx
import React, { useState, useEffect } from 'react'
import { getProducts } from '../services/api'
import ProductCard from '../components/ProductCard'

const ProductList = () => {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [filters, setFilters] = useState({
        search: '',
        category: '',
        minPrice: '',
        maxPrice: ''
    })

    const fetchProducts = async () => {
        try {
            setLoading(true)
            setError(null)

            console.log('Fetching with filters:', filters)
            const response = await getProducts(filters)
            console.log('API Response:', response)

            // Проверяем структуру ответа
            if (response && response.products) {
                setProducts(response.products)
                setCategories(response.categories || [])
            } else if (Array.isArray(response)) {
                // Если ответ - просто массив продуктов
                setProducts(response)
            } else {
                throw new Error('Invalid response format')
            }
        } catch (err) {
            console.error('Error fetching products:', err)
            setError('Failed to load products')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [filters])

    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const clearFilters = () => {
        setFilters({
            search: '',
            category: '',
            minPrice: '',
            maxPrice: ''
        })
    }

    if (loading) return <div className="text-center">Loading...</div>
    if (error) return <div className="alert alert-danger">{error}</div>

    // Добавляем отладочный вывод
    console.log('Rendering products:', products)

    return (
        <div className="container">
            <div className="row mb-4">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="card-title mb-0">Filters</h5>
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={clearFilters}
                                >
                                    Clear Filters
                                </button>
                            </div>
                            <div className="row">
                                <div className="col-md-3 mb-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search products..."
                                        name="search"
                                        value={filters.search}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                                <div className="col-md-3 mb-2">
                                    <select
                                        className="form-select"
                                        name="category"
                                        value={filters.category}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-3 mb-2">
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Min price"
                                        name="minPrice"
                                        value={filters.minPrice}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                                <div className="col-md-3 mb-2">
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Max price"
                                        name="maxPrice"
                                        value={filters.maxPrice}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                {!products || products.length === 0 ? (
                    <div className="col-12 text-center">
                        <p>No products found matching your criteria</p>
                    </div>
                ) : (
                    products.map(product => (
                        <div key={product.id} className="col-md-4 mb-4">
                            <ProductCard product={product} />
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default ProductList