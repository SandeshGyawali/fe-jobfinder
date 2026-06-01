import { apiFetch } from './apiFetch';

async function json(res) {
  if (!res.ok) {
    let detail = res.statusText;
    try { detail = (await res.json()).detail || detail; } catch {}
    throw new Error(detail);
  }
  return res.json();
}

export const adminApi = {
  // Pipeline triggers
  runLinkScraper: () =>
    apiFetch('/admin/pipelines/link-scraper/run', { method: 'POST' }).then(json),
  runOrchestrator: () =>
    apiFetch('/admin/pipelines/orchestrator/run', { method: 'POST' }).then(json),
  runOrchestratorForCompany: (companyId) =>
    apiFetch(`/admin/pipelines/orchestrator/run-company/${companyId}`, { method: 'POST' }).then(json),
  runOrchestratorForLink: (linkId) =>
    apiFetch(`/admin/pipelines/orchestrator/run-link/${linkId}`, { method: 'POST' }).then(json),

  // Run inspection
  listRuns: (limit = 50) =>
    apiFetch(`/admin/pipelines/runs?limit=${limit}`).then(json),
  getRun: (runId) =>
    apiFetch(`/admin/pipelines/runs/${runId}`).then(json),
  getRunLog: (runId, tail = 200) =>
    apiFetch(`/admin/pipelines/runs/${runId}/log?tail=${tail}`).then(json),
  getRunSummary: (runId) =>
    apiFetch(`/admin/pipelines/runs/${runId}/summary`).then(json),

  // Stats / pickers
  todayStats: ({ companyId, jobLevel, jobType } = {}) => {
    const params = new URLSearchParams();
    if (companyId) params.set('company_id', companyId);
    if (jobLevel) params.set('job_level', jobLevel);
    if (jobType) params.set('job_type', jobType);
    const qs = params.toString();
    return apiFetch(`/admin/stats/today${qs ? `?${qs}` : ''}`).then(json);
  },
  listCompanies: () => apiFetch('/admin/companies').then(json),
  pendingOverview: () => apiFetch('/admin/pending-overview').then(json),
  listLinksForCompany: (companyId) =>
    apiFetch(`/admin/links?company_id=${companyId}`).then(json),
};
