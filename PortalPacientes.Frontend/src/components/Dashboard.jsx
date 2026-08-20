import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, LogOut, Image as ImageIcon, History, Download, ExternalLink, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [currentStudy, setCurrentStudy] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('current');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reportModalData, setReportModalData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const patientData = localStorage.getItem('patient');
    if (!token || !patientData) {
      navigate('/');
      return;
    }
    
    const parsedPatient = JSON.parse(patientData);
    setPatient(parsedPatient);
    
    const accessNumber = localStorage.getItem('currentAccessNumber');

    const fetchData = async () => {
      try {
        const histRes = await fetch(`http://localhost:5075/api/study/history?dni=${parsedPatient.dni}`);
        if (histRes.ok) {
          const histData = await histRes.json();
          if (histData.success) {
            setHistory(histData.history || []);
          } else {
            toast.error('Error al obtener el historial.');
          }
        }

        const currRes = await fetch(`http://localhost:5075/api/study/current?dni=${parsedPatient.dni}&accessionNumber=${accessNumber}`);
        if (currRes.ok) {
          const currData = await currRes.json();
          if (currData.success) {
            setCurrentStudy(currData);
          } else {
            toast.error(currData.message || 'Error al obtener el estudio actual.');
          }
        }
      } catch (err) {
        console.error(err);
        toast.error('Ocurrió un error al cargar la información.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        setReportModalData(null);
      }
    };
    if (reportModalData) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [reportModalData]);

  const handleLogout = () => {
    localStorage.removeItem('currentAccessNumber');
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  const getDownloadReportUrl = (accessionNo) => {
    const dni = patient?.dni || '';
    return `http://localhost:5075/api/study/download-report?dni=${dni}&accessionNumber=${accessionNo}`;
  };

  if (loading) {
    return (
      <div className="dashboard-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="skeleton skeleton-title"></div>
        <div className="glass-panel" style={{ padding: '2rem' }}>
           <div className="skeleton skeleton-title" style={{ width: '30%' }}></div>
           <div className="skeleton skeleton-text"></div>
           <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
           <div className="skeleton skeleton-card" style={{ height: '200px', marginTop: '2rem' }}></div>
        </div>
      </div>
    );
  }

  const currentAccessNo = localStorage.getItem('currentAccessNumber');
  const currentStudyDetails = history?.find(s => s.accession_no === currentAccessNo) || history?.[0];
  
  // Preferimos los datos traidos del Backend (Genexus) para el estudio actual
  const displayPatientName = currentStudy?.patientName || patient?.fullName;
  const displayHospital = currentStudy?.hospitalName || 'Ministerio de Salud';
  
  // Si el backend no pudo obtener la URL de getstudyurl, usamos la de getstudylist (history)
  const studyUrlToUse = currentStudy?.studyUrl || currentStudyDetails?.url;

  return (
    <div className="animate-fade-in dashboard-container" style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', color: 'var(--primary)' }}>Bienvenido, {displayPatientName}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>DNI: {patient?.dni}</p>
        </div>
        <button onClick={handleLogout} className="btn-primary" style={{ backgroundColor: 'transparent', color: 'var(--error)', border: '1px solid var(--error)', padding: '0.5rem 1rem' }}>
          <LogOut size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Cerrar Sesión
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('current')}
          style={{ background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: activeTab === 'current' ? '600' : '400', color: activeTab === 'current' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem 1rem', borderBottom: activeTab === 'current' ? '2px solid var(--primary)' : 'none' }}
        >
          <ImageIcon size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}/> Estudio Actual
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          style={{ background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: activeTab === 'history' ? '600' : '400', color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem 1rem', borderBottom: activeTab === 'history' ? '2px solid var(--primary)' : 'none' }}
        >
          <History size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}/> Mi Historial
        </button>
      </div>

      {activeTab === 'current' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            Estudio Actual Consultado
          </h3>
          
          <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <strong>Estudio:</strong> {currentStudyDetails?.study_desc || 'Estudio de Diagnóstico por Imágenes'}
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              <strong>Efector / Hospital:</strong> {displayHospital}
            </p>
            <p style={{ color: 'var(--text-muted)' }}>
              <strong>Número de Acceso:</strong> {currentAccessNo}
            </p>
          </div>

          <div className="current-study-buttons" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {studyUrlToUse ? (
              <a href={studyUrlToUse} target="_blank" rel="noreferrer" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flex: '1', minWidth: '200px', fontSize: '1.1rem', padding: '1rem' }}>
                <ImageIcon size={24} />
                VER IMAGEN
              </a>
            ) : (
               <div style={{ flex: '1', padding: '1rem', textAlign: 'center', background: '#fef2f2', color: 'var(--error)', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca' }}>
                 No hay imágenes disponibles para este estudio.
               </div>
            )}

            {currentStudy?.informeUrl ? (
               <div style={{ display: 'flex', gap: '0.5rem', flex: '1', minWidth: '240px' }}>
                 <button 
                   onClick={() => setReportModalData({ url: currentStudy.informeUrl, accessionNo: currentAccessNo, desc: currentStudyDetails?.study_desc })} 
                   className="btn-primary" 
                   style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flex: '1', fontSize: '1.1rem', padding: '1rem', backgroundColor: '#334155', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: 'white' }}
                 >
                   <FileText size={24} />
                   VER INFORME
                 </button>
                 <a 
                   href={getDownloadReportUrl(currentAccessNo)} 
                   download={`Informe_${currentAccessNo}.pdf`}
                   title="Descarga directa del informe en PDF"
                   className="btn-primary" 
                   style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '1rem 1.25rem', backgroundColor: '#1e293b', color: 'white', textDecoration: 'none' }}
                   onClick={() => toast.success('Descargando informe...')}
                 >
                   <Download size={24} />
                 </a>
               </div>
            ) : (
               <div style={{ flex: '1', padding: '1rem', textAlign: 'center', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                 El informe médico aún no está disponible.
               </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Historial de Estudios</h3>
          {history && history.length > 0 ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {history.slice((currentPage - 1) * 10, currentPage * 10).map((study, idx) => (
                  <div key={idx} className="history-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--primary)', minHeight: '1.5rem' }}>
                        {study.study_desc || 'Estudio de Diagnóstico'}
                      </h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        <strong>Fecha:</strong> {study.study_datetime} | <strong>Acceso:</strong> {study.accession_no} <br/>
                        <strong>Institución:</strong> {study.institution_name || study.hospital || study.location || study.institution || 'Ministerio de Salud'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '180px' }}>
                      <a href={study.url} target="_blank" rel="noreferrer" className="btn-primary" style={{ textDecoration: 'none', whiteSpace: 'nowrap', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                        <ImageIcon size={18} /> VER IMAGEN
                      </a>
                      {study.informeUrl && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => setReportModalData({ url: study.informeUrl, accessionNo: study.accession_no, desc: study.study_desc })} 
                            className="btn-primary" 
                            style={{ flex: 1, padding: '0.5rem 0.75rem', backgroundColor: '#334155', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: 'white', fontSize: '0.875rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <FileText size={16} /> VER INFORME
                          </button>
                          <a 
                            href={getDownloadReportUrl(study.accession_no)} 
                            download={`Informe_${study.accession_no}.pdf`}
                            title="Descargar informe PDF"
                            className="btn-primary" 
                            style={{ padding: '0.5rem 0.75rem', backgroundColor: '#1e293b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', textDecoration: 'none' }}
                            onClick={() => toast.success('Descargando informe...')}
                          >
                            <Download size={16} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {history.length > 10 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '2rem', gap: '1rem' }}>
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    disabled={currentPage === 1}
                    className="btn-primary" 
                    style={{ padding: '0.5rem 1rem', background: currentPage === 1 ? '#cbd5e1' : 'var(--primary)' }}
                  >
                    Anterior
                  </button>
                  <span style={{ color: 'var(--text-muted)' }}>Página {currentPage} de {Math.ceil(history.length / 10)}</span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(history.length / 10), p + 1))} 
                    disabled={currentPage === Math.ceil(history.length / 10)}
                    className="btn-primary"
                    style={{ padding: '0.5rem 1rem', background: currentPage === Math.ceil(history.length / 10) ? '#cbd5e1' : 'var(--primary)' }}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
                No se encontraron estudios en su historial para los últimos 10 años.
            </div>
          )}
        </div>
      )}

      {reportModalData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }} onClick={() => setReportModalData(null)}>
          <div style={{ width: '100%', maxWidth: '950px', height: '92vh', background: '#fff', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '200px' }}>
                <FileText size={22} color="var(--primary)" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: 1.2 }}>Informe Médico</h3>
                  <small style={{ color: 'var(--text-muted)' }}>{reportModalData.desc || `Estudio N° ${reportModalData.accessionNo}`}</small>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <a 
                  href={reportModalData.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn-primary" 
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', backgroundColor: '#f1f5f9', color: 'var(--text-main)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', boxShadow: 'none' }}
                >
                  <ExternalLink size={15} /> <span className="hide-mobile">Abrir en pestaña</span>
                </a>
                <a 
                  href={getDownloadReportUrl(reportModalData.accessionNo)} 
                  download={`Informe_${reportModalData.accessionNo}.pdf`}
                  className="btn-primary" 
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  onClick={() => toast.success('Descargando informe...')}
                >
                  <Download size={15} /> Descargar PDF
                </a>
                <button 
                  onClick={() => setReportModalData(null)} 
                  title="Cerrar visor (ESC)"
                  style={{ background: '#fee2e2', border: '1px solid #fca5a5', cursor: 'pointer', padding: '0.45rem 0.85rem', color: '#dc2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}
                  aria-label="Cerrar"
                >
                  <X size={18} /> Cerrar
                </button>
              </div>
            </div>
            <div style={{ flex: 1, position: 'relative', backgroundColor: '#525659' }}>
              <iframe src={reportModalData.url} style={{ width: '100%', height: '100%', border: 'none' }} title="Informe Médico" />
            </div>
            <div style={{ padding: '0.5rem 1.25rem', background: '#f8fafc', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span>💡 ¿Problemas para visualizar el visor en tu móvil?</span>
              <a href={reportModalData.url} target="_blank" rel="noreferrer" style={{ fontWeight: 600, color: 'var(--primary)' }}>
                Abrir PDF directo en pantalla completa
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
