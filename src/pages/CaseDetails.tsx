import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/store';

interface LegalSection {
  section: string;
  act: string;
  title: string;
  explanation: string;
  applicability: string;
}

interface InvestigationSummary {
  overview: string;
  timeline: Array<{ date: string; activityType: string; description: string; officerNotes: string }>;
  riskIndicators: string[];
  importantEntities: string[];
}

export default function CaseDetails() {
  const { id } = useParams<{ id: string }>();
  const { cases, diaryEntries, fetchCases, fetchDiaryEntries, updateCaseStatus } = useStore();

  const [sections, setSections] = useState<LegalSection[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [summary, setSummary] = useState<InvestigationSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [activeSummaryTab, setActiveSummaryTab] = useState<'overview' | 'timeline' | 'risks' | 'entities'>('overview');

  const kase = cases.find(c => c.id === id);

  useEffect(() => {
    fetchCases();
    if (id) {
      fetchDiaryEntries(id);
      // Auto-trigger legal suggestions on load if case description exists
      if (kase?.crimeDescription) {
        triggerLegalSuggestions(kase.crimeDescription);
      }
    }
  }, [id, fetchCases, fetchDiaryEntries]);

  // Handle case description loading updates
  useEffect(() => {
    if (kase?.crimeDescription && sections.length === 0 && !loadingSections) {
      triggerLegalSuggestions(kase.crimeDescription);
    }
  }, [kase]);

  if (!kase) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
        Loading or Case Not Found...
      </div>
    );
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateCaseStatus(kase.id, e.target.value);
  };

  const triggerLegalSuggestions = async (desc: string) => {
    setLoadingSections(true);
    try {
      const res = await fetch('/api/ai/suggest-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crimeDescription: desc })
      });
      const data = await res.json();
      if (data.sections) {
        setSections(data.sections);
      }
    } catch (err) {
      console.error('Error fetching legal suggestions:', err);
    } finally {
      setLoadingSections(false);
    }
  };

  const triggerInvestigationSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch('/api/ai/investigation-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: kase.id })
      });
      const data = await res.json();
      if (data) {
        setSummary(data);
      }
    } catch (err) {
      console.error('Error fetching investigation summary:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Case Dossier: <span style={{ color: '#00a6fb' }}>{kase.id}</span>
          </h1>
          <p className="page-subtitle">Track, update, and review digital crime records and diary entries.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select value={kase.status} onChange={handleStatusChange} className="select" style={{ width: 'auto', background: 'rgba(255,255,255,0.03)' }}>
            <option value="Open">Open</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Charge Sheeted">Charge Sheeted</option>
            <option value="Closed">Closed</option>
          </select>
          <Link to={`/cases/${kase.id}/diary`} className="btn btn-primary">Add Diary Entry</Link>
          <Link to={`/ai-reports?caseId=${kase.id}`} className="btn btn-secondary">Generate Report</Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' }}>
        {/* Left Column: FIR Details */}
        <div style={{ display: 'flex', flexSpread: 'column', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <h2 className="section-title" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              FIR Information
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>FIR Number</div>
                <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '0.25rem' }}>{kase.firNumber}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Incident Date</div>
                <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '0.25rem' }}>{new Date(kase.incidentDate).toLocaleDateString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Category</div>
                <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '0.25rem' }}>{kase.crimeCategory}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Location</div>
                <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '0.25rem' }}>{kase.location}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Complainant</div>
                <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '0.25rem' }}>{kase.complainantName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{kase.complainantPhone}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{kase.complainantAddress}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Accused</div>
                <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '0.25rem' }}>{kase.accusedName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{kase.accusedAddress}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Crime Description</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>{kase.crimeDescription}</div>
            </div>
          </div>

          {/* Recent Activity / Case Diary */}
          <div className="card">
            <h2 className="section-title" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              Investigation Activity Timeline
            </h2>
            
            {diaryEntries.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
                No case diaries recorded yet. Please add diary entries to compile logs.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {diaryEntries.slice().reverse().map(entry => (
                  <div key={entry.id} style={{ borderLeft: '3px solid #00a6fb', paddingLeft: '1.25rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-6.5px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: '#00a6fb', boxShadow: '0 0 8px #00a6fb' }} />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FFFFFF', marginTop: '0.15rem' }}>{entry.activityType.replace('_', ' ')}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{entry.description}</div>
                    {entry.officerNotes && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--sidebar-label)', fontStyle: 'italic', marginTop: '0.25rem', background: 'rgba(0,166,251,0.03)', padding: '0.5rem', borderRadius: '6px' }}>
                        Notes: {entry.officerNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Link to={`/cases/${kase.id}/diary`} style={{ fontSize: '0.875rem', color: '#00a6fb', textDecoration: 'underline', fontWeight: 600 }}>
                View Full Case Diary
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: AI Side Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Widget 1: IPC / Legal Sections */}
          <div className="card" style={{ border: '1px solid rgba(0, 166, 251, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h2 className="section-title" style={{ fontSize: '1rem', color: '#00a6fb', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                AI IPC Suggestions
              </h2>
              <button 
                onClick={() => triggerLegalSuggestions(kase.crimeDescription)}
                disabled={loadingSections}
                className="btn btn-sm btn-ghost"
                style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}
              >
                {loadingSections ? 'Analyzing...' : 'Refresh'}
              </button>
            </div>

            {loadingSections ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)' }}>
                <span className="gradient-text" style={{ fontWeight: 600 }}>Analyzing offense dynamics...</span>
              </div>
            ) : sections.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No suggestions loaded. Click Refresh to analyze.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sections.map((sec, idx) => (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <span className="badge" style={{ fontSize: '0.7rem' }}>{sec.section}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{sec.act}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#FFFFFF', marginTop: '0.5rem' }}>{sec.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.4 }}>{sec.explanation}</div>
                    <div style={{ fontSize: '0.75rem', color: '#00a6fb', fontStyle: 'italic', marginTop: '0.5rem', borderTop: '1px dashed var(--border)', paddingTop: '0.5rem' }}>
                      <strong>Application:</strong> {sec.applicability}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Widget 2: AI Investigation Summary */}
          <div className="card" style={{ border: '1px solid rgba(0, 166, 251, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h2 className="section-title" style={{ fontSize: '1rem', color: '#00a6fb', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                AI Investigation Summary
              </h2>
              <button 
                onClick={triggerInvestigationSummary}
                disabled={loadingSummary}
                className="btn btn-sm btn-primary"
                style={{ fontSize: '0.75rem' }}
              >
                {loadingSummary ? 'Compiling...' : summary ? 'Re-generate' : 'Generate'}
              </button>
            </div>

            {!summary && !loadingSummary && (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Click Generate to compile AI overview, chronological timeline, risks, and entity highlights.
              </div>
            )}

            {loadingSummary && (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                <span className="gradient-text" style={{ fontWeight: 600 }}>Synthesizing docket materials...</span>
              </div>
            )}

            {summary && !loadingSummary && (
              <div>
                {/* Summary Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1rem', gap: '0.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                  {(['overview', 'timeline', 'risks', 'entities'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveSummaryTab(tab)}
                      style={{
                        padding: '0.4rem 0.6rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        borderRadius: '6px',
                        background: activeSummaryTab === tab ? 'rgba(0,166,251,0.1)' : 'transparent',
                        color: activeSummaryTab === tab ? '#00a6fb' : 'var(--text-muted)'
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                {activeSummaryTab === 'overview' && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {summary.overview}
                  </div>
                )}

                {activeSummaryTab === 'timeline' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {summary.timeline.length === 0 ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No diary entries compiled in timeline yet.</span>
                    ) : (
                      summary.timeline.map((item, idx) => (
                        <div key={idx} style={{ borderLeft: '2px solid rgba(255,255,255,0.08)', paddingLeft: '0.75rem' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(item.date).toLocaleDateString()}</div>
                          <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#FFFFFF' }}>{item.activityType}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.description}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeSummaryTab === 'risks' && (
                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {summary.riskIndicators.map((risk, idx) => (
                      <li key={idx} style={{ fontSize: '0.8rem', color: '#ff6b6b' }}>
                        {risk}
                      </li>
                    ))}
                  </ul>
                )}

                {activeSummaryTab === 'entities' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {summary.importantEntities.map((ent, idx) => (
                      <span key={idx} className="badge" style={{ background: 'rgba(255,255,255,0.02)', color: '#FFFFFF', borderColor: 'var(--border)' }}>
                        {ent}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
