import { useState, useEffect } from 'react';
import { useStore } from '../store/store';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function AIReports() {
  const { cases, documents, fetchCases, fetchDocuments, generateReport } = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [selectedCase, setSelectedCase] = useState(searchParams.get('caseId') || '');
  const [docType, setDocType] = useState('CASE_SUMMARY');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCases();
    fetchDocuments();
  }, [fetchCases, fetchDocuments]);

  const handleGenerate = async () => {
    if (!selectedCase) return alert('Please select a case');
    setLoading(true);
    try {
      await generateReport(selectedCase, docType);
      navigate('/documents');
    } catch (err) {
      console.error(err);
      alert('Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Generate AI Report</h1>
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
          Select a case to generate an official document using SmartCase AI. The AI will synthesize all FIR details and investigation timeline entries into a cohesive report.
        </p>

        <div className="form-group">
          <label className="form-label">Select Case</label>
          <select className="select" value={selectedCase} onChange={(e) => setSelectedCase(e.target.value)}>
            <option value="">-- Choose a Case --</option>
            {cases.map(c => (
              <option key={c.id} value={c.id}>
                {c.id} - {c.firNumber} ({c.complainantName})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label className="form-label">Report Type</label>
          <select className="select" value={docType} onChange={(e) => setDocType(e.target.value)}>
            <option value="CASE_SUMMARY">Case Summary</option>
            <option value="INVESTIGATION_REPORT">Detailed Investigation Report</option>
          </select>
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%' }} 
          onClick={handleGenerate} 
          disabled={loading || !selectedCase}
        >
          {loading ? 'Generating AI Report... Please wait' : 'Generate Report'}
        </button>
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Recently Generated for this Case</h2>
      <div className="card">
        {documents.filter(d => d.caseId === selectedCase).length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>No reports found for the selected case.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Date Generated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.filter(d => d.caseId === selectedCase).map(doc => (
                  <tr key={doc.id}>
                    <td>{doc.documentName || doc.reportSummary}</td>
                    <td>{new Date(doc.createdAt).toLocaleString()}</td>
                    <td><button className="btn btn-secondary" onClick={() => navigate('/documents')}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
