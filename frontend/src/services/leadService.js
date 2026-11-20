import apiClient from './api';

export const leadService = {
  async getLeads(params = {}) {
    return apiClient.get('/api/v1/leads', { params });
  },

  async getLeadById(leadId) {
    return apiClient.get(`/api/v1/leads/${leadId}`);
  },
};
