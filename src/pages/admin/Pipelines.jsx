import { useEffect, useRef, useState } from 'react';
import { adminApi } from '../../utils/adminApi';

function StatusBadge({ status }) {
  return <span className={`admin-status admin-status--${status}`}>{status}</span>;
}

function formatTime(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

export default function Pipelines() {
  const [runs, setRuns] = useState([]);
  const [selectedRunId, setSelectedRunId] = useState(null);
  const [logData, setLogData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState('');

  const pollRef = useRef(null);

  async function refresh() {
    try {
      const d = await adminApi.listRuns(50);
      setRuns(d.runs || []);
    } catch (e) {
      setError(e.message);
    }
  }

  async function loadLog(runId) {
    try {
      const d = await adminApi.getRunLog(runId, 500);
      setLogData(d);
    } catch (e) {
      setError(e.message);
    }
  }

  async function loadSummary(runId) {
    try {
      const d = await adminApi.getRunSummary(runId);
      setSummary(d.summary);
    } catch {
      setSummary(null);
    }
  }

  useEffect(() => {
    refresh();
    pollRef.current = setInterval(() => {
      refresh();
      if (selectedRunId) {
        loadLog(selectedRunId);
        loadSummary(selectedRunId);
      }
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [selectedRunId]);

  async function trigger(action, label) {
    setError('');
    setPendingAction(label);
    try {
      const run = await action();
      await refresh();
      setSelectedRunId(run.id);
      setSummary(null);
      loadLog(run.id);
      loadSummary(run.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setPendingAction('');
    }
  }

  function selectRun(runId) {
    setSelectedRunId(runId);
    setSummary(null);
    loadLog(runId);
    loadSummary(runId);
  }

  return (
    <>
      <h1>Pipelines</h1>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-card">
        <h3>Trigger a run</h3>
        <div className="admin-row">
          <button
            className="admin-btn"
            disabled={!!pendingAction}
            onClick={() => trigger(adminApi.runLinkScraper, 'link-scraper')}
          >
            {pendingAction === 'link-scraper' ? 'Starting…' : 'Run link scraper'}
          </button>
          <button
            className="admin-btn"
            disabled={!!pendingAction}
            onClick={() => trigger(adminApi.runOrchestrator, 'orchestrator')}
          >
            {pendingAction === 'orchestrator' ? 'Starting…' : 'Run orchestrator (all pending)'}
          </button>
        </div>
        <p style={{ color: '#86868b', fontSize: 13, marginTop: 12, marginBottom: 0 }}>
          Triggers run in the background. A 409 means a run of the same pipeline is already active.
        </p>
      </div>

      <div className="admin-card">
        <h3>Recent runs</h3>
        {runs.length === 0 ? (
          <div className="admin-empty">No runs yet.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Triggered by</th>
                <th>Started</th>
                <th>Finished</th>
                <th>Exit</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {runs.map(r => (
                <tr
                  key={r.id}
                  style={selectedRunId === r.id ? { background: 'rgba(10, 132, 255, 0.08)' } : null}
                >
                  <td>{r.name}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>{r.triggered_by_email || '—'}</td>
                  <td>{formatTime(r.started_at)}</td>
                  <td>{formatTime(r.finished_at)}</td>
                  <td>{r.exit_code ?? '—'}</td>
                  <td>
                    <button className="admin-btn admin-btn--ghost" onClick={() => selectRun(r.id)}>
                      View log
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedRunId && summary && <RunSummary summary={summary} />}

      {selectedRunId && (
        <div className="admin-card">
          <h3>
            Log — {logData?.run?.name} <StatusBadge status={logData?.run?.status || 'starting'} />
          </h3>
          <pre className="admin-log">
            {logData?.log || 'Loading…'}
          </pre>
        </div>
      )}
    </>
  );
}

function RunSummary({ summary }) {
  const [showFailures, setShowFailures] = useState(false);
  if (!summary) return null;

  if (summary.pipeline === 'link-scraper') {
    const byCompany = summary.inserted_by_company || {};
    const deletedByCompany = summary.marked_deleted_by_company || {};
    const companies = Array.from(new Set([
      ...Object.keys(byCompany),
      ...Object.keys(deletedByCompany),
    ])).sort();
    return (
      <div className="admin-card">
        <h3>Run summary — link scraper</h3>
        <div style={{ marginBottom: 12 }}>
          <span className="admin-stat">
            <span className="admin-stat-num">{summary.inserted_total ?? 0}</span>
            <span className="admin-stat-label">new links inserted</span>
          </span>
          <span className="admin-stat">
            <span className="admin-stat-num">{summary.marked_deleted_total ?? 0}</span>
            <span className="admin-stat-label">marked deleted</span>
          </span>
          <span className="admin-stat">
            <span className="admin-stat-num">{summary.scrapers_failed?.length ?? 0}</span>
            <span className="admin-stat-label">scrapers errored</span>
          </span>
        </div>
        {companies.length > 0 && (
          <table className="admin-table">
            <thead>
              <tr><th>Company</th><th>Inserted</th><th>Marked deleted</th></tr>
            </thead>
            <tbody>
              {companies.map(c => (
                <tr key={c}>
                  <td>{c || '—'}</td>
                  <td>{byCompany[c] ?? 0}</td>
                  <td>{deletedByCompany[c] ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {(summary.scrapers_failed || []).length > 0 && (
          <div style={{ marginTop: 12 }}>
            <strong>Scraper errors:</strong>
            <ul style={{ marginTop: 6, paddingLeft: 20 }}>
              {summary.scrapers_failed.map((f, i) => (
                <li key={i}><code>{f.scraper}</code>: {f.error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (summary.pipeline === 'orchestrator') {
    const failures = summary.failures || [];
    return (
      <div className="admin-card">
        <h3>
          Run summary — orchestrator
          {summary.scope === 'company' && ' (per-company)'}
          {summary.scope === 'link' && ' (per-link)'}
        </h3>
        <div style={{ marginBottom: 12 }}>
          <span className="admin-stat">
            <span className="admin-stat-num">{summary.items_collected ?? 0}</span>
            <span className="admin-stat-label">files scraped</span>
          </span>
          <span className="admin-stat">
            <span className="admin-stat-num">{summary.inserted_to_db ?? 0}</span>
            <span className="admin-stat-label">inserted to db</span>
          </span>
          <span className="admin-stat">
            <span className="admin-stat-num">{summary.failed_count ?? 0}</span>
            <span className="admin-stat-label">failed</span>
          </span>
        </div>
        {failures.length > 0 && (
          <>
            <button
              className="admin-btn admin-btn--ghost"
              onClick={() => setShowFailures(s => !s)}
            >
              {showFailures ? 'Hide failures' : `Show ${failures.length} failure${failures.length === 1 ? '' : 's'}`}
            </button>
            {showFailures && (
              <table className="admin-table" style={{ marginTop: 12 }}>
                <thead>
                  <tr><th>Job link id</th><th>File</th><th>Reason</th></tr>
                </thead>
                <tbody>
                  {failures.map((f, i) => (
                    <tr key={i}>
                      <td><code>{f.job_link_id || '—'}</code></td>
                      <td style={{ wordBreak: 'break-all' }}>{f.file_path || '—'}</td>
                      <td>{f.reason || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    );
  }

  return null;
}
