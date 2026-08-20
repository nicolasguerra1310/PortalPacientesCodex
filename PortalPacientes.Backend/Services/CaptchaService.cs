using System.Text.Json;

namespace PortalPacientes.Backend.Services
{
    public class CaptchaService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public CaptchaService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<bool> ValidateCaptchaAsync(string token)
        {
            if (string.IsNullOrEmpty(token)) return false;

            var secretKey = _configuration["Recaptcha:SecretKey"];
            
            // Llaves de prueba locales de Google
            if (secretKey == "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe")
            {
                return true; 
            }

            try
            {
                var content = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("secret", secretKey ?? ""),
                    new KeyValuePair<string, string>("response", token)
                });

                var response = await _httpClient.PostAsync("https://www.google.com/recaptcha/api/siteverify", content);
                if (!response.IsSuccessStatusCode) return false;

                var jsonString = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(jsonString);
                return doc.RootElement.TryGetProperty("success", out var successElement) && successElement.GetBoolean();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error validating Captcha: {ex.Message}");
                return false;
            }
        }
    }
}
