import apiClient from './api';

export const documentService = {
  async getDocuments(params = {}) {
    return apiClient.get('/api/v1/documents', { params });
  },

  async uploadDocument(formData) {
    return apiClient.post('/api/v1/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
