var builder = WebApplication.CreateBuilder(args);

var urls = builder.Configuration["Urls"] ?? "http://localhost:5050";
builder.WebHost.UseUrls(urls);

builder.Services.AddControllers();

var corsOrigins = builder.Configuration["CorsOrigins"] ?? "http://localhost:5173";
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors();

app.MapControllers();

app.Run();