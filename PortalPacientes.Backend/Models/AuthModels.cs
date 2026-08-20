namespace PortalPacientes.Backend.Models
{
    public class LoginRequest
    {
        public string Dni { get; set; } = string.Empty;
        public string AccessNumber { get; set; } = string.Empty;
        public string CaptchaToken { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public PatientData? Patient { get; set; }
        public string Token { get; set; } = string.Empty;
    }

    public class PatientData
    {
        public string FullName { get; set; } = string.Empty;
        public string Dni { get; set; } = string.Empty;
    }
}
