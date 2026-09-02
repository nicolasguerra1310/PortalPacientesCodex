import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', background: 'var(--secondary)', color: '#fff', border: '1px solid #475569', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' } }} />
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <Routes>
          <Route path="/" element={
            <>
              <header className="main-header">
                <div className="header-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src="/images/logo-ministerio.png" alt="Ministerio de Salud" className="top-header-logo" style={{ objectFit: 'contain', maxWidth: '100%' }} />
                  <span style={{ borderLeft: '2px solid var(--border)', paddingLeft: '0.75rem', color: 'var(--text-main)', fontWeight: 600 }}>Portal de Imágenes</span>
                </div>
              </header>
              <main className="main-content">
                <Login />
              </main>
              <footer className="main-footer">
                &copy; {new Date().getFullYear()} Ministerio de Salud - Portal de Pacientes
              </footer>
            </>
          } />

          <Route path="/dashboard" element={
            <>
              <header className="main-header">
                <div className="header-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src="/images/logo-ministerio.png" alt="Ministerio de Salud" className="top-header-logo" style={{ objectFit: 'contain', maxWidth: '100%' }} />
                  <span style={{ borderLeft: '2px solid var(--border)', paddingLeft: '0.75rem', color: 'var(--text-main)', fontWeight: 600 }}>Portal de Imágenes</span>
                </div>
              </header>
              <main className="main-content">
                <Dashboard />
              </main>
              <footer className="main-footer">
                &copy; {new Date().getFullYear()} Ministerio de Salud - Portal de Pacientes
              </footer>
            </>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
