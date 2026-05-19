import { useEffect, useState } from "react";
import CompanyJobCard from "../components/CompanyJobCard";
import AuthPrompt from "../components/AuthPrompt";
import { apiFetch, UnauthorizedError } from "../utils/apiFetch";

export default function CompanyJobs() {
  const [jobs, setJobs] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  // Extract company ID from URL
  const queryParams = new URLSearchParams(window.location.search);
  const companyId = queryParams.get("id");

  useEffect(() => {
    if (!companyId) return;
    import('../styles/CompanyJobs.css');
    apiFetch(`/companies/company_job/${companyId}`)
      .then(res => res.json())
      .then(data => {
        setJobs(data?.records || []);
        setCompanyName(data?.records[0]?.company_name || "Company");
        setLoading(false);
      })
      .catch(err => {
        if (err instanceof UnauthorizedError) {
          setUnauthorized(true);
          setLoading(false);
        } else {
          console.error("Error fetching company jobs:", err);
          setLoading(false);
        }
      });
  }, [companyId]);

  if (unauthorized) {
    return <AuthPrompt message="Sign in to view jobs for this company." />;
  }

  if (loading) {
    return <div className="loading">Loading jobs...</div>;
  }

  return (
    <div className="company-jobs-page-container">
      <h1 className="company-jobs-page-container-h1">{companyName} – Job Openings</h1>

      {jobs.length === 0 ? (
        <p>No active job openings at the moment.</p>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job, idx) => (
            <CompanyJobCard key={idx} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
