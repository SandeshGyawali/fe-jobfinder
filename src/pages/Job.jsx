import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AuthPrompt from '../components/AuthPrompt';
import { apiFetch, UnauthorizedError } from '../utils/apiFetch';

export default function Job() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('id');
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    import('../styles/Job.css');
    if (!jobId) return;

    apiFetch(`/jobs/${jobId}`)
      .then(res => {
        if (!res.ok) throw new Error('Job not found');
        return res.json();
      })
      .then(data => {
        setJob(data?.records[0]);
        setLoading(false);
      })
      .catch(err => {
        if (err instanceof UnauthorizedError) {
          setUnauthorized(true);
          setLoading(false);
        } else {
          console.error('Error fetching job:', err);
          setLoading(false);
        }
      });
  }, [jobId]);

  if (unauthorized) {
    return <AuthPrompt message="Sign in to view job details." />;
  }

  if (loading) {
    return <div className="loading">Loading job details...</div>;
  }

  if (!job) {
    return <div className="loading">Job not found.</div>;
  }

  return (
    <div className="job-page-container">
      <h1>{job.job_title}</h1>
      
      <div className="job-meta">
        {job.company_name && <span className="job-meta-item">🏢 {job.company_name}</span>}
        {job.location && <span className="job-meta-item">📍 {job.location}</span>}
        {job.job_type && <span className="job-meta-item">💼 {job.job_type}</span>}
        {job.job_level && <span className="job-meta-item">📊 {job.job_level}</span>}
        {job.years_of_experience && <span className="job-meta-item">⏱️ YOE: {job.years_of_experience} </span>}
      </div>

      {job.summary && (
        <div>
          <h2>Summary</h2>
          {Array.isArray(job.summary) ? (
            <ul>
              {job.summary.map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
          ) : (
            <p>{job.summary}</p>
          )}
        </div>
      )}

      {job.skills && job.skills.length > 0 && (
        <div>
          <h2>Required Skills</h2>
          <div className="job-skills">
            {job.skills.map((skill, idx) => (
              <span key={idx} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {job.job_link && (
        <a href={job.job_link} target="_blank" rel="noopener noreferrer">
          <button className="apply-btn">Apply Now</button>
        </a>
      )}
    </div>
  );
}
