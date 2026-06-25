export default function About() {
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>

      {/* Page Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="page-title">About SmartCase AI</h1>
        <p className="page-subtitle">Project information, developer profile, and user guide</p>
      </div>

      {/* Developer Profile Card */}
      <div className="about-profile-card" style={{ marginBottom: '2rem' }}>
        {/* Dark Header */}
        <div className="about-profile-header">
          <img
            src="/dev-sharma.jpg"
            alt="Dev Sharma"
            className="about-avatar"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div>
            <div className="about-name">Dev Sharma</div>
            <div className="about-role">Final Year Student · Information Technology</div>
            <div className="about-tags" style={{ marginTop: '0.625rem' }}>
              <span className="about-tag" style={{ background: 'rgba(255,255,255,0.1)', color: '#e4e4e7', border: '1px solid rgba(255,255,255,0.15)' }}>🔐 Cyber Security Aspirant</span>
              <span className="about-tag" style={{ background: 'rgba(255,255,255,0.1)', color: '#e4e4e7', border: '1px solid rgba(255,255,255,0.15)' }}>📹 Content Creator</span>
              <span className="about-tag" style={{ background: 'rgba(255,255,255,0.1)', color: '#e4e4e7', border: '1px solid rgba(255,255,255,0.15)' }}>💻 IBM × GTU Intern</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="about-profile-body">
          {/* Info Grid */}
          <div className="about-info-grid">
            <div className="about-info-item">
              <label>Institution</label>
              <span>Government Polytechnic Kheda</span>
            </div>
            <div className="about-info-item">
              <label>Department</label>
              <span>Information Technology (DTE)</span>
            </div>
            <div className="about-info-item">
              <label>Internship</label>
              <span>IBM × GTU Internship Program</span>
            </div>
            <div className="about-info-item">
              <label>Project</label>
              <span>SmartCase AI — Final Year MVP</span>
            </div>
          </div>

          <hr className="divider" />

          {/* Social Links */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a
              href="https://www.instagram.com/Hustle.With.Dev"
              target="_blank"
              rel="noopener noreferrer"
              className="about-social-link"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              @Hustle.With.Dev
            </a>

            <a
              href="https://www.linkedin.com/in/dev-sharma-gp-kheda-it-dte-3538ba375"
              target="_blank"
              rel="noopener noreferrer"
              className="about-social-link"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn Profile
            </a>
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="section-title" style={{ marginBottom: '1rem' }}>About This Project</div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          <strong style={{ color: 'var(--text-primary)' }}>SmartCase AI</strong> is a police case documentation workflow system developed as an IBM × GTU Internship final year project at Government Polytechnic Kheda. The system enables investigating officers to register FIRs, track investigation progress through Case Diary entries, and automatically generate structured legal reports using Google Gemini AI — eliminating repetitive paperwork and ensuring all documentation is derived from a single source of truth.
        </p>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Stack</div>
            <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>React · TypeScript · Express · Gemini API</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Year</div>
            <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>2026</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Type</div>
            <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>MVP Prototype</div>
          </div>
        </div>
      </div>

      {/* Quick Guide */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: '1.25rem' }}>Quick User Guide</div>

        <div className="guide-step">
          <div className="guide-step-num">1</div>
          <div>
            <div className="guide-step-title">Dashboard</div>
            <div className="guide-step-desc">View all active case counts and a quick table of recent cases. Use the "Create FIR" button to start a new case.</div>
          </div>
        </div>

        <div className="guide-step">
          <div className="guide-step-num">2</div>
          <div>
            <div className="guide-step-title">Create FIR</div>
            <div className="guide-step-desc">Fill in the FIR Number, incident date, location, complainant details, accused details, and crime description. Submitting creates a unified Case record.</div>
          </div>
        </div>

        <div className="guide-step">
          <div className="guide-step-num">3</div>
          <div>
            <div className="guide-step-title">Cases</div>
            <div className="guide-step-desc">View all registered cases in a table. Click "View Details" to open a specific case and update its status.</div>
          </div>
        </div>

        <div className="guide-step">
          <div className="guide-step-num">4</div>
          <div>
            <div className="guide-step-title">Case Diary</div>
            <div className="guide-step-desc">Add chronological investigation entries — Spot Visits, Witness Statements, Evidence Collection, Arrests, etc. Each entry is timestamped and linked to the case.</div>
          </div>
        </div>

        <div className="guide-step">
          <div className="guide-step-num">5</div>
          <div>
            <div className="guide-step-title">AI Reports</div>
            <div className="guide-step-desc">Select a case and report type, then click Generate. Google Gemini AI synthesizes all case data into a formal legal document.</div>
          </div>
        </div>

        <div className="guide-step">
          <div className="guide-step-num">6</div>
          <div>
            <div className="guide-step-title">Documents</div>
            <div className="guide-step-desc">All generated AI reports are saved here. Click "View" to read a report and use "Print / Save PDF" to download it for official records.</div>
          </div>
        </div>
      </div>

    </div>
  );
}
