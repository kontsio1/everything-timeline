using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using everything_timeline;
using Microsoft.Extensions.Configuration;
using DbContext = everything_timeline.DbContext;

var builder = FunctionsApplication.CreateBuilder(args);

var clientId = Environment.GetEnvironmentVariable("AzureAd__ClientId");
var authority = Environment.GetEnvironmentVariable("AzureAd__Authority");
var issuer = Environment.GetEnvironmentVariable("AzureAd__Issuer");

builder.ConfigureFunctionsWebApplication();

builder.UseMiddleware<AuthMiddleware>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = authority;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuers = [issuer],
            ValidateAudience = true,
            ValidAudiences = [clientId],
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<DbContext>(options =>
{
    var connectionString = Environment.GetEnvironmentVariable("SqlConnectionString") ?? builder.Configuration.GetConnectionString("SqlConnectionString");
    options.UseSqlServer(connectionString, sqlOptions => { sqlOptions.EnableRetryOnFailure(); });
});

// Services
builder.Services.AddScoped<IRepository, Repository>();

var host = builder.Build();

// Apply migrations on startup
using (var scope = host.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<DbContext>();
    db.Database.Migrate();
}

host.Run();