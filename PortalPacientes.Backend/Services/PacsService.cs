using System.Net.Http.Headers;
using System.Text.Json;

namespace PortalPacientes.Backend.Services
{
    public class PacsService
    {
        private readonly HttpClient _httpClient;
        private const string AuthToken = "b6cec889-f03e-4953-8bdb-6a386a3788c5";
        private const string BaseUrl = "https://pacs.siprosa.pentalogic.ar/api/study/";

        public PacsService(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _httpClient.BaseAddress = new Uri(BaseUrl);
            _httpClient.DefaultRequestHeaders.Add("Authorization", AuthToken);
        }

        public async Task<string?> GetStudyUrlAsync(string patId, string accessionNo)
        {
            try 
            {
                var response = await _httpClient.GetAsync($"getstudyurl.php?pat_id={patId}&accession_no={accessionNo}");
                if (!response.IsSuccessStatusCode) return null;
                
                var content = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"[DEBUG PACS] GetStudyUrlAsync response: {content}");
                using var doc = JsonDocument.Parse(content);
                // Si la respuesta es un objeto directo con { "url": "..." }
                if (doc.RootElement.TryGetProperty("url", out var directUrlProp))
                {
                    return directUrlProp.GetString();
                }
                
                if (doc.RootElement.TryGetProperty("result", out var resultProp))
                {
                    if (resultProp.ValueKind == JsonValueKind.Array && resultProp.GetArrayLength() > 0)
                    {
                        if (resultProp[0].TryGetProperty("url", out var urlProp))
                            return urlProp.GetString();
                    }
                    else if (resultProp.ValueKind == JsonValueKind.Object)
                    {
                        if (resultProp.TryGetProperty("url", out var urlProp))
                            return urlProp.GetString();
                    }
                }
            } 
            catch (Exception ex) 
            {
                Console.WriteLine($"Error calling GetStudyUrlAsync: {ex.Message}");
            }
            return null;
        }

        public async Task<string?> GetInformeUrlAsync(string patId, string accessionNo)
        {
            try
            {
                var response = await _httpClient.GetAsync($"getinformeurl.php?pat_id={patId}&accession_no={accessionNo}");
                if (!response.IsSuccessStatusCode) return null;

                var content = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(content);
                // Soporte para ambos formatos por seguridad
                if (doc.RootElement.TryGetProperty("url", out var directUrlProp))
                {
                    return directUrlProp.GetString();
                }
                
                if (doc.RootElement.TryGetProperty("result", out var resultProp))
                {
                    if (resultProp.ValueKind == JsonValueKind.Array && resultProp.GetArrayLength() > 0)
                    {
                        if (resultProp[0].TryGetProperty("url", out var urlProp))
                            return urlProp.GetString();
                    }
                    else if (resultProp.ValueKind == JsonValueKind.Object)
                    {
                        if (resultProp.TryGetProperty("url", out var urlProp))
                            return urlProp.GetString();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error calling GetInformeUrlAsync: {ex.Message}");
            }
            return null;
        }

        public async Task<JsonElement?> GetStudyListAsync(string patId, string fechaDesde, string fechaHasta)
        {
            try
            {
                var response = await _httpClient.GetAsync($"getstudylist.php?pat_id={patId}&fecha_desde={fechaDesde}&fecha_hasta={fechaHasta}");
                if (!response.IsSuccessStatusCode) return null;

                var content = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(content);
                if (doc.RootElement.TryGetProperty("result", out var resultProp))
                {
                    return resultProp.Clone();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error calling GetStudyListAsync: {ex.Message}");
            }
            return null;
        }
    }
}
