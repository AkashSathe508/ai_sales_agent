import apiClient from './api';

export const customerService = {
  async getCustomers(params = {}) {
    return apiClient.get('/api/v1/customers', { params });
  },

  async getCustomerById(customerId) {
    return apiClient.get(`/api/v1/customers/${customerId}`);
  },
};
