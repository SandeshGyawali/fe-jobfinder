import { useEffect, useState } from 'react';
import { adminApi } from '../../utils/adminApi';

export default function CompaniesAdmin() {
  const [companies, setCompanies] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [lastRun, setLastRun] = useState(null);

  useEffect(() => {
    adminApi.listCompanies()
      .then(d => setCompanies(d.companies || []))
      .catch(e => setError(e.message));
  }, []);

  async function runForCompany(c) {
    setError('');
    setBusyId(c.id);
    try {
      const run = await adminApi.runOrchestratorForCompany(c.id);
      setLastRun({ company: c.company_name, runId: run.id });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <h1>Run orchestrator per company</h1>

      {error && <div className="admin-error">{error}</div>}
      {lastRun && (
        <div className="admin-card">
          Started run <code>{lastRun.runId}</code> for <strong>{lastRun.company}</strong>.{' '}
          See <a href="/admin/pipelines">Pipelines</a> for the log.
        </div>
      )}

      <div className="admin-card">
        {companies.length === 0 ? (
          <div className="admin-empty">No companies found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Website</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {companies.map(c => (
                <tr key={c.id}>
                  <td>{c.company_name}</td>
                  <td>{c.company_website ? <a href={c.company_website} target="_blank" rel="noreferrer">{c.company_website}</a> : '—'}</td>
                  <td>
                    <button
                      className="admin-btn"
                      disabled={busyId === c.id}
                      onClick={() => runForCompany(c)}
                    >
                      {busyId === c.id ? 'Starting…' : 'Run orchestrator'}
                    </button>
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
