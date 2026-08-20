import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Dashboard from './components/Dashboard';



function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '8px', background: '#333', color: '#fff' } }} />
      <div className="app-container">
        <header className="main-header">
          <div className="header-logo">
            <Activity color="var(--primary)" size={28} />
            Ministerio de Salud <span>Portal Pacientes</span>
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
