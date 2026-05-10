import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getProducts = (params?: Record<string, string | number>) =>
  api.get('/products', { params }).then((r) => r.data);

export const getProduct = (slug: string) =>
  api.get(`/products/${slug}`).then((r) => r.data);

export const getFeatured = () =>
  api.get('/products/featured').then((r) => r.data);

export const getCategories = () =>
  api.get('/categories').then((r) => r.data);

export const getBrands = () =>
  api.get('/products/brands').then((r) => r.data);

export const getCart = () =>
  api.get('/cart').then((r) => r.data);

export const addToCart = (productId: number, quantity = 1) =>
  api.post('/cart', { productId, quantity }).then((r) => r.data);

export const updateCartItem = (productId: number, quantity: number) =>
  api.patch(`/cart/${productId}`, { quantity }).then((r) => r.data);

export const removeFromCart = (productId: number) =>
  api.delete(`/cart/${productId}`).then((r) => r.data);

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password }).then((r) => r.data);

export const register = (data: { email: string; password: string; name: string; phone?: string }) =>
  api.post('/auth/register', data).then((r) => r.data);

export const getMe = () =>
  api.get('/auth/me').then((r) => r.data);

export const getOrders = () =>
  api.get('/orders').then((r) => r.data);

export const createOrder = (address: string, comment?: string) =>
  api.post('/orders', { address, comment }).then((r) => r.data);

export const getAllOrders = () =>
  api.get('/orders/admin/all').then((r) => r.data);

export const updateOrderStatus = (id: number, status: string) =>
  api.patch(`/orders/${id}/status`, { status }).then((r) => r.data);
