using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using everything_timeline;
using Microsoft.Extensions.Configuration;
using DbContext = everything_timeline.DbContext;

var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();

builder.Services.AddDbContext<DbContext>(options =>
{
    var connectionString = Environment.GetEnvironmentVariable("SqlConnectionString") ?? builder.Configuration.GetConnectionString("SqlConnectionString");
    options.UseSqlServer(connectionString, sqlOptions => { sqlOptions.EnableRetryOnFailure(); });
});

// Services
builder.Services.AddScoped<IRepository, Repository>();
builder.Services.AddApplicationInsightsTelemetryWorkerService().ConfigureFunctionsApplicationInsights();

builder.Build().Run();
