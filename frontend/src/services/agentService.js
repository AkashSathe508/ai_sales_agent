import apiClient from './api';

const WORKFLOW_TIMEOUT_MS = 240000;

export const agentService = {
  /**
   * Run the multi-agent workflow
   * @param {{ query: string, organizationId?: string, userId?: string, autoApprove?: boolean }} payload
   */
  async runWorkflow(payload) {
    return apiClient.post(
      '/api/v1/agent/run',
      {
        query: String(payload.query || '').trim(),
        organization_id: payload.organization_id ?? payload.organizationId,
        user_id: payload.user_id ?? payload.userId,
        auto_approve: Boolean(payload.auto_approve ?? payload.autoApprove),
      },
      { timeout: WORKFLOW_TIMEOUT_MS }
    );
  },

  /**
   * Retrieve execution details of a specific agent run
   * @param {string} runId
   */
  async getRunStatus(runId) {
    return apiClient.get(`/api/v1/agent/runs/${runId}`);
  },
  async getHealth() {
    return apiClient.get('/health');
  },
};
