using System.ComponentModel.DataAnnotations;
using System.Net;
using AzureSQL.Event;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Extensions.Sql;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace everything_timeline
{
    public class GetEventsAndPeriods
    {
        private readonly ILogger<GetEventsAndPeriods> _logger;

        public GetEventsAndPeriods(ILogger<GetEventsAndPeriods> logger)
        {
            _logger = logger;
        }

        [Function("Test")]
        public IActionResult TestFunction([HttpTrigger(AuthorizationLevel.Function, "get", "post")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");
            return new OkObjectResult("Welcome to Azure Functions!");
        }

        [Function("GetEvents")]
        public HttpResponseData GetEvents(
            [HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequestData req,
            [SqlInput("SELECT * FROM dbo.Events", "SqlConnectionString")] IEnumerable<Entities.Event> events)
        {
            var response = req.CreateResponse();
            response.Headers.Add("Content-Type", "application/json");
            response.WriteStringAsync(System.Text.Json.JsonSerializer.Serialize(events));
            return response;
        }

        [Function("AddEvent")]
        [SqlOutput("dbo.Events", "SqlConnectionString")]
        public List<Entities.Event> AddEvents(
            [HttpTrigger(AuthorizationLevel.Function, "post")]
            HttpRequestData req,
            [Microsoft.Azure.Functions.Worker.Http.FromBody]
            Entities.Event[] events
        )
        {
            List<Entities.Event> eventsToAdd = new();
            foreach (var e in events)
            {
                eventsToAdd.Add(new Entities.Event
                {
                    Id = e.Id == Guid.Empty ? Guid.NewGuid() : e.Id,
                    DatasetId = e.DatasetId,
                    Name = e.Name,
                    Info = e.Info,
                    Date = e.Date
                });
                _logger.LogInformation("Adding Event data. Name: {Name}, Id: {Id}", e.Name, e.Id);
            }

            return eventsToAdd;
        }
    }
}