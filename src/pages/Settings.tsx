import { useEffect, useState } from 'react';
import { useStore } from '../store/store';

export default function Settings() {
  const { settings, fetchSettings, updateSettings } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [theme, setTheme] = useState('light');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setName(settings.name || '');
      setEmail(settings.email || '');
      setTheme(settings.theme || 'light');
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    await updateSettings({ name, email, theme });
    setSaving(false);
    alert('Settings Saved!');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Settings</h1>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Profile Information</h2>
        
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label className="form-label">Email</label>
          <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Application Preferences</h2>

        <div className="form-group">
          <label className="form-label">Theme</label>
          <select className="select" value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="light">Light (Grayscale)</option>
            <option value="dark">Dark (Deep Charcoal)</option>
          </select>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Note: The UI is currently hardcoded to the minimalist aesthetic per design specs.</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
