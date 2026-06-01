import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../../utils/adminApi';

export default function LinksAdmin() {
  const [searchParams] = useSearchParams();
  const initialCompanyId = searchParams.get('company_id') || '';
  const initialPendingOnly = searchParams.get('pending') === '1';

  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState(initialCompanyId);
  const [links, setLinks] = useState([]);
  const [search, setSearch] = useState('');
  const [pendingOnly, setPendingOnly] = useState(initialPendingOnly);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [lastRun, setLastRun] = useState(null);
  const [loadingLinks, setLoadingLinks] = useState(false);

  useEffect(() => {
    adminApi.listCompanies()
      .then(d => setCompanies(d.companies || []))
      .catch(e => setError(e.message));
  }, []);

  useEffect(() => {
    if (!companyId) {
      setLinks([]);
      return;
    }
    setLoadingLinks(true);
    setError('');
    adminApi.listLinksForCompany(companyId)
      .then(d => setLinks(d.links || []))
      .catch(e => setError(e.message))
      .finally(() => setLoadingLinks(false));
  }, [companyId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return links.filter(l => {
      if (pendingOnly && l.has_description) return false;
      if (q && !l.job_link.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [links, search, pendingOnly]);

  const counts = useMemo(() => ({
    total: links.length,
    processed: links.filter(l => l.has_description).length,
    pending: links.filter(l => !l.has_description).length,
  }), [links]);

  async function runForLink(link) {
    setError('');
    setBusyId(link.id);
    try {
      const run = await adminApi.runOrchestratorForLink(link.id);
      setLastRun({ url: link.job_link, runId: run.id });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <h1>Run orchestrator per link</h1>

      {error && <div className="admin-error">{error}</div>}
      {lastRun && (
        <div className="admin-card">
          Started run <code>{lastRun.runId}</code> for <code>{lastRun.url}</code>.{' '}
          See <a href="/admin/pipelines">Pipelines</a> for the log.
        </div>
      )}

      <div className="admin-card">
        <h3>Pick a company</h3>
        <div className="admin-row">
          <select
            className="admin-select"
            value={companyId}
            onChange={e => setCompanyId(e.target.value)}
          >
            <option value="">— Select company —</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.company_name}</option>
            ))}
          </select>
          {companyId && (
            <>
              <input
                className="admin-input"
                placeholder="Filter URLs…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 1 }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#f5f5f7' }}>
                <input
                  type="checkbox"
                  checked={pendingOnly}
                  onChange={e => setPendingOnly(e.target.checked)}
                />
                Pending only
              </label>
            </>
          )}
        </div>
        {companyId && (
          <div style={{ marginTop: 12, fontSize: 13, color: '#86868b' }}>
            <strong style={{ color: '#f5f5f7' }}>{counts.total}</strong> total ·{' '}
            <span style={{ color: '#30d158' }}>{counts.processed} processed</span> ·{' '}
            <span style={{ color: '#ffb340' }}>{counts.pending} pending</span>
          </div>
        )}
      </div>

      {companyId && (
        <div className="admin-card">
          <h3>Links {loadingLinks && <span style={{ color: '#86868b', fontWeight: 400, fontSize: 14 }}>loading…</span>}</h3>
          {filtered.length === 0 ? (
            <div className="admin-empty">No links found.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>URL</th>
                  <th>Created</th>
                  <th>Processed</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id}>
                    <td>
                      <span className={`admin-status admin-status--${l.has_description ? 'success' : 'starting'}`}>
                        {l.has_description ? 'Processed' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <a href={l.job_link} target="_blank" rel="noreferrer">{l.job_link}</a>
                      {l.job_title && (
                        <div style={{ color: '#86868b', fontSize: 12, marginTop: 2 }}>{l.job_title}</div>
                      )}
                    </td>
                    <td>{l.created_at ? new Date(l.created_at).toLocaleString() : '—'}</td>
                    <td>{l.description_created_at ? new Date(l.description_created_at).toLocaleString() : '—'}</td>
                    <td>
                      <button
                        className="admin-btn"
                        disabled={busyId === l.id}
                        onClick={() => runForLink(l)}
                      >
                        {busyId === l.id
                          ? 'Starting…'
                          : (l.has_description ? 'Re-run' : 'Run orchestrator')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  );
}
