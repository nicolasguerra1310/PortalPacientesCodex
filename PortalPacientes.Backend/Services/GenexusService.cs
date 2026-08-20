namespace PortalPacientes.Backend.Services
{
    public class GenexusService
    {
        /// <summary>
        /// Obtiene el nombre del paciente y el efector desde la base de datos de Genexus.
        /// </summary>
        public async Task<(string PatientName, string HospitalName)> GetStudyDetailsAsync(string dni, string accessionNumber)
        {
            // TODO: Aquí debes colocar tu lógica de conexión a la Base de Datos compartida de Genexus.
            // Ejemplo:
            // using var connection = new SqlConnection(_connectionString);
            // var patientName = await connection.QueryFirstOrDefaultAsync<string>("SELECT Nombre + ' ' + Apellido FROM Pacientes WHERE DNI = @dni", new { dni });
            // var hospitalName = await connection.QueryFirstOrDefaultAsync<string>("SELECT NombreEfector FROM Estudios WHERE NumeroAcceso = @accession", new { accession = accessionNumber });
            
            await Task.Delay(50); // Simula el tiempo de la consulta a la BD

            // Retornamos datos de prueba por ahora
            return (
                PatientName: "Juan Pérez (Dato de BD Genexus)", 
                HospitalName: "Hospital Padilla (Dato de BD Genexus)"
            );
        }
    }
}
