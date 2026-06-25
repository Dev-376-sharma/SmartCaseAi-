import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/store';

export default function CaseDiary() {
  const { id } = useParams<{ id: string }>();
  const { diaryEntries, fetchDiaryEntries, addDiaryEntry } = useStore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    activityType: 'SPOT_VISIT',
    description: '',
    officerNotes: ''
  });

  useEffect(() => {
    if (id) fetchDiaryEntries(id);
  }, [id, fetchDiaryEntries]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    try {
      await addDiaryEntry({ ...formData, caseId: id });
      setFormData({ ...formData, description: '', officerNotes: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to add entry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      {/* Left Col: Add New Entry Form */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Add Diary Entry</h1>
          <Link to={`/cases/${id}`} style={{ fontSize: '0.875rem', textDecoration: 'underline' }}>Back to Case</Link>
        </div>
        
        <form onSubmit={handleSubmit} className="card">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input required type="date" name="date" className="input" value={formData.date} onChange={handleChange} />
          </div>
          
          <div className="form-group">
            <label className="form-label">Activity Type</label>
            <select required name="activityType" className="select" value={formData.activityType} onChange={handleChange}>
              <option value="SPOT_VISIT">Spot Visit</option>
              <option value="WITNESS_STATEMENT">Witness Statement</option>
              <option value="EVIDENCE_COLLECTION">Evidence Collection</option>
              <option value="SUSPECT_INTERROGATION">Suspect Interrogation</option>
              <option value="ARREST">Arrest</option>
              <option value="SEARCH_OPERATION">Search Operation</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Action Performed</label>
            <textarea required name="description" className="textarea" rows={3} value={formData.description} onChange={handleChange}></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Officer Private Notes (Optional)</label>
            <textarea name="officerNotes" className="textarea" rows={4} value={formData.officerNotes} onChange={handleChange}></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Adding...' : 'Save Entry'}
          </button>
        </form>
      </div>

      {/* Right Col: Timeline */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Investigation Timeline</h2>
        <div className="card" style={{ height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
          {diaryEntries.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>No entries found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {diaryEntries.slice().reverse().map(entry => (
                <div key={entry.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{entry.activityType.replace('_', ' ')}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(entry.date).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{entry.description}</div>
                  {entry.officerNotes && (
                    <div style={{ fontSize: '0.875rem', backgroundColor: '#FAFAFA', padding: '0.75rem', borderRadius: '0.375rem', color: 'var(--text-secondary)' }}>
                      <strong>Notes:</strong> {entry.officerNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
