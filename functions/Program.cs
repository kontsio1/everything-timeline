using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using everything_timeline;
using everything_timeline.WikiSearch;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Configuration;
using DbContext = everything_timeline.DbContext;

var builder = FunctionsApplication.CreateBuilder(args);

var clientId = Environment.GetEnvironmentVariable("AzureAd__ClientId");
var authority = Environment.GetEnvironmentVariable("AzureAd__Authority");
var issuer = Environment.GetEnvironmentVariable("AzureAd__Issuer");

builder.ConfigureFunctionsWebApplication();
builder.UseFunctionsAuthorization();
// Use DarkLoop middleware for auth/authorization; custom AuthMiddleware is intentionally disabled.


builder.Services.AddFunctionsAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtFunctionsBearer(options =>
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

builder.Services.AddFunctionsAuthorization(
    options =>
    {
        options.AddPolicy("Admin", policy =>
        {
            policy.RequireAuthenticatedUser();
            policy.RequireRole("Datasets.Edit");
        });
        options.AddPolicy("User", policy =>
        {
            policy.RequireAuthenticatedUser();
        });
    });

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
builder.Services.AddSingleton<IWikiHttpClient>(new WikiHttpClient(new HttpClient()));

var host = builder.Build();

// Apply migrations on startup
using (var scope = host.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<DbContext>();
    db.Database.Migrate();
}

host.Run();