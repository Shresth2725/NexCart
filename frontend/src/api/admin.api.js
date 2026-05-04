import api from './axios';

export const adminApi = {
  // Auth Service Admin APIs
  approveSeller: (id) => api.post(`/auth/admin/approveSeller/${id}`),
  rejectSeller: (id) => api.post(`/auth/admin/rejectSeller/${id}`),
  getAllSellers: () => api.get('/auth/admin/getAllSeller'),
  getAllCustomers: () => api.get('/auth/admin/getAllCustomer'),
  getAllUsers: () => api.get('/auth/admin/getAllUser'),
  getUser: (id) => api.get(`/auth/admin/getUser/${id}`),

  // Products Service Admin APIs
  getAllProducts: () => api.get('/products/admin/allProducts'),
  toggleProductStatus: (id) => api.post(`/products/admin/toggleProductStatus/${id}`),
  deleteProduct: (id) => api.delete(`/products/admin/deleteProduct/${id}`),
  getAllReviews: () => api.get('/products/admin/allReviews'),
  deleteReview: (id) => api.delete(`/products/admin/deleteReview/${id}`),

  // Order Service Admin APIs
  getAllOrders: () => api.get('/order/admin/orders'),
  getOrderById: (id) => api.get(`/order/admin/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/order/admin/orders/${id}`, { status }),
};

export default adminApi;
