import { useState, useEffect } from 'react';
import JobCard from '../components/JobCard';
import AuthPrompt from '../components/AuthPrompt';
import { apiFetch, UnauthorizedError } from '../utils/apiFetch';

export default function NewListings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unauthorized, setUnauthorized] = useState(false);

  const pageSize = 10;

  const fetchJobs = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/jobs/fetch-new?page=${pageNumber}&page_size=${pageSize}`);
      const data = await res.json();
      const jobsArray = data.records || [];
      setJobs(Array.isArray(jobsArray) ? jobsArray : []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        setUnauthorized(true);
      } else {
        console.error('Error fetching jobs:', err);
        setJobs([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(page);
  }, [page]);

  const handlePrev = () => {
    if (page > 1) setPage(prev => prev - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(prev => prev + 1);
  };

  if (unauthorized) {
    return <AuthPrompt message="Sign in to browse new job listings." />;
  }

  if (loading) {
    return <div className="loading">Loading new opportunities...</div>;
  }

  return (
    <>
      <section className="hero">
        <h1>New Job Listings</h1>
        <p>Discover the latest career opportunities from top companies</p>
      </section>

      <div className="jobs-container">
        {jobs.length === 0 ? (
          <div className="loading">No new jobs available at the moment.</div>
        ) : (
          <>
            <div className="jobs-grid">
              {jobs.map((job, idx) => (
                <JobCard key={idx} job={job} />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="pagination">
              <button
                onClick={handlePrev}
                disabled={page === 1}
                className="pagination-btn"
              >
                ◀ Previous
              </button>

              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={handleNext}
                disabled={page === totalPages}
                className="pagination-btn"
              >
                Next ▶
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}