import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Dashboard from './components/Dashboard';



function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', background: 'var(--secondary)', color: '#fff', border: '1px solid #475569', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' } }} />
      <div className="app-container">
        <header className="main-header">
          <div className="header-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/images/logo-ministerio.png" alt="Ministerio de Salud" style={{ height: '40px', objectFit: 'contain' }} />
            <span style={{ borderLeft: '2px solid var(--border)', paddingLeft: '0.75rem', color: 'var(--text-main)', fontWeight: 600 }}>Portal de Imágenes</span>
          </div>
          {/* We could add a logout button here later if user is authenticated */}
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="main-footer">
          &copy; {new Date().getFullYear()} Ministerio de Salud - Sistema de Gestión de Imágenes (SGC/SGH)
        </footer>
      </div>
    </Router>
  );
}

export default App;
