import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, LogOut, Image as ImageIcon, History, Download, ExternalLink, X, Building, Hash, CheckCircle, Clock, FolderSearch } from 'lucide-react';
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
  const [pdfLoading, setPdfLoading] = useState(true);

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
        const histRes = await fetch(`/api/study/history?dni=${parsedPatient.dni}`);
        if (histRes.ok) {
          const histData = await histRes.json();
          if (histData.success) {
            setHistory(histData.history || []);
          } else {
            toast.error('Error al obtener el historial.');
          }
        }

        const currRes = await fetch(`/api/study/current?dni=${parsedPatient.dni}&accessionNumber=${accessNumber}`);
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
      setPdfLoading(true);
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
    return `/api/study/download-report?dni=${dni}&accessionNumber=${accessionNo}`;
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
    <div className="animate-fade-in dashboard-container" style={{ width: '100%' }}>
      <div className="dashboard-header-container">
        <div>
          <h2 className="dashboard-title">Bienvenido, {displayPatientName}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>DNI: {patient?.dni}</p>
        </div>
        <button onClick={handleLogout} className="btn-primary logout-btn">
          <LogOut size={18} /> <span className="logout-text">Cerrar Sesión</span>
        </button>
      </div>

      <div className="pill-tabs-container">
        <button 
          onClick={() => setActiveTab('current')}
          className={`pill-tab ${activeTab === 'current' ? 'active' : ''}`}
        >
          <ImageIcon size={18} style={{ marginRight: '0.25rem' }}/> Estudio Actual
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`pill-tab ${activeTab === 'history' ? 'active' : ''}`}
        >
          <History size={18} style={{ marginRight: '0.25rem' }}/> Mi Historial
        </button>
      </div>

      {activeTab === 'current' && (
        <div className="glass-panel glass-panel-responsive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontSize: '1.15rem' }}>
              Estudio Actual Consultado
            </h3>
            {currentStudy?.informeUrl ? (
              <span className="badge badge-success"><CheckCircle size={14}/> Informe Listo</span>
            ) : (
              <span className="badge badge-pending"><Clock size={14}/> En Proceso</span>
            )}
          </div>
          
          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '1rem', marginBottom: '0.25rem', fontWeight: 600 }}>
              {currentStudyDetails?.study_desc || 'Estudio de Diagnóstico por Imágenes'}
            </p>
            <div className="card-metadata">
              <span className="meta-item"><Building size={16}/> {displayHospital}</span>
              <span className="meta-item"><Hash size={16}/> {currentAccessNo}</span>
            </div>
          </div>

          <div className="current-study-buttons" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {studyUrlToUse ? (
              <a href={studyUrlToUse} target="_blank" rel="noreferrer" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flex: '1', minWidth: '200px', fontSize: '1rem', padding: '0.75rem' }}>
                <ImageIcon size={20} />
                VER IMAGEN
              </a>
            ) : (
               <div style={{ flex: '1', padding: '0.75rem', textAlign: 'center', background: '#fef2f2', color: 'var(--error)', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca', fontSize: '0.9rem' }}>
                 No hay imágenes disponibles para este estudio.
               </div>
            )}

            {currentStudy?.informeUrl ? (
               <div style={{ display: 'flex', gap: '0.5rem', flex: '1', minWidth: '240px' }}>
                 <button 
                   onClick={() => setReportModalData({ url: currentStudy.informeUrl, accessionNo: currentAccessNo, desc: currentStudyDetails?.study_desc })} 
                   className="btn-primary" 
                   style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flex: '1', fontSize: '1rem', padding: '0.75rem', backgroundColor: '#334155', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: 'white' }}
                 >
                   <FileText size={20} />
                   VER INFORME
                 </button>
                 <a 
                   href={getDownloadReportUrl(currentAccessNo)} 
                   download={`Informe_${currentAccessNo}.pdf`}
                   title="Descarga directa del informe en PDF"
                   className="btn-primary" 
                   style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 1rem', backgroundColor: '#1e293b', color: 'white', textDecoration: 'none' }}
                   onClick={() => toast.success('Descargando informe...')}
                 >
                   <Download size={20} />
                 </a>
               </div>
            ) : (
               <div style={{ flex: '1', padding: '0.75rem', textAlign: 'center', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                 El informe médico aún no está disponible.
               </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="glass-panel glass-panel-responsive">
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.15rem' }}>Historial de Estudios</h3>
          {history && history.length > 0 ? (
            <>
              <div className="history-grid">
                {history.slice((currentPage - 1) * 6, currentPage * 6).map((study, idx) => (
                  <div key={idx} className="history-card">
                    <div style={{ marginBottom: '1rem', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', lineHeight: 1.2, margin: 0, fontWeight: 600 }}>
                          {study.study_desc || 'Estudio de Diagnóstico'}
                        </h4>
                        {study.informeUrl ? (
                          <span className="badge badge-success"><CheckCircle size={12}/> Listo</span>
                        ) : (
                          <span className="badge badge-pending"><Clock size={12}/> Proceso</span>
                        )}
                      </div>
                      <div className="card-metadata">
                        <span className="meta-item"><Calendar size={14}/> {study.study_datetime}</span>
                        <span className="meta-item"><Hash size={14}/> {study.accession_no}</span>
                        <span className="meta-item" style={{ alignItems: 'flex-start' }}><Building size={14} style={{ marginTop: '2px', flexShrink: 0 }}/> <span>{study.institution_name || study.hospital || study.location || study.institution || 'Ministerio de Salud'}</span></span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', flexWrap: 'wrap' }}>
                      <a href={study.url} target="_blank" rel="noreferrer" className="btn-primary" style={{ flex: 1, minWidth: '120px', padding: '0.5rem', textDecoration: 'none', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                        <ImageIcon size={16} /> IMAGEN
                      </a>
                      
                      {study.informeUrl ? (
                          <button 
                            onClick={() => setReportModalData({ url: study.informeUrl, accessionNo: study.accession_no, desc: study.study_desc })} 
                            className="btn-primary" 
                            style={{ flex: 1, minWidth: '120px', padding: '0.5rem', backgroundColor: '#334155', border: 'none', cursor: 'pointer', color: 'white', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <FileText size={16} /> VER INFORME
                          </button>
                      ) : (
                          <div style={{ flex: 1, minWidth: '120px', padding: '0.5rem', backgroundColor: '#f8fafc', color: '#94a3b8', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 'var(--radius-md)', border: '1px dashed #cbd5e1', textAlign: 'center', lineHeight: 1.2 }}>
                            Informe no<br/>disponible
                          </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {history.length > 6 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1.5rem', gap: '1rem' }}>
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    disabled={currentPage === 1}
                    className="btn-primary" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', background: currentPage === 1 ? '#cbd5e1' : 'var(--primary)' }}
                  >
                    Anterior
                  </button>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Página {currentPage} de {Math.ceil(history.length / 6)}</span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(history.length / 6), p + 1))} 
                    disabled={currentPage === Math.ceil(history.length / 6)}
                    className="btn-primary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', background: currentPage === Math.ceil(history.length / 6) ? '#cbd5e1' : 'var(--primary)' }}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#f8fafc', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                <FolderSearch size={48} style={{ color: '#cbd5e1' }} />
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--secondary)', marginBottom: '0.25rem' }}>Aún no hay estudios en tu historial</h4>
                  <p style={{ fontSize: '0.9rem', margin: 0 }}>No registramos estudios para este paciente en los últimos 10 años.</p>
                </div>
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
              {pdfLoading && (
                <div className="pdf-loader-container">
                  <div className="pdf-loader-spinner"></div>
                  <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Cargando documento seguro...</p>
                </div>
              )}
              <iframe 
                src={reportModalData.url} 
                style={{ width: '100%', height: '100%', border: 'none', position: 'relative', zIndex: 2 }} 
                title="Informe Médico" 
                onLoad={() => setPdfLoading(false)}
              />
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
