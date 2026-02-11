using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace Everything.Function;

public class GetEventsAndPeriods
{
    private readonly ILogger<GetEventsAndPeriods> _logger;

    public GetEventsAndPeriods(ILogger<GetEventsAndPeriods> logger)
    {
        _logger = logger;
    }

    [Function("GetEventsAndPeriods")]
    public IActionResult Run([HttpTrigger(AuthorizationLevel.Function, "get", "post")] HttpRequest req)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");
        return new OkObjectResult("Welcome to Azure Functions!");
    }
}