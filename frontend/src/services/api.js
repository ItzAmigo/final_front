// src/services/api.js
import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
})

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        console.log('Request Config:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            data: config.data
        })
        return config
    },
    (error) => {
        console.error('Request error:', error)
        return Promise.reject(error)
    }
)

// Response interceptor
api.interceptors.response.use(
    (response) => {
        console.log('Response:', response.data)
        return response.data
    },
    (error) => {
        console.error('API Error:', error.response?.data || error)
        return Promise.reject(error.response?.data || error)
    }
)

export const login = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials)
        if (response.token) {
            localStorage.setItem('token', response.token)
        }
        return response
    } catch (error) {
        console.error('Login error:', error)
        throw error
    }
}

export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData)
        if (response.token) {
            localStorage.setItem('token', response.token)
        }
        return response
    } catch (error) {
        console.error('Register error:', error)
        throw error
    }
}

export const createOrder = async (orderData) => {
    try {
        console.log('Creating order with data:', orderData)
        const token = localStorage.getItem('token')
        if (!token) {
            throw new Error('No authentication token')
        }
        const response = await api.post('/orders/', orderData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return response
    } catch (error) {
        console.error('Create order error:', error)
        throw error
    }
}

export const getOrder = (id) => api.get(`/orders/${id}`)
export const getProducts = (params) => api.get('/products/', { params })
export const getProduct = (id) => api.get(`/products/${id}`)
export const getOrders = () => api.get('/orders/')
export const getAllOrders = () => api.get('/admin/orders')
export const updateOrderStatus = (orderId, data) => api.post(`/admin/orders/${orderId}/update-status`, data)

export const createReturn = async (returnData) => {
    try {
        const response = await api.post('/returns/', returnData);
        return response;
    } catch (error) {
        console.error('Create return error:', error);
        throw error;
    }
};

export const getReturns = async () => {
    try {
        const response = await api.get('/returns/');
        return response;
    } catch (error) {
        console.error('Get returns error:', error);
        throw error;
    }
};

export const getReturn = async (returnId) => {
    try {
        const response = await api.get(`/returns/${returnId}`);
        return response;
    } catch (error) {
        console.error('Get return error:', error);
        throw error;
    }
};

// Admin Returns API
export const getAdminReturns = async () => {
    try {
        const response = await api.get('/admin/returns');
        return response;
    } catch (error) {
        console.error('Get admin returns error:', error);
        throw error;
    }
};

export const updateReturnStatus = async (returnId, data) => {
    try {
        const response = await api.post(`/admin/returns/${returnId}/update-status`, data);
        return response;
    } catch (error) {
        console.error('Update return status error:', error);
        throw error;
    }
};

export default api