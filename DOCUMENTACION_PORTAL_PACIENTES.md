# 📑 Documentación Técnica y Funcional: Portal de Pacientes

**Proyecto:** Portal de Pacientes / Portal de Imágenes  
**Organización:** Ministerio de Salud Pública  
**Estado:** En Desarrollo Activo / Versión Funcional  
**Última Actualización:** Agosto 2026  

---

## 📐 1. Resumen Ejecutivo y Arquitectura

El **Portal de Pacientes** es una plataforma web responsive desarrollada para permitir a los ciudadanos consultar de forma directa, rápida y segura sus estudios médicos de diagnóstico por imágenes (radiografías, tomografías, ecografías, mamografías, etc.) e informes en formato PDF generados en los distintos efectores de la provincia.

```
+------------------------------------+
| Dispositivo Móvil / PC del Paciente|
+------------------------------------+
                 | (HTTP / React Frontend :5173)
                 v
+------------------------------------+
| Portal Pacientes Frontend (React)  |
+------------------------------------+
                 | (REST API :5075)
                 v
+------------------------------------+
| Backend .NET Web API               |
+------------------------------------+
        |                    |
        | (HTTP REST)        | (Servicio de Integración)
        v                    v
+------------------+  +-------------------------------+
| Servidor PACS    |  | Sistema Genexus / SQL Server  |
| Pentalogic       |  +-------------------------------+
+------------------+
```

---

## 🛠️ 2. Tecnologías Utilizadas

### **Frontend**
* **Framework / Librería:** React 18 (Vite 8)
* **Enrutamiento:** `react-router-dom` (v6)
* **Iconografía:** `lucide-react`
* **Notificaciones UI:** `react-hot-toast`
* **Seguridad:** `react-google-recaptcha` (Integración Captcha)
* **Estilos:** CSS3 nativo orientado a variables CSS (`:root`, `[data-theme='dark']`), diseño responsive (Flexbox/Grid), animaciones CSS y soporte nativo para Modo Oscuro.

### **Backend**
* **Plataforma:** .NET 8 (C#) Web API
* **Servidor Web Interno:** Kestrel listening en `http://localhost:5075`
* **Cliente HTTP:** `HttpClient` optimizado para consumir las APIs del PACS Pentalogic.
* **Formatos de datos:** JSON (System.Text.Json)

### **Servicios Externos e Integraciones**
1. **PACS Pentalogic:**
   * `getstudylist.php`: Obtiene el historial de estudios por DNI del paciente.
   * `getstudyurl.php`: Obtiene la URL directa del visor DICOM interactivo.
   * `getinformeurl.php`: Obtiene el PDF del informe médico cargado.
2. **Sistema Genexus (SGC/SGH):**
   * Capa de servicio orientada a sincronizar el nombre del paciente y la identificación del efector de origen.
3. **Google reCAPTCHA:**
   * Verificación anti-bot en el inicio de sesión.

---

## 🚀 3. Ejecución y Entorno de Trabajo

El proyecto se ejecuta en un entorno Windows dentro de la red local del Ministerio de Salud.

### **Rutas del Proyecto:**
* **Directorio Raíz:** `C:\PROYECTOS\Antigravity\PortalPacientes`
* **Backend:** `C:\PROYECTOS\Antigravity\PortalPacientes\PortalPacientes.Backend`
* **Frontend:** `C:\PROYECTOS\Antigravity\PortalPacientes\PortalPacientes.Frontend`

### **Comandos de Inicio:**

#### **1. Backend (.NET Web API)**
```bash
cd C:\PROYECTOS\Antigravity\PortalPacientes\PortalPacientes.Backend
dotnet run
```
* **Puerto:** `http://localhost:5075`

#### **2. Frontend (React / Vite)**
```bash
cd C:\PROYECTOS\Antigravity\PortalPacientes\PortalPacientes.Frontend
cmd.exe /c "npm run dev -- --host"
```
* **Acceso Local (PC):** `http://localhost:5173`
* **Acceso en Red Local (Smartphones / WiFi):** `http://192.168.149.54:5173`

---

## ✨ 4. Funcionalidades Clave Implementadas

### **4.1. Autenticación y Seguridad**
* **Acceso Simplificado:** El paciente ingresa con su **DNI** y su **Número de Estudio** (Accession Number).
* **Validación Captcha:** Protección contra accesos automatizados.
* **Auto-Cierre de Sesión por Inactividad:** Cierre de sesión automático tras **15 minutos** de inactividad total detectando eventos del usuario (`mousemove`, `touchstart`, `keydown`, `click`).

### **4.2. Estudio Actual e Historial Unificado**
* **Tarjeta de Estudio Actual:** Muestra el estudio reciente solicitado, acceso al visor DICOM completo y descarga/visualización del informe.
* **Historial Unificado (10 Años):** Lista de todos los estudios del paciente registrados en el sistema provincial.
* **Indicadores de Estado (Píldoras/Badges):**
  * 🟢 **LISTO:** El informe médico en PDF está generado y disponible.
  * 🟡 **PROCESO:** El estudio existe pero el informe aún se encuentra en elaboración.

### **4.3. Filtros y Búsqueda Avanzada**
* **Filtro de 3 Estados:** Alterna mediante un botón entre `[Todos]`, `[Con informe]` y `[Sin informe]`.
* **Búsqueda Multi-Criterio:**
  * Por nombre/descripción del estudio (ej. *Ecografía*, *Mamografía*, *Resonancia*).
  * Por número de estudio / Accession Number (ej. *2026103333*).
  * Por nombre de efector / hospital (ej. *Hospital Padilla*, *Ministerio de Salud*).
  * Por fecha en múltiples formatos (`YYYY-MM-DD`, `DD/MM/YYYY`, `DD/MM/YY`, o meses en español como *Agosto*, *Mayo*).
* **Ordenamiento:** Cronológico ascendente / descendente.
* **Paginación:** 6 tarjetas por página para optimizar la carga en teléfonos de gama media/baja.

### **4.4. Experiencia Móvil y UI/UX**
* **Visor Inteligente de PDF:** En smartphones abre el PDF en pantalla completa/pestaña nativa del sistema para evitar bloqueos de `iframe` en Safari/Chrome. En PC abre un modal interactivo con loader.
* **Botoneras Adaptativas (Ratio 85/15):** Botón principal flexible (`flex: 1`) + Botón secundario cuadrado (`56px`).
* **Skeleton Loaders:** Animaciones *shimmer* de carga realista que evitan parpadeos al cargar el historial.
* **Modo Oscuro (Dark Mode):** Toggle en el encabezado (Luna/Sol) que adapta fondos, paneles, filtros y textos a tonos oscuros (`#0b1120`, `#1e293b`), persistente en `localStorage`.

---

## 🔗 5. Endpoints del Backend (`StudyController`)

| Método | Endpoint | Descripción | Parámetros |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Valida credenciales + Captcha contra PACS | `{ dni, accessNumber, captchaToken }` |
| `GET` | `/api/study/current` | Retorna URLs de imagen/informe del estudio actual | `dni`, `accessionNumber` |
| `GET` | `/api/study/history` | Retorna el historial completo de estudios (10 años) | `dni` |
| `GET` | `/api/study/download-report` | Stream directo del PDF del informe para descarga | `dni`, `accessionNumber` |

---

## 📌 6. Próximos Pasos Planificados

1. **Integración Definitiva con Genexus (Web Services / SQL Server):**
   * Reemplazar los datos simulados de paciente (`Paciente123`) por la consulta REST a la base del Sistema de Gestión Hospitalaria (SGH) de Genexus.
2. **Generación de Código QR:**
   * Permitir generar un código QR dinámico en pantalla para que los médicos escaneen el estudio del paciente desde su consultorio.
3. **PWA (Progressive Web App):**
   * Permitir instalar el portal como una App nativa en celulares Android e iOS.
