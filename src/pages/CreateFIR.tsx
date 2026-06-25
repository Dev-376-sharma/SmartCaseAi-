import { useState } from 'react';
import { useStore } from '../store/store';
import { useNavigate } from 'react-router-dom';

export default function CreateFIR() {
  const { createFIR } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firNumber: '',
    incidentDate: '',
    location: '',
    crimeCategory: 'Theft',
    complainantName: '',
    complainantAddress: '',
    complainantPhone: '',
    accusedName: '',
    accusedAddress: '',
    crimeDescription: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await createFIR(formData);
      // The response returns { fir, case }. The case object contains the generated case id.
      if (response && response.case && response.case.id) {
        navigate(`/cases/${response.case.id}`);
      } else {
        navigate('/cases');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to register FIR. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Register New FIR</h1>
      
      <form onSubmit={handleSubmit} className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">FIR Number *</label>
            <input required type="text" name="firNumber" className="input" value={formData.firNumber} onChange={handleChange} placeholder="e.g. FIR/2026/001" />
          </div>
          <div className="form-group">
            <label className="form-label">Incident Date</label>
            <input type="date" name="incidentDate" className="input" value={formData.incidentDate} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input type="text" name="location" className="input" value={formData.location} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Crime Category</label>
            <select name="crimeCategory" className="select" value={formData.crimeCategory} onChange={handleChange}>
              <option value="Theft">Theft</option>
              <option value="Assault">Assault</option>
              <option value="Fraud">Fraud</option>
              <option value="Cybercrime">Cybercrime</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>Complainant Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input required type="text" name="complainantName" className="input" value={formData.complainantName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input type="text" name="complainantPhone" className="input" value={formData.complainantPhone} onChange={handleChange} />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Address</label>
            <input type="text" name="complainantAddress" className="input" value={formData.complainantAddress} onChange={handleChange} />
          </div>
        </div>

        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>Accused Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input type="text" name="accusedName" className="input" value={formData.accusedName} onChange={handleChange} placeholder="Unknown if not identified" />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input type="text" name="accusedAddress" className="input" value={formData.accusedAddress} onChange={handleChange} />
          </div>
        </div>

        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>Crime Description *</h3>
        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <textarea required name="crimeDescription" className="textarea" rows={5} value={formData.crimeDescription} onChange={handleChange}></textarea>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit FIR & Create Case'}
          </button>
        </div>
      </form>
    </div>
  );
}
