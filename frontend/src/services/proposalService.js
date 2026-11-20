import apiClient from './api';

export const proposalService = {
  async getProposals(params = {}) {
    return apiClient.get('/api/v1/proposals', { params });
  },

  async getProposalById(proposalId) {
    return apiClient.get(`/api/v1/proposals/${proposalId}`);
  },

  async approveProposal(proposalId, payload = {}) {
    return apiClient.post(`/api/v1/proposals/${proposalId}/approve`, payload);
  },

  async rejectProposal(proposalId, reason, reviewer) {
    return apiClient.post(`/api/v1/proposals/${proposalId}/reject`, { reason, reviewer });
  },
};
