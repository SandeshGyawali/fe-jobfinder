import { useNavigate } from 'react-router-dom';

export default function JobCard({ job }) {
  const navigate = useNavigate();

  const handleJobClick = () => {
    navigate(`/jobs?id=${job.id}`);
  };
  return (
    <div className="job-card">
      <div className="job-company">{job.company_name || 'Company'}</div>
      <h3 className="job-title">{job.job_title}</h3>
      
      <div className="job-meta">
        <span className="job-meta-item">📍 {job.location}</span>
        <span className="job-meta-item">💼 {job.job_type}</span>
        <span className="job-meta-item">📊 {job.job_level}</span>
        {job.deadline!='not mentioned' && (
          <div className="deadline-badge">
            ⏳ Deadline: <span>{job.deadline}</span>
          </div>
        )}
      </div>

      {job.summary && (
        <p className="job-summary">
          {Array.isArray(job.summary) ? job.summary[0] : job.summary}
        </p>
      )}

      {/* {job.skills && job.skills.length > 0 && (
        <div className="job-skills">
          {job.skills.slice(0, 5).map((skill, idx) => (
            <span key={idx} className="skill-tag">{skill}</span>
          ))}
        </div>
      )} */}

      <div className="job-footer">
        <span className="job-date">
          {job.years_of_experience && `YOE: ${job.years_of_experience.substring(0, 30)}`}
        </span>
        <button className="apply-btn">
          <a
            onClick={handleJobClick}
            target="_blank"
            rel="noopener noreferrer"
            className="apply-btn"
            style={{ textDecoration: 'none' }}
          >
            View More
          </a>
        </button>
      </div>
    </div>
  );
}
