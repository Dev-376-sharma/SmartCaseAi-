import { useEffect } from 'react';
import { useStore } from '../store/store';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { cases, fetchCases } = useStore();

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const totalCases = cases.length;
  const openCases = cases.filter(c => c.status === 'Open').length;
  const reportsGenerated = 0; // Would be pulled from documents store if needed

  return (
    <div>
      {/* Hero Section Top */}
      <div className="card hero-card-premium" style={{ marginBottom: '2rem', textAlign: 'center', padding: '3.5rem 2rem' }}>
        <h2 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.02em' }}>One Case. One Record. Zero Duplication.</h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Reduce repetitive documentation with AI-powered case summaries and investigation reports.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Dashboard Overview</h1>
        <Link to="/fir/new" className="btn btn-primary">Create FIR</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Cases</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{totalCases}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Open Cases</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{openCases}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Generated Reports</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{reportsGenerated}</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Recent Cases</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cases.slice(0, 5).map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem',
                      backgroundColor: c.status === 'Open' ? '#E4E4E7' : '#D4D4D8' 
                    }}>
                      {c.status}
                    </span>
                  </td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/cases/${c.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>View</Link>
                  </td>
                </tr>
              ))}
              {cases.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No cases found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hero Section Bottom */}
      <div className="card hero-card-premium" style={{ marginTop: '2rem', textAlign: 'center', padding: '3.5rem 2rem' }}>
        <h2 className="gradient-text" style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.02em' }}>One Case. One Record. Zero Duplication.</h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Reduce repetitive documentation with AI-powered case summaries and investigation reports.
        </p>
      </div>
    </div>
  );
}
