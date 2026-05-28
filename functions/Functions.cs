using System.Net;
using everything_timeline.Extensions;
using everything_timeline.UseCases.Datasets;
using everything_timeline.UseCases.Events;
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
        public IActionResult TestFunction(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")] HttpRequest req)
        {
            var user = req.HttpContext.User;
            var isAuthenticated = user.Identity?.IsAuthenticated == true;

            if (!isAuthenticated)
                return new OkObjectResult(new { isAuthenticated = false });

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
        
        [Function("Options")]
        public HttpResponseData HandleOptions([HttpTrigger(AuthorizationLevel.Anonymous, "options", Route = "{*any}")] HttpRequestData req)
        {
            var response = req.CreateResponse();
            response.StatusCode = HttpStatusCode.OK;

            response.SetCorsHeaders();
            response.Headers.Add("Access-Control-Max-Age", "86400");

            return response;
        }
        
        [Function("GetEvents")]
        public async Task<HttpResponseData> GetEvents(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            var response = req.CreateResponse();
            response.SetJsonContentType();
            response.SetCorsHeaders();

            try
            {
                var datasetParam = req.Query["dataset"];
                Guid.TryParse(datasetParam, out Guid datasetId);

                var userId = req.GetUserId();
                var eventsResponse = await repository.GetEventsByDatasetId(new EventsGetRequest(datasetId, userId));

                logger.LogInformation("Retrieved {Count} events for dataset {DatasetId}", eventsResponse.Events.Count, datasetId);

                return await response.OkJsonAsync(eventsResponse);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error retrieving events");
                return await response.InternalServerErrorAsync("An error occurred while retrieving events");
            }
        }

        [Function("AddEvent")]
        public async Task<HttpResponseData> AddEvents(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post")]
            HttpRequestData req)
        {
            var response = req.CreateResponse();
            response.SetJsonContentType();
            response.SetCorsHeaders();

            try
            {
                var (eventsRequest, isEmpty) = await req.ReadBodyAsync<EventCreateRequest>();

                if (isEmpty || eventsRequest is null)
                    return await response.BadRequestAsync("Request body cannot be empty");
                
                eventsRequest.SetUser(req.GetUserId());
                var addedEventsResponse = await repository.AddEvents(eventsRequest);
                
                logger.LogInformation("Added {Count} events", addedEventsResponse.Events.Count);

                return await response.CreatedJsonAsync(addedEventsResponse);
            }
            catch (System.Text.Json.JsonException ex)
            {
                logger.LogError(ex, "Invalid JSON in request body");
                return await response.BadRequestAsync("Invalid JSON format");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error adding events");
                return await response.InternalServerErrorAsync("An error occurred while adding events");
            }
        }
        
        [Function("UpdateEvent")]
        public async Task<HttpResponseData> UpdateEvent(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post")]
            HttpRequestData req)
        {
            var response = req.CreateResponse();
            response.SetJsonContentType();
            response.SetCorsHeaders();

            try
            {
                var (eventUpdateRequest, isEmpty) = await req.ReadBodyAsync<EventUpdateRequest>();

                var eventDto = eventUpdateRequest.Event;
                if (isEmpty || eventDto is null)
                    return await response.BadRequestAsync("Request body cannot be empty");
                
                if (eventDto.DatasetId == Guid.Empty)
                    return await response.BadRequestAsync("DatasetId is required for all events");

                eventUpdateRequest.SetUser(req.GetUserId());
                var updatedEventResponse = await repository.UpdateEvent(eventUpdateRequest);
                logger.LogInformation("Updated event: {name}", updatedEventResponse);

                return await response.CreatedJsonAsync(updatedEventResponse);
            }
            catch (System.Text.Json.JsonException ex)
            {
                logger.LogError(ex, "Invalid JSON in request body");
                return await response.BadRequestAsync("Invalid JSON format");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error adding events");
                return await response.InternalServerErrorAsync("An error occurred while adding events");
            }
        }

        [Function("DeleteEvent")]
        public async Task<HttpResponseData> DeleteEvent(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post")]
            HttpRequestData req)
        {
            var response = req.CreateResponse();
            response.SetJsonContentType();
            response.SetCorsHeaders();

            try
            {
                var (eventDeleteRequest, isEmpty) = await req.ReadBodyAsync<EventDeleteRequest>();

                var eventDto = eventDeleteRequest?.Event;
                if (isEmpty || eventDto is null)
                    return await response.BadRequestAsync("Request body cannot be empty");

                if (eventDto.DatasetId == Guid.Empty)
                    return await response.BadRequestAsync("DatasetId is required");

                eventDeleteRequest.SetUser(req.GetUserId());
                var deleted = await repository.DeleteEvent(eventDeleteRequest);

                if (!deleted)
                    return await response.NotFoundAsync("Event not found");

                logger.LogInformation("Deleted event: {id}", eventDto.Id);
                return await response.OkJsonAsync(new { deleted = true });
            }
            catch (System.Text.Json.JsonException ex)
            {
                logger.LogError(ex, "Invalid JSON in request body");
                return await response.BadRequestAsync("Invalid JSON format");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error deleting event");
                return await response.InternalServerErrorAsync("An error occurred while deleting the event");
            }
        }

        [Function("GetDatasets")]
        public async Task<HttpResponseData> GetDatasets(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            var response = req.CreateResponse();
            response.SetJsonContentType();
            response.SetCorsHeaders();

            try
            {
                var userId = req.GetUserId();
                var datasetsResponse = await repository.GetDatasets(userId);

                logger.LogInformation("Retrieved {Count} datasets", datasetsResponse.Datasets.Count());

                return await response.OkJsonAsync(datasetsResponse);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error retrieving datasets");
                return await response.InternalServerErrorAsync("An error occurred while retrieving datasets");
            }
        }
        
        [Function("AddDataset")]
        public async Task<HttpResponseData> AddDataset(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post")]
            HttpRequestData req)
        {
            var response = req.CreateResponse();
            response.SetJsonContentType();
            response.SetCorsHeaders();

            try
            {
                var jsonOptions = new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var (datasetCreateRequest, isEmpty) = await req.ReadBodyAsync<DatasetCreateRequest>(jsonOptions);

                if (isEmpty || datasetCreateRequest is null)
                    return await response.BadRequestAsync("Request body cannot be empty");

                var userId = req.GetUserId();
                if (userId == Guid.Empty)
                    return await response.BadRequestAsync("Please login to create a dataset");
                datasetCreateRequest.SetUser(userId);
                
                var addedDataset = await repository.AddDataset(datasetCreateRequest);
                logger.LogInformation("Added dataset: {DatasetName}", addedDataset.Name);

                return await response.CreatedJsonAsync(addedDataset);
            }
            catch (System.Text.Json.JsonException ex)
            {
                logger.LogError(ex, "Invalid JSON in request body");
                return await response.BadRequestAsync("Invalid JSON format");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error adding dataset");
                return await response.InternalServerErrorAsync("An error occurred while adding dataset");
            }
        }
    }
}