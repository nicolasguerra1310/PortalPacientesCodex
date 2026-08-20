var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Registrar servicios
builder.Services.AddHttpClient<PortalPacientes.Backend.Services.PacsService>();
builder.Services.AddHttpClient<PortalPacientes.Backend.Services.CaptchaService>();
builder.Services.AddScoped<PortalPacientes.Backend.Services.GenexusService>();

// Configurar CORS para permitir que el Frontend en React (puerto 5173) acceda a la API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Use CORS before controllers
app.UseCors("AllowFrontend");

app.MapControllers();

app.Run();
