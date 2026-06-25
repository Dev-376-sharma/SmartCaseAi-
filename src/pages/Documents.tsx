import { useEffect, useState } from 'react';
import { useStore } from '../store/store';

export default function Documents() {
  const { documents, fetchDocuments } = useStore();
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Document Repository</h1>

      <div style={{ display: 'grid', gridTemplateColumns: selectedDoc ? '1fr 1fr' : '1fr', gap: '2rem' }}>
        
        {/* Document List */}
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Case ID</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => (
                  <tr key={doc.id} style={{ backgroundColor: selectedDoc?.id === doc.id ? '#f3f4f6' : 'transparent' }}>
                    <td style={{ fontWeight: 500 }}>{doc.documentName || doc.reportSummary}</td>
                    <td>{doc.caseId}</td>
                    <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => setSelectedDoc(doc)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {documents.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No documents found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Document Viewer */}
        {selectedDoc && (
          <div className="card" style={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{selectedDoc.documentName || selectedDoc.reportSummary}</h2>
              <button className="btn btn-secondary" onClick={() => setSelectedDoc(null)}>Close</button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#FAFAFA', padding: '1.5rem', borderRadius: '0.375rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.875rem' }}>
              {selectedDoc.content || selectedDoc.reportDetail}
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => {
                navigator.clipboard.writeText(selectedDoc.content || selectedDoc.reportDetail);
                alert('Copied to clipboard');
              }}>Copy Text</button>
              <button className="btn btn-primary" onClick={() => window.print()}>Print / Save PDF</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
