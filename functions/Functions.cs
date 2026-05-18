using System.Net;
using everything_timeline.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace everything_timeline
{
    public class Functions(ILogger<Functions> logger, IRepository repository)
    {
        private static void SetCorsHeaders(HttpResponseData response)
        {
            response.Headers.Add("Access-Control-Allow-Origin", "*");
            response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, x-requested-with");
        }

        [Function("Options")]
        public HttpResponseData HandleOptions([HttpTrigger(AuthorizationLevel.Anonymous, "options", Route = "{*any}")] HttpRequestData req)
        {
            var response = req.CreateResponse();
            response.StatusCode = HttpStatusCode.OK;

            SetCorsHeaders(response);
            response.Headers.Add("Access-Control-Max-Age", "86400");

            return response;
        }

        [Function("Test")]
        public IActionResult TestFunction(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")] HttpRequest req)
        {
            var user = req.HttpContext.User;
            var isAuthenticated = user.Identity?.IsAuthenticated == true;

            if (!isAuthenticated)
                return new OkObjectResult(new { isAuthenticated = false });

            var allClaims = user.Claims
                .GroupBy(c => c.Type)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(c => c.Value).ToArray()
                );

            var userInfo = new
            {
                isAuthenticated = true,
                userId     = user.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value,
                email      = user.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")?.Value,
                name       = user.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name")?.Value == "unknown" ? "unknown" : user.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name")?.Value,
            };

            logger.LogInformation(
                "Test called. Authenticated: {IsAuthenticated}, User: {UserId} ({Email})",
                isAuthenticated, userInfo.userId, userInfo.email);

            return new OkObjectResult(userInfo);
        }
        
        [Function("GetEvents")]
        public async Task<HttpResponseData> GetEvents(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            var response = req.CreateResponse();
            response.Headers.Add("Content-Type", "application/json");
            SetCorsHeaders(response);

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
            SetCorsHeaders(response);

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

        [Function("GetDatasets")]
        public async Task<HttpResponseData> GetDatasets(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            var response = req.CreateResponse();
            response.Headers.Add("Content-Type", "application/json");
            SetCorsHeaders(response);

            try
            {
                var datasets = await repository.GetAllDatasets();

                logger.LogInformation("Retrieved {Count} datasets", datasets.Count());

                response.StatusCode = HttpStatusCode.OK;
                await response.WriteStringAsync(System.Text.Json.JsonSerializer.Serialize(datasets));
                return response;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error retrieving datasets");
                response.StatusCode = HttpStatusCode.InternalServerError;
                await response.WriteStringAsync("An error occurred while retrieving datasets");
                return response;
            }
        }
    }
}