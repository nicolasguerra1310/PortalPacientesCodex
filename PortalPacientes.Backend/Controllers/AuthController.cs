using Microsoft.AspNetCore.Mvc;
using PortalPacientes.Backend.Models;
using PortalPacientes.Backend.Services;

namespace PortalPacientes.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly PacsService _pacsService;
        private readonly CaptchaService _captchaService;

        public AuthController(PacsService pacsService, CaptchaService captchaService)
        {
            _pacsService = pacsService;
            _captchaService = captchaService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Validar Captcha primero
            var isCaptchaValid = await _captchaService.ValidateCaptchaAsync(request.CaptchaToken);
            if (!isCaptchaValid)
            {
                return Unauthorized(new { Success = false, Message = "Validación de seguridad (Captcha) fallida. Por favor, intente nuevamente." });
            }

            var cleanDni = request.Dni.TrimStart('0');

            // Validar existencia del estudio en PACS usando el WS de Pentalogic
            var studyUrl = await _pacsService.GetStudyUrlAsync(cleanDni, request.AccessNumber);

            if (!string.IsNullOrEmpty(studyUrl))
            {
                var response = new LoginResponse
                {
                    Success = true,
                    Message = "Acceso exitoso",
                    Patient = new PatientData
                    {
                        FullName = "Paciente (DNI: " + cleanDni + ")",
                        Dni = cleanDni
                    },
                    Token = "fake-jwt-token-123456789"
                };
                return Ok(response);
            }

            return Unauthorized(new { Success = false, Message = "DNI o Número de Estudio incorrectos, o estudio no encontrado en el servidor de imágenes." });
        }
    }
}
