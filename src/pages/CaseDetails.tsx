import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/store';

export default function CaseDetails() {
  const { id } = useParams<{ id: string }>();
  const { cases, diaryEntries, fetchCases, fetchDiaryEntries, updateCaseStatus } = useStore();

  useEffect(() => {
    fetchCases();
    if (id) fetchDiaryEntries(id);
  }, [id, fetchCases, fetchDiaryEntries]);

  const kase = cases.find(c => c.id === id);

  if (!kase) {
    return <div>Loading or Case Not Found...</div>;
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateCaseStatus(kase.id, e.target.value);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Case: {kase.id}</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select value={kase.status} onChange={handleStatusChange} className="select" style={{ width: 'auto' }}>
            <option value="Open">Open</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Charge Sheeted">Charge Sheeted</option>
            <option value="Closed">Closed</option>
          </select>
          <Link to={`/cases/${kase.id}/diary`} className="btn btn-primary">Add Diary Entry</Link>
          <Link to={`/ai-reports?caseId=${kase.id}`} className="btn btn-secondary">Generate Report</Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* FIR Details */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>FIR Information</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>FIR Number</div>
              <div style={{ fontWeight: 500 }}>{kase.firNumber}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Incident Date</div>
              <div style={{ fontWeight: 500 }}>{new Date(kase.incidentDate).toLocaleDateString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Category</div>
              <div style={{ fontWeight: 500 }}>{kase.crimeCategory}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Location</div>
              <div style={{ fontWeight: 500 }}>{kase.location}</div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Complainant</div>
            <div style={{ fontWeight: 500 }}>{kase.complainantName} ({kase.complainantPhone})</div>
            <div style={{ fontSize: '0.875rem' }}>{kase.complainantAddress}</div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Accused</div>
            <div style={{ fontWeight: 500 }}>{kase.accusedName}</div>
            <div style={{ fontSize: '0.875rem' }}>{kase.accusedAddress}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Crime Description</div>
            <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{kase.crimeDescription}</div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Recent Activity</h2>
          
          {diaryEntries.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>No diary entries yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {diaryEntries.slice().reverse().map(entry => (
                <div key={entry.id} style={{ borderLeft: '2px solid var(--border-color)', paddingLeft: '1rem', marginLeft: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(entry.date).toLocaleDateString()}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginTop: '0.25rem' }}>{entry.activityType.replace('_', ' ')}</div>
                  <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{entry.description}</div>
                </div>
              ))}
            </div>
          )}
          
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link to={`/cases/${kase.id}/diary`} style={{ fontSize: '0.875rem', color: 'var(--text-primary)', textDecoration: 'underline', fontWeight: 500 }}>View Full Case Diary</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
