import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../utils/adminApi';

export default function Dashboard() {
  const [companies, setCompanies] = useState([]);
  const [filters, setFilters] = useState({ companyId: '', jobLevel: '', jobType: '' });
  const [data, setData] = useState({ count: 0, records: [] });
  const [pending, setPending] = useState({ total_pending: 0, per_company: [] });
  const [busyCompanyId, setBusyCompanyId] = useState(null);
  const [pendingMessage, setPendingMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.listCompanies()
      .then(d => setCompanies(d.companies || []))
      .catch(() => {});
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const d = await adminApi.todayStats(filters);
      setData(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadPending() {
    try {
      const d = await adminApi.pendingOverview();
      setPending(d);
    } catch (e) {
      // non-fatal
    }
  }

  useEffect(() => { load(); loadPending(); }, []);

  function onFilterSubmit(e) {
    e.preventDefault();
    load();
  }

  function reset() {
    setFilters({ companyId: '', jobLevel: '', jobType: '' });
    setTimeout(load, 0);
  }

  async function runForCompany(c) {
    setPendingMessage('');
    setBusyCompanyId(c.company_id);
    try {
      const run = await adminApi.runOrchestratorForCompany(c.company_id);
      setPendingMessage(`Started run ${run.id} for ${c.company_name}. See Pipelines for progress.`);
    } catch (e) {
      setPendingMessage(`Failed: ${e.message}`);
    } finally {
      setBusyCompanyId(null);
    }
  }

  return (
    <>
      <h1>Dashboard</h1>

      <div className="admin-card">
        <div className="admin-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="admin-stat">
            <span className="admin-stat-num">{pending.total_pending}</span>
            <span className="admin-stat-label">jobs pending across companies</span>
          </div>
          <button className="admin-btn admin-btn--ghost" onClick={loadPending}>Refresh</button>
        </div>
        {pendingMessage && (
          <div style={{ marginTop: 12, fontSize: 14, color: '#86868b' }}>{pendingMessage}</div>
        )}
        {pending.per_company.length === 0 ? (
          <div className="admin-empty">All caught up — no pending jobs.</div>
        ) : (
          <table className="admin-table" style={{ marginTop: 14 }}>
            <thead>
              <tr>
                <th>Company</th>
                <th>Pending</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pending.per_company.map(c => (
                <tr key={c.company_id}>
                  <td>{c.company_name}</td>
                  <td><strong style={{ color: '#ffb340' }}>{c.pending_count}</strong></td>
                  <td style={{ textAlign: 'right' }}>
                    <Link
                      to={`/admin/links?company_id=${c.company_id}&pending=1`}
                      className="admin-btn admin-btn--ghost"
                      style={{ display: 'inline-block', textDecoration: 'none', marginRight: 8 }}
                    >
                      View links
                    </Link>
                    <button
                      className="admin-btn"
                      disabled={busyCompanyId === c.company_id}
                      onClick={() => runForCompany(c)}
                    >
                      {busyCompanyId === c.company_id ? 'Starting…' : 'Run orchestrator'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h1 style={{ marginTop: 28 }}>Today's Jobs</h1>

      <div className="admin-card">
        <div className="admin-stat">
          <span className="admin-stat-num">{data.count}</span>
          <span className="admin-stat-label">jobs inserted today</span>
        </div>
      </div>

      <div className="admin-card">
        <h3>Filters</h3>
        <form className="admin-row" onSubmit={onFilterSubmit}>
          <select
            className="admin-select"
            value={filters.companyId}
            onChange={e => setFilters({ ...filters, companyId: e.target.value })}
          >
            <option value="">All companies</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.company_name}</option>
            ))}
          </select>
          <input
            className="admin-input"
            placeholder="Job level (e.g. Senior)"
            value={filters.jobLevel}
            onChange={e => setFilters({ ...filters, jobLevel: e.target.value })}
          />
          <input
            className="admin-input"
            placeholder="Job type (e.g. Full-time)"
            value={filters.jobType}
            onChange={e => setFilters({ ...filters, jobType: e.target.value })}
          />
          <button className="admin-btn" type="submit" disabled={loading}>
            {loading ? 'Loading…' : 'Apply'}
          </button>
          <button className="admin-btn admin-btn--ghost" type="button" onClick={reset}>
            Reset
          </button>
        </form>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-card">
        <h3>Results</h3>
        {data.records.length === 0 ? (
          <div className="admin-empty">No jobs inserted today (for current filters).</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Company</th>
                <th>Level</th>
                <th>Type</th>
                <th>Location</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {data.records.map(r => (
                <tr key={r.id}>
                  <td>{r.job_title || '—'}</td>
                  <td>{r.company_name || '—'}</td>
                  <td>{r.job_level || '—'}</td>
                  <td>{r.job_type || '—'}</td>
                  <td>{r.location || '—'}</td>
                  <td>
                    {r.job_link ? (
                      <a href={r.job_link} target="_blank" rel="noreferrer">open</a>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
