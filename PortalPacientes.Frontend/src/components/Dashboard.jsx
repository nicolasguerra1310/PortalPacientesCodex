import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, LogOut, Image as ImageIcon, History, Download, ExternalLink, X, Building, Hash, CheckCircle, Clock, FolderSearch, Search, RefreshCw, Share2, Filter, ArrowDownAZ, ArrowUpAZ, Moon, Sun } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [currentStudy, setCurrentStudy] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('current');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reportModalData, setReportModalData] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('DESC');

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const fetchDashboardData = useCallback(async (parsedPatient, accessNumber, showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const histRes = await fetch(`/api/study/history?dni=${parsedPatient.dni}`);
      if (histRes.ok) {
        const histData = await histRes.json();
        if (histData.success) {
          setHistory(histData.history || []);
        } else {
          if (!showRefreshIndicator) toast.error('Error al obtener el historial.');
        }
      }

      const currRes = await fetch(`/api/study/current?dni=${parsedPatient.dni}&accessionNumber=${accessNumber}`);
      if (currRes.ok) {
        const currData = await currRes.json();
        if (currData.success) {
          setCurrentStudy(currData);
        } else {
          if (!showRefreshIndicator) toast.error(currData.message || 'Error al obtener el estudio actual.');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Ocurrió un error al cargar la información.');
    } finally {
      if (showRefreshIndicator) {
        setIsRefreshing(false);
        toast.success('Información actualizada');
      }
      setLoading(false);
    }
  }, []);

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
    
    fetchDashboardData(parsedPatient, accessNumber, false);
  }, [navigate, fetchDashboardData]);

  const handleLogout = useCallback((reason) => {
    localStorage.removeItem('currentAccessNumber');
    localStorage.removeItem('token');
    if (reason === 'inactivity') {
      toast('Sesión cerrada por inactividad (15 min)', { icon: '🔒', duration: 5000 });
    } else {
      toast.success('Sesión cerrada correctamente');
    }
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      // 15 minutes = 15 * 60 * 1000 = 900000 ms
      timeoutId = setTimeout(() => {
        handleLogout('inactivity');
      }, 900000); 
    };

    const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [handleLogout]);

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

  const handleManualRefresh = () => {
    const accessNumber = localStorage.getItem('currentAccessNumber');
    if (patient) {
      fetchDashboardData(patient, accessNumber, true);
    }
  };

  const handleShareLink = async (url, studyDesc) => {
    const desc = studyDesc || 'Estudio de Diagnóstico';
    
    const fallbackCopy = (text) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success('Enlace copiado al portapapeles');
      } catch (err) {
        toast.error('No se pudo copiar el enlace automáticamente');
      }
      document.body.removeChild(textArea);
    };

    if (navigator.share && window.isSecureContext) {
      try {
        await navigator.share({
          title: 'Portal de Imágenes - Ministerio de Salud',
          text: `Te comparto el enlace a mi estudio médico (${desc}):`,
          url: url
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          fallbackCopy(url);
        }
      }
    } else {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url)
          .then(() => toast.success('Enlace copiado al portapapeles'))
          .catch(() => fallbackCopy(url));
      } else {
        fallbackCopy(url);
      }
    }
  };

  const handleViewReport = (url, accessionNo, desc) => {
    if (window.innerWidth <= 768) {
      window.open(url, '_blank');
    } else {
      setReportModalData({ url, accessionNo, desc });
    }
  };

  const getDownloadReportUrl = (accessionNo) => {
    const dni = patient?.dni || '';
    return `/api/study/download-report?dni=${dni}&accessionNumber=${accessionNo}`;
  };

  if (loading) {
    return (
      <div className="dashboard-container" style={{ width: '100%', padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <div className="skeleton" style={{ height: '2rem', width: '250px', marginBottom: '0.5rem', borderRadius: '4px' }}></div>
            <div className="skeleton" style={{ height: '1rem', width: '150px', borderRadius: '4px' }}></div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div className="skeleton hide-mobile" style={{ height: '40px', width: '120px', borderRadius: '8px' }}></div>
            <div className="skeleton" style={{ height: '40px', width: '150px', borderRadius: '8px' }}></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <div className="skeleton" style={{ height: '40px', width: '140px', borderRadius: '999px' }}></div>
          <div className="skeleton" style={{ height: '40px', width: '140px', borderRadius: '999px' }}></div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--border)' }}>
           <div className="skeleton" style={{ height: '1.5rem', width: '30%', marginBottom: '1.5rem', borderRadius: '4px' }}></div>
           
           <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '1.5rem' }}>
             <div className="skeleton" style={{ height: '1.2rem', width: '60%', marginBottom: '0.75rem', borderRadius: '4px' }}></div>
             <div className="skeleton" style={{ height: '1rem', width: '40%', marginBottom: '0.5rem', borderRadius: '4px' }}></div>
             <div className="skeleton" style={{ height: '1rem', width: '30%', borderRadius: '4px' }}></div>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                 <div className="skeleton" style={{ height: '48px', flex: 1, borderRadius: '8px' }}></div>
                 <div className="skeleton" style={{ height: '48px', width: '56px', borderRadius: '8px' }}></div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                 <div className="skeleton" style={{ height: '48px', flex: 1, borderRadius: '8px' }}></div>
                 <div className="skeleton" style={{ height: '48px', width: '56px', borderRadius: '8px' }}></div>
              </div>
           </div>
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
  
  const filteredHistory = (history || [])
    .filter(study => {
      const search = searchTerm.trim().toLowerCase();
      
      let matchStatus = true;
      if (filterStatus === 'READY') matchStatus = !!study.informeUrl;
      if (filterStatus === 'PENDING') matchStatus = !study.informeUrl;

      if (!search) return matchStatus;

      const studyDesc = (study.study_desc || '').toLowerCase();
      const accessionNo = (study.accession_no || '').toLowerCase();
      const modality = (study.mods_in_study || '').toLowerCase();

      const hospital = (
        study.institution_name || 
        study.hospital || 
        study.hospitalName || 
        study.hospital_name || 
        study.location || 
        study.institution || 
        study.efector || 
        'Ministerio de Salud'
      ).toLowerCase();

      const rawDate = (study.study_datetime || '').toLowerCase();
      let slashDate = '';
      let slashDateShortYear = '';
      let formattedDateEs = '';

      if (study.study_datetime) {
        const dateParts = study.study_datetime.split(' ')[0].split('-');
        if (dateParts.length === 3) {
          const [year, month, day] = dateParts;
          slashDate = `${day}/${month}/${year}`;
          slashDateShortYear = `${day}/${month}/${year.slice(-2)}`;
          const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (!isNaN(dateObj.getTime())) {
            formattedDateEs = dateObj.toLocaleDateString('es-AR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }).toLowerCase();
          }
        }
      }

      const matchSearch = 
        studyDesc.includes(search) ||
        accessionNo.includes(search) ||
        modality.includes(search) ||
        hospital.includes(search) ||
        rawDate.includes(search) ||
        slashDate.includes(search) ||
        slashDateShortYear.includes(search) ||
        formattedDateEs.includes(search);

      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.study_datetime);
      const dateB = new Date(b.study_datetime);
      return sortOrder === 'DESC' ? dateB - dateA : dateA - dateB;
    });

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);

  return (
    <div className="animate-fade-in dashboard-container" style={{ width: '100%' }}>
      <div className="dashboard-header-container">
        <div>
          <h2 className="dashboard-title">Bienvenido, {displayPatientName}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>DNI: {patient?.dni}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button 
            onClick={toggleTheme} 
            className="btn-primary" 
            style={{ height: '42px', width: '42px', backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            title="Cambiar tema"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button 
            onClick={handleManualRefresh} 
            className="btn-primary" 
            style={{ height: '42px', padding: '0 1rem', backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            disabled={isRefreshing}
            title="Actualizar datos"
          >
            <RefreshCw size={18} className={isRefreshing ? "spin-animation" : ""} /> <span className="logout-text">Actualizar</span>
          </button>
          <button 
            onClick={() => handleLogout('user')} 
            className="btn-primary" 
            style={{ height: '42px', padding: '0 1rem', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
          >
            <LogOut size={18} /> <span className="logout-text">Salir</span>
          </button>
        </div>
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
          
          <div style={{ padding: '1rem', backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '1rem', marginBottom: '0.25rem', fontWeight: 600 }}>
              {currentStudyDetails?.study_desc || 'Estudio de Diagnóstico por Imágenes'}
            </p>
            <div className="card-metadata">
              <span className="meta-item"><Building size={16}/> {displayHospital}</span>
              <span className="meta-item"><Hash size={16}/> {currentAccessNo}</span>
            </div>
          </div>

          <div className="current-study-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {studyUrlToUse ? (
              <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                <a href={studyUrlToUse} target="_blank" rel="noreferrer" className="btn-primary" style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem', padding: '0.75rem' }}>
                  <ImageIcon size={20} />
                  <span className="hide-mobile">VER </span>IMAGEN
                </a>
                <button 
                  onClick={() => handleShareLink(studyUrlToUse, currentStudyDetails?.study_desc)}
                  className="btn-primary" 
                  title="Compartir enlace de imagen"
                  style={{ width: '56px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0', backgroundColor: 'var(--btn-secondary)', color: 'var(--text-main)', border: '1px solid var(--btn-secondary-border)' }}
                >
                  <Share2 size={20} />
                </button>
              </div>
            ) : (
               <div style={{ padding: '0.75rem', textAlign: 'center', background: '#fef2f2', color: 'var(--error)', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca', fontSize: '0.9rem' }}>
                 No hay imágenes disponibles para este estudio.
               </div>
            )}

            {currentStudy?.informeUrl ? (
               <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                 <button 
                   onClick={() => handleViewReport(currentStudy.informeUrl, currentAccessNo, currentStudyDetails?.study_desc)} 
                   className="btn-primary" 
                   style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem', padding: '0.75rem', backgroundColor: 'var(--btn-dark)', border: 'none', cursor: 'pointer', color: 'white' }}
                 >
                   <FileText size={20} />
                   <span className="hide-mobile">VER </span>INFORME
                 </button>
                 <a 
                   href={getDownloadReportUrl(currentAccessNo)} 
                   download={`Informe_${currentAccessNo}.pdf`}
                   title="Descarga directa del informe en PDF"
                   className="btn-primary" 
                   style={{ width: '56px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0', backgroundColor: 'var(--btn-darker)', color: 'white', textDecoration: 'none' }}
                   onClick={() => toast.success('Descargando informe...')}
                 >
                   <Download size={20} />
                 </a>
               </div>
            ) : (
               <div style={{ padding: '0.75rem', textAlign: 'center', background: 'var(--panel-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                 El informe médico aún no está disponible.
               </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="glass-panel glass-panel-responsive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.15rem' }}>Historial de Estudios</h3>
              {history && history.length > 0 && (
                <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
                  <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Buscar por estudio, efector, fecha..." 
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    style={{ width: '100%', padding: '0.5rem 2.2rem 0.5rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', outline: 'none', fontSize: '0.95rem' }}
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                      style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center' }}
                      title="Limpiar búsqueda"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {history && history.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%' }}>
                <button 
                  onClick={() => { 
                    setFilterStatus(prev => prev === 'ALL' ? 'READY' : prev === 'READY' ? 'PENDING' : 'ALL'); 
                    setCurrentPage(1); 
                  }}
                  className="btn-primary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: filterStatus !== 'ALL' ? 'var(--primary)' : 'var(--card-bg)', color: filterStatus !== 'ALL' ? 'white' : 'var(--text-muted)', border: '1px solid', borderColor: filterStatus !== 'ALL' ? 'var(--primary)' : 'var(--border)' }}
                >
                  <Filter size={14} /> 
                  {filterStatus === 'ALL' ? 'Todos' : filterStatus === 'READY' ? 'Con informe' : 'Sin informe'}
                </button>
                <button 
                  onClick={() => { setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC'); setCurrentPage(1); }}
                  className="btn-primary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'white', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                >
                  {sortOrder === 'DESC' ? <ArrowDownAZ size={14} /> : <ArrowUpAZ size={14} />} 
                  {sortOrder === 'DESC' ? 'Más recientes' : 'Más antiguos'}
                </button>
              </div>
            )}
          </div>

          {history && history.length > 0 ? (
            <>
              {filteredHistory.length === 0 ? (
                <div style={{ padding: '3rem 2rem', textAlign: 'center', background: 'var(--panel-bg)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', border: '2px dashed var(--border)' }}>
                  <FolderSearch size={40} style={{ color: 'var(--btn-secondary-border)', marginBottom: '1rem' }} />
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>No se encontraron resultados</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>Intenta con otro término de búsqueda.</p>
                </div>
              ) : (
                <div className="history-grid">
                  {filteredHistory.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((study, idx) => (
                  <div key={idx} className="history-card">
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
                      {study.informeUrl ? (
                        <span className="badge badge-success"><CheckCircle size={12}/> Listo</span>
                      ) : (
                        <span className="badge badge-pending"><Clock size={12}/> Proceso</span>
                      )}
                    </div>
                    
                    <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
                      <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: 1.3, margin: '0 0 0.75rem 0', fontWeight: 600, paddingRight: '5rem' }}>
                        {study.study_desc || 'Estudio de Diagnóstico'}
                      </h4>
                      <div className="card-metadata">
                        <span className="meta-item"><Calendar size={14}/> {study.study_datetime}</span>
                        <span className="meta-item"><Hash size={14}/> {study.accession_no}</span>
                        <span className="meta-item" style={{ alignItems: 'flex-start' }}><Building size={14} style={{ marginTop: '2px', flexShrink: 0 }}/> <span>{study.institution_name || study.hospital || study.location || study.institution || 'Ministerio de Salud'}</span></span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                        <a href={study.url} target="_blank" rel="noreferrer" className="btn-primary" style={{ flex: '1', padding: '0.75rem', textDecoration: 'none', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                          <ImageIcon size={18} /> <span className="hide-mobile">VER </span>IMAGEN
                        </a>
                        <button 
                          onClick={() => handleShareLink(study.url, study.study_desc)}
                          className="btn-primary" 
                          title="Compartir enlace de imagen"
                          style={{ width: '56px', flexShrink: 0, padding: '0', backgroundColor: 'var(--btn-secondary)', color: 'var(--text-main)', border: '1px solid var(--btn-secondary-border)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                          <Share2 size={18} />
                        </button>
                      </div>
                      
                      {study.informeUrl ? (
                        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                          <button 
                            onClick={() => handleViewReport(study.informeUrl, study.accession_no, study.study_desc)} 
                            className="btn-primary" 
                            style={{ flex: '1', padding: '0.75rem', backgroundColor: 'var(--btn-dark)', border: 'none', cursor: 'pointer', color: 'white', fontSize: '0.95rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                          >
                            <FileText size={18} /> <span className="hide-mobile">VER </span>INFORME
                          </button>
                          <a 
                            href={getDownloadReportUrl(study.accession_no)} 
                            download={`Informe_${study.accession_no}.pdf`}
                            title="Descarga directa del informe en PDF"
                            className="btn-primary" 
                            style={{ width: '56px', flexShrink: 0, padding: '0', backgroundColor: 'var(--btn-darker)', color: 'white', border: 'none', textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            onClick={() => toast.success('Descargando informe...')}
                          >
                            <Download size={18} />
                          </a>
                        </div>
                      ) : (
                        <div style={{ padding: '0.75rem', backgroundColor: 'var(--panel-bg)', color: '#94a3b8', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 'var(--radius-md)', border: '1px dashed var(--btn-secondary-border)', textAlign: 'center' }}>
                          Informe no disponible
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              )}
              
              {filteredHistory.length > ITEMS_PER_PAGE && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1.5rem', gap: '1rem' }}>
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    disabled={currentPage === 1}
                    className="btn-primary" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', background: currentPage === 1 ? 'var(--btn-secondary-border)' : 'var(--primary)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    Anterior
                  </button>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Página {currentPage} de {totalPages}</span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                    disabled={currentPage === totalPages}
                    className="btn-primary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', background: currentPage === totalPages ? 'var(--btn-secondary-border)' : 'var(--primary)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--panel-bg)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                <FolderSearch size={48} style={{ color: 'var(--btn-secondary-border)' }} />
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
          <div style={{ width: '100%', maxWidth: '950px', height: '92vh', background: 'var(--card-bg)', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--panel-bg)', flexWrap: 'wrap', gap: '0.5rem' }}>
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
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', backgroundColor: 'var(--panel-bg-alt)', color: 'var(--text-main)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', boxShadow: 'none' }}
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
            <div style={{ padding: '0.5rem 1.25rem', background: 'var(--panel-bg)', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
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
