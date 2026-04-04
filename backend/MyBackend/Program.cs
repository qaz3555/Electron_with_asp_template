var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseUrls("http://localhost:5050");

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors();

app.MapControllers();

app.Run();