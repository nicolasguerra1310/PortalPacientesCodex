using Microsoft.AspNetCore.Mvc;
using PortalPacientes.Backend.Services;

namespace PortalPacientes.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudyController : ControllerBase
    {
        private readonly PacsService _pacsService;
        private readonly GenexusService _genexusService;

        public StudyController(PacsService pacsService, GenexusService genexusService)
        {
            _pacsService = pacsService;
            _genexusService = genexusService;
        }

        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentStudy([FromQuery] string dni, [FromQuery] string accessionNumber)
        {
            var cleanDni = dni.TrimStart('0');
            var studyUrl = await _pacsService.GetStudyUrlAsync(cleanDni, accessionNumber);
            var informeUrl = await _pacsService.GetInformeUrlAsync(cleanDni, accessionNumber);
            
            // Buscar datos adicionales en Genexus
            var genexusData = await _genexusService.GetStudyDetailsAsync(cleanDni, accessionNumber);

            return Ok(new { 
                Success = true, 
                StudyUrl = studyUrl, 
                InformeUrl = informeUrl,
                PatientName = genexusData.PatientName,
                HospitalName = genexusData.HospitalName
            });
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory([FromQuery] string dni)
        {
            var cleanDni = dni.TrimStart('0');
            // Listar últimos 10 años
            var fechaDesde = DateTime.Now.AddYears(-10).ToString("yyyy-MM-dd");
            var fechaHasta = DateTime.Now.ToString("yyyy-MM-dd");

            var historyElement = await _pacsService.GetStudyListAsync(cleanDni, fechaDesde, fechaHasta);
            
            if (historyElement.HasValue && historyElement.Value.ValueKind == System.Text.Json.JsonValueKind.Array)
            {
                var historyList = new List<Dictionary<string, object>>();
                var tasks = new List<Task>();
                
                foreach (var study in historyElement.Value.EnumerateArray())
                {
                    var dict = new Dictionary<string, object>();
                    foreach (var prop in study.EnumerateObject())
                    {
                        dict[prop.Name] = prop.Value.ToString() ?? "";
                    }
                    
                    var accessionNo = study.GetProperty("accession_no").GetString();
                    
                    historyList.Add(dict);
                    
                    var index = historyList.Count - 1;
                    tasks.Add(Task.Run(async () => {
                        var informe = await _pacsService.GetInformeUrlAsync(cleanDni, accessionNo);
                        historyList[index]["informeUrl"] = informe;
                    }));
                }
                
                await Task.WhenAll(tasks);
                
                return Ok(new { Success = true, History = historyList });
            }

            return Ok(new { 
                Success = true, 
                History = historyElement 
            });
        }

        [HttpGet("download-report")]
        public async Task<IActionResult> DownloadReport([FromQuery] string dni, [FromQuery] string accessionNumber)
        {
            if (string.IsNullOrWhiteSpace(dni) || string.IsNullOrWhiteSpace(accessionNumber))
            {
                return BadRequest(new { Success = false, Message = "DNI y Número de Estudio son requeridos." });
            }

            var cleanDni = dni.TrimStart('0');
            var informeUrl = await _pacsService.GetInformeUrlAsync(cleanDni, accessionNumber);
            if (string.IsNullOrEmpty(informeUrl))
            {
                return NotFound(new { Success = false, Message = "Informe no encontrado o no disponible en el servidor PACS." });
            }

            try
            {
                using var client = new HttpClient();
                var response = await client.GetAsync(informeUrl);
                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, "Error al obtener el archivo desde el servidor PACS.");
                }

                var bytes = await response.Content.ReadAsByteArrayAsync();
                var contentType = response.Content.Headers.ContentType?.MediaType ?? "application/pdf";
                var fileName = $"Informe_{cleanDni}_{accessionNumber}.pdf";

                return File(bytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al procesar la descarga: {ex.Message}");
            }
        }
    }
}
