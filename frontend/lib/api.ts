import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const login = async (email: string, password: string) => {
    const response = await api.post('/users/login', { email, password });
    return response.data;
};

export const register = async (name: string, email: string, password: string) => {
    const response = await api.post('/users', { name, email, password });
    return response.data;
};

export const fetchProducts = async () => {
    const response = await api.get('/products');
    return response.data;
};

export const fetchProductBySlug = async (slug: string) => {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data;
};

export const createOrder = async (order: any, token: string) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await api.post('/orders', order, config);
    return response.data;
};

export const createPaymentOrder = async (amount: number, token: string) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await api.post('/payment/create-order', { amount }, config);
    return response.data;
};

export const verifyPayment = async (data: any, token: string) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await api.post('/payment/verify', data, config);
    return response.data;
};

export const fetchMyOrders = async (token: string) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await api.get('/orders/myorders', config);
    return response.data;
};

// Admin APIs

export const getAdminDashboardStats = async (token: string) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await api.get('/admin/dashboard', config);
    return response.data;
};

export const deleteProduct = async (id: string, token: string) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await api.delete(`/products/${id}`, config);
    return response.data;
};

export const createProduct = async (productData: FormData | any, token: string) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    };
    const response = await api.post('/products', productData, config);
    return response.data;
};

export const updateProduct = async (id: string, productData: FormData | any, token: string) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    };
    const response = await api.put(`/products/${id}`, productData, config);
    return response.data;
};

export const getAdminOrders = async (token: string) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await api.get('/orders', config);
    return response.data;
};
