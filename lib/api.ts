import axios from 'axios';

const isServer = typeof window === 'undefined';
const API_URL = process.env.NEXT_PUBLIC_API_URL || (isServer ? `http://localhost:${process.env.PORT || 3000}/api` : '/api');

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

export const createPaymentOrder = async (
    data: { orderItems?: any[]; shippingAddress?: any; existingOrderId?: string } | number,
    token: string
) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const payload = typeof data === 'number' ? { amount: data } : data;
    const response = await api.post('/payment/create-order', payload, config);
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
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.get('/orders', config);
    return response.data;
};

export const fetchProductById = async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};

export const getAdminUsers = async (token: string) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.get('/admin/users', config);
    return response.data;
};

export const updateUserRole = async (userId: string, token: string) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.put(`/admin/users/${userId}/role`, {}, config);
    return response.data;
};

export const markOrderDelivered = async (orderId: string, token: string) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.put(`/admin/orders/${orderId}/deliver`, {}, config);
    return response.data;
};

export const updateOrderStatus = async (orderId: string, status: string, token: string) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.put(`/admin/orders/${orderId}/status`, { status }, config);
    return response.data;
};

// ── Categories & Subcategories ──────────────────────────────
export const getCategories = async (all = false) => {
    const response = await api.get(`/categories${all ? '?all=true' : ''}`);
    return response.data;
};
export const createCategory = async (name: string, token: string) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.post('/categories', { name }, config);
    return response.data;
};
export const updateCategory = async (id: string, data: { name?: string; isActive?: boolean }, token: string) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.put(`/categories/${id}`, data, config);
    return response.data;
};
export const deleteCategory = async (id: string, token: string) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.delete(`/categories/${id}`, config);
    return response.data;
};
export const getSubcategories = async (categoryId?: string, all = false) => {
    const params = new URLSearchParams();
    if (categoryId) params.set('category', categoryId);
    if (all) params.set('all', 'true');
    const response = await api.get(`/subcategories?${params.toString()}`);
    return response.data;
};
export const createSubcategory = async (name: string, category: string, token: string) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.post('/subcategories', { name, category }, config);
    return response.data;
};
export const updateSubcategory = async (id: string, data: { name?: string; category?: string; isActive?: boolean }, token: string) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.put(`/subcategories/${id}`, data, config);
    return response.data;
};
export const deleteSubcategory = async (id: string, token: string) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.delete(`/subcategories/${id}`, config);
    return response.data;
};

// ── Sizes & Colors ──────────────────────────────
export const getSizes = async (all = false) => {
    const response = await api.get(`/attributes/sizes${all ? '?all=true' : ''}`);
    return response.data;
};
export const createSize = async (name: string, token: string) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.post('/attributes/sizes', { name }, config);
    return response.data;
};
export const updateSize = async (id: string, data: { name?: string; isActive?: boolean }, token: string) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.put(`/attributes/sizes/${id}`, data, config);
    return response.data;
};
export const deleteSize = async (id: string, token: string) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.delete(`/attributes/sizes/${id}`, config);
    return response.data;
};

export const getColors = async (all = false) => {
    const response = await api.get(`/attributes/colors${all ? '?all=true' : ''}`);
    return response.data;
};
export const createColor = async (name: string, hex: string | null, token: string) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.post('/attributes/colors', { name, hex }, config);
    return response.data;
};
export const updateColor = async (id: string, data: { name?: string; hex?: string; isActive?: boolean }, token: string) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.put(`/attributes/colors/${id}`, data, config);
    return response.data;
};
export const deleteColor = async (id: string, token: string) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.delete(`/attributes/colors/${id}`, config);
    return response.data;
};

