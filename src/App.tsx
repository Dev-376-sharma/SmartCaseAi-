import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import CreateFIR from './pages/CreateFIR';
import CasesList from './pages/CasesList';
import CaseDetails from './pages/CaseDetails';
import CaseDiary from './pages/CaseDiary';
import AIReports from './pages/AIReports';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import About from './pages/About';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/fir/new" element={<CreateFIR />} />
          <Route path="/cases" element={<CasesList />} />
          <Route path="/cases/:id" element={<CaseDetails />} />
          <Route path="/cases/:id/diary" element={<CaseDiary />} />
          <Route path="/ai-reports" element={<AIReports />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
