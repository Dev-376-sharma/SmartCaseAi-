import { useEffect } from 'react';
import { useStore } from '../store/store';
import { Link } from 'react-router-dom';

export default function CasesList() {
  const { cases, fetchCases } = useStore();

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>All Cases</h1>
        <Link to="/fir/new" className="btn btn-primary">Create New Case</Link>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Case ID / FIR No</th>
                <th>Category</th>
                <th>Incident Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cases.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{c.id}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.firNumber}</div>
                  </td>
                  <td>{c.crimeCategory}</td>
                  <td>{new Date(c.incidentDate).toLocaleDateString()}</td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem',
                      backgroundColor: c.status === 'Open' ? '#E4E4E7' : 
                                     c.status === 'Closed' ? '#D4D4D8' : '#F4F4F5',
                      color: 'var(--text-primary)'
                    }}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/cases/${c.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'underline', fontWeight: 500 }}>View Details</Link>
                  </td>
                </tr>
              ))}
              {cases.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No cases found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
