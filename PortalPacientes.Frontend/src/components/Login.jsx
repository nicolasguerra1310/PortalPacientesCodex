import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ShieldCheck } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ dni: '', accessNumber: '' });
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const recaptchaRef = useRef();

  const [currentImage, setCurrentImage] = useState(0);
  const carouselImages = [
    '/images/carousel-1.jpg',
    '/images/carousel-2.jpg',
    '/images/carousel-3.jpg',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value.replace(/\s/g, '').replace(/^0+/, '') });
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captchaToken) {
      toast.error("Por favor, resuelva el Captcha para continuar.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          dni: formData.dni, 
          accessNumber: formData.accessNumber, 
          captchaToken: captchaToken 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('patient', JSON.stringify({
          dni: formData.dni,
          fullName: 'Paciente'
        }));
        localStorage.setItem('currentAccessNumber', formData.accessNumber);
        localStorage.setItem('token', data.token || 'fake-token-123');
        toast.success("Autenticación exitosa");
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Credenciales incorrectas');
        if (recaptchaRef.current) recaptchaRef.current.reset();
        setCaptchaToken('');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error al conectarse con el servidor. Intente nuevamente.');
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setCaptchaToken('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in login-split-container">
      <div className="login-carousel">
        {carouselImages.map((src, idx) => (
          <img 
            key={src} 
            src={src} 
            alt="Imágenes Médicas" 
            style={{ 
              position: 'absolute', 
              top: 0, left: 0, 
              width: '100%', height: '100%', 
              objectFit: 'cover', 
              opacity: currentImage === idx ? 1 : 0, 
              transition: 'opacity 1s ease-in-out',
              zIndex: 0
            }} 
          />
        ))}
        {/* Dark blue translucent overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(11, 17, 32, 0.85)', zIndex: 1 }}></div>
        
        {/* Carousel Content (Left side text) */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
           <div>
              <img src="/images/logo-ministerio-blanco.png" alt="Ministerio" style={{ height: '150px', objectFit: 'contain', maxWidth: '100%' }} />
           </div>
           
           <div style={{ maxWidth: '600px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '-4rem' }}>
              <h4 style={{ color: '#38bdf8', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.875rem', marginBottom: '1rem' }}>SISTEMA DE IMÁGENES MÉDICAS</h4>
              <h1 style={{ fontSize: '4rem', fontWeight: 'bold', lineHeight: 1.1, marginBottom: '1.5rem', color: 'white' }}>Portal de<br/>Pacientes</h1>
              <p style={{ fontSize: '1.25rem', color: '#cbd5e1', marginBottom: '2rem' }}>
                 Visualización, gestión y descarga de sus estudios de diagnóstico por imágenes.
              </p>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#cbd5e1', fontSize: '1.1rem', lineHeight: 2 }}>
                 <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '6px', height: '6px', backgroundColor: '#38bdf8', borderRadius: '50%' }}></div> Acceso con DNI y N°de estudio.</li>
                 <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '6px', height: '6px', backgroundColor: '#38bdf8', borderRadius: '50%' }}></div> Visualizacion de estudios.</li>
                 <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '6px', height: '6px', backgroundColor: '#38bdf8', borderRadius: '50%' }}></div> Descarga de informes</li>
              </ul>
           </div>
           
           <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              © {new Date().getFullYear()} Ministerio de Salud - Todos los derechos reservados.
           </div>
        </div>
      </div>

      <div className="login-form">
        <div className="login-form-content">
          <div style={{ marginBottom: '2.5rem' }}>
            <h5 style={{ color: '#38bdf8', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 600 }}>Bienvenido</h5>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'white' }}>Acceso Pacientes</h2>
            <p style={{ color: '#94a3b8' }}>Ingrese sus datos para consultar sus estudios médicos.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="floating-input-group">
            <input 
              id="dni"
              type="text" 
              name="dni" 
              value={formData.dni} 
              onChange={handleChange} 
              placeholder=" " 
              required 
            />
            <label htmlFor="dni">DNI del Paciente</label>
          </div>
          <div className="floating-input-group">
            <input 
              id="accessNumber"
              type="text" 
              name="accessNumber" 
              value={formData.accessNumber} 
              onChange={handleChange} 
              placeholder=" " 
              required 
            />
            <label htmlFor="accessNumber">Número de Acceso</label>
          </div>

            <div style={{ margin: '0.5rem 0', display: 'flex', justifyContent: 'center' }}>
              <div className="recaptcha-wrapper">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                  onChange={handleCaptchaChange}
                  theme="dark"
                />
              </div>
            </div>

            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '6px', border: 'none', backgroundColor: '#0ea5e9', color: 'white', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Validando...' : 'Consultar Estudios'}
            </button>
          </form>

          <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', borderTop: '1px solid #1e293b', paddingTop: '1.5rem', paddingBottom: '1rem' }}>
            <img src="/images/logo-ministerio-blanco.png" alt="Ministerio de Salud" className="bottom-logo" />
          </div>
        </div>
      </div>
    </div>
  );
}
