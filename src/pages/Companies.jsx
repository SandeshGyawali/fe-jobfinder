import { useState, useEffect } from "react";
import CompanyCard from '../components/CompanyCard';
import { API_BASE_URL } from '../utils/apiFetch';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/companies/fetch_all`)
      .then((res) => res.json())
      .then((data) => {
        setCompanies(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching companies:", err);
        setCompanies([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loading">Loading companies...</div>;
  }

  return (
    <>
      <section className="hero">
        <h1>Companies</h1>
        <p>Browse jobs by company and discover opportunities at leading organizations</p>
      </section>

      <div className="jobs-container">
        {companies.length === 0 ? (
          <div className="loading">No companies available at the moment.</div>
        ) : (
          <div className="jobs-grid">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
