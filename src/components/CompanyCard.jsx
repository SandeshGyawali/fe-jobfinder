import { useNavigate } from 'react-router-dom';

export default function CompanyCard({ company }) {
  const navigate = useNavigate();

  const handleCompanyClick = () => {
    navigate(`/company-jobs?id=${company.id}`);
  };
  return (
    <div className="company-card">
      <div className="company-header">
        <h3 className="company-name">{company.company_name}</h3>
      </div>

      {/* Active Jobs Count */}
      <div className="company-jobs">
        <span className="jobs-count">{company.active_jobs_count}</span> open position
        {company.active_jobs_count !== 1 && "s"}
      </div>
      
      { company.active_jobs_count !=0 && (
        <button className="visit-website-btn" onClick={handleCompanyClick}>
          View Jobs
        </button>
      )}
      
      
    </div>
  );
}
