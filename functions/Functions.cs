using System.Net;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace everything_timeline
{
    public class Functions(ILogger<Functions> logger, IRepository repository)
    {
        [Function("Test")]
        public IActionResult TestFunction([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")] HttpRequest req)
        {
            logger.LogInformation("C# HTTP trigger function processed a request.");
            return new OkObjectResult("Welcome to Azure Functions!");
        }

        [Function("GetEvents")]
        public async Task<HttpResponseData> GetEvents(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            var response = req.CreateResponse();
            response.Headers.Add("Content-Type", "application/json");

            try
            {
                // Extract dataset query parameter
                var datasetParam = req.Query["dataset"];

                if (string.IsNullOrEmpty(datasetParam))
                {
                    // If no dataset specified, return all events
                    var allEvents = await repository.GetAllEvents();
                    await response.WriteStringAsync(System.Text.Json.JsonSerializer.Serialize(allEvents));
                    return response;
                }

                // Parse dataset as Guid
                if (!Guid.TryParse(datasetParam, out Guid datasetId))
                {
                    response.StatusCode = HttpStatusCode.BadRequest;
                    await response.WriteStringAsync("Dataset must be a valid GUID");
                    return response;
                }

                // Get events filtered by dataset using repository
                var filteredEvents = (await repository.GetEventsByDatasetId(datasetId)).ToList();

                logger.LogInformation("Retrieved {Count} events for dataset {DatasetId}", filteredEvents.Count,
                    datasetId);

                response.StatusCode = HttpStatusCode.OK;
                await response.WriteStringAsync(System.Text.Json.JsonSerializer.Serialize(filteredEvents));
                return response;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error retrieving events");
                response.StatusCode = HttpStatusCode.InternalServerError;
                await response.WriteStringAsync("An error occurred while retrieving events");
                return response;
            }
        }

        [Function("AddEvent")]
        public async Task<HttpResponseData> AddEvents(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post")]
            HttpRequestData req)
        {
            var response = req.CreateResponse();
            response.Headers.Add("Content-Type", "application/json");

            try
            {
                // Read the request body
                var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                
                if (string.IsNullOrEmpty(requestBody))
                {
                    response.StatusCode = HttpStatusCode.BadRequest;
                    await response.WriteStringAsync("Request body cannot be empty");
                    return response;
                }

                // Deserialize the events
                var events = System.Text.Json.JsonSerializer.Deserialize<Event[]>(requestBody);
                
                if (events == null || events.Length == 0)
                {
                    response.StatusCode = HttpStatusCode.BadRequest;
                    await response.WriteStringAsync("No events provided");
                    return response;
                }

                // Validate required fields
                foreach (var evt in events)
                {
                    if (evt.DatasetId == Guid.Empty)
                    {
                        response.StatusCode = HttpStatusCode.BadRequest;
                        await response.WriteStringAsync("DatasetId is required for all events");
                        return response;
                    }
                    
                    if (string.IsNullOrEmpty(evt.Name))
                    {
                        response.StatusCode = HttpStatusCode.BadRequest;
                        await response.WriteStringAsync("Name is required for all events");
                        return response;
                    }
                }

                // Add events using repository
                var addedEvents = (await repository.AddEvents(events)).ToList();

                logger.LogInformation("Added {Count} events", addedEvents.Count);

                response.StatusCode = HttpStatusCode.Created;
                await response.WriteStringAsync(System.Text.Json.JsonSerializer.Serialize(addedEvents));
                return response;
            }
            catch (System.Text.Json.JsonException ex)
            {
                logger.LogError(ex, "Invalid JSON in request body");
                response.StatusCode = HttpStatusCode.BadRequest;
                await response.WriteStringAsync("Invalid JSON format");
                return response;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error adding events");
                response.StatusCode = HttpStatusCode.InternalServerError;
                await response.WriteStringAsync("An error occurred while adding events");
                return response;
            }
        }
    }
}