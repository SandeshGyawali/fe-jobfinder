import { useState, useEffect } from 'react';
import JobCard from '../components/JobCard';
import AuthPrompt from '../components/AuthPrompt';
import { apiFetch, API_BASE_URL, UnauthorizedError } from '../utils/apiFetch';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [numberOfFilteredJobs, setNumberOfFilteredJobs] = useState(0);
  const [filterUnauthorized, setFilterUnauthorized] = useState(false);

  const isSearchDisabled = !selectedLevel || !selectedExperience;

  const handleFilter = async () => {
    setLoading(true);
    setFilterUnauthorized(false);
    try {
      const res = await apiFetch(`/jobs/search-with-filter?level=${encodeURIComponent(selectedLevel)}&experience=${selectedExperience}`);
      if (!res.ok) throw new Error("Filter failed");
      const data = await res.json();
      setNumberOfFilteredJobs(data.records.length || 0);
      setJobs(data.records || []);
      setTotalPages(1);
      setPage(1);
      setIsFiltered(true);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        setFilterUnauthorized(true);
      } else {
        console.error("Filter error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedLevel("");
    setSelectedExperience("");
    setIsFiltered(false);
    setPage(1);
    fetchJobs(1);
  };

  const pageSize = 10; // matches your backend default

  const fetchJobs = (pageNumber = 1) => {
    setLoading(true);
    fetch(`${API_BASE_URL}/jobs/fetch-all?page=${pageNumber}&page_size=${pageSize}`)
      .then(res => res.json())
      .then(data => {
        const jobsArray = data.records || [];
        setJobs(Array.isArray(jobsArray) ? jobsArray : []);
        setTotalPages(data.total_pages || 1);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching jobs:', err);
        setJobs([]);
        setLoading(false);
      });
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

  if (loading) {
    return <div className="loading">Loading opportunities...</div>;
  }

  return (
    <>
      <section className="hero">
        <h1>Find Your Next Opportunity</h1>
        <p>Discover amazing career opportunities from top companies</p>
      </section>

      <div className="jobs-container">
        {jobs.length === 0 ? (
          <div className="empty-state">
            <div className="loading">
              {isFiltered
                ? `No jobs match "${selectedLevel}" + "${selectedExperience === '0' ? 'Entry (0 years)' : `${selectedExperience}+ years`}".`
                : 'No jobs available at the moment.'}
            </div>
            {isFiltered && (
              <button
                className="search-btn"
                onClick={handleReset}
                style={{ marginTop: 20 }}
              >
                Show all jobs
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="jobs-search">
              <div className="filters-row" style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                <div className="filter-group">
                  <label>Level:</label>
                  <select 
                    value={selectedLevel} 
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="search-input"
                  >
                    <option value="" disablesd>Select Level</option>
                    <option value="Intern">Intern</option>
                    <option value="Entry">Entry level</option>
                    <option value="Mid">Mid level</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Experience:</label>
                  <select 
                    value={selectedExperience} 
                    onChange={(e) => setSelectedExperience(e.target.value)}
                    className="search-input"
                  >
                    <option value="" disabled>Select Experience</option>
                    {[0, 1, 2, 3, 4, 5, 6].map(year => (
                      <option key={year} value={year}>
                        {year === 0 ? "Entry (0 years)" : `${year}+ years`}
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  className="search-btn" 
                  onClick={handleFilter}
                  disabled={isSearchDisabled} // 5. Disable until both are picked
                  style={{ 
                    alignSelf: 'flex-end',
                    opacity: isSearchDisabled ? 0.5 : 1, // Visual feedback
                    cursor: isSearchDisabled ? 'not-allowed' : 'pointer'
                  }}
                >
                  Filter Jobs
                </button>
                
                {isFiltered && (
                  <button 
                    className="search-btn" 
                    onClick={handleReset}
                    style={{ alignSelf: 'flex-end', backgroundColor: '#6c757d' }}
                  >
                    Show All
                  </button>
                )}
              </div>
            </div>
            
            {filterUnauthorized && (
              <AuthPrompt message="Sign in to filter jobs by level and experience." />
            )}

            {isFiltered && !filterUnauthorized && (
              <div style={{ margin: '10px 0', padding: '10px', borderRadius: '5px', fontSize: '14px', color: '#6c757d' }}>
                Showing {numberOfFilteredJobs} results for "{selectedLevel}" and "{selectedExperience === '0' ? 'Entry (0 years)' : `${selectedExperience}+ years`}"
              </div>
            )}
            
            <div className="jobs-grid">
              {jobs.map((job, idx) => (
                <JobCard key={idx} job={job} />
              ))}
            </div>

            {!isFiltered && (
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
            )}

          </>
        )}
      </div>
    </>
  );
}
