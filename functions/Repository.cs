using everything_timeline.Entities;
using everything_timeline.UseCases;
using everything_timeline.UseCases.Datasets;
using everything_timeline.UseCases.Events;
using everything_timeline.WikiSearch;
using Microsoft.EntityFrameworkCore;

namespace everything_timeline;

public interface IRepository
{
    Task<IEnumerable<Event>> GetAllEvents();
    Task<EventGetResponse> GetEventsByDatasetId(EventsGetRequest request);
    Task<Event?> GetEventById(Guid id);
    Task<EventGetResponse> AddEvents(EventCreateRequest events);
    Task<EventUpdateResponse> UpdateEvent(EventUpdateRequest request);
    Task<bool> DeleteEvent(EventDeleteRequest request);
    Task<int> GetEventsCountByDataset(Guid datasetId);
    Task<DatasetGetResponse> GetDatasets(Guid userId);
    Task<Dataset> AddDataset(DatasetCreateRequest dataset);
}

public class Repository(DbContext dbContext, IWikiHttpClient wikiHttpClient) : IRepository
{
    public async Task<IEnumerable<Event>> GetAllEvents()
    {
        return await dbContext.Events
            .OrderBy(e => e.Date)
            .ToListAsync();
    }

    public async Task<EventGetResponse> GetEventsByDatasetId(EventsGetRequest request)
    {
        var datasetId = request.DatasetId;
        var events = new List<EventDto>();

        if (request.IsAuthenticated())
        {
            var userId = request.UserId;
            events = await dbContext.Events
                .Include(e => e.Dataset)
                .Where(e => e.DatasetId == datasetId && (e.Dataset.OwnerId == userId || e.Dataset.OwnerId == Guid.Empty))
                .Where(e => e.Date >= e.Dataset.DomainStart && e.Date <= (e.Dataset.DomainEnd ?? DateTime.Now.Year))
                .OrderBy(e => e.Date)
                .Select(e => new EventDto(e))
                .ToListAsync();
        }
        else
        {
            events = await dbContext.Events
                .Include(e => e.Dataset)
                .Where(e => e.Dataset.OwnerId == Guid.Empty)
                .Where(e => e.Date >= e.Dataset.DomainStart && e.Date <= (e.Dataset.DomainEnd ?? DateTime.Now.Year))
                .OrderBy(e => e.Date)
                .Select(e => new EventDto(e))
                .ToListAsync();
        }
        
        return new EventGetResponse { Events = events };
    }

    public async Task<Event> GetEventById(Guid id)
    {
        return await dbContext.Events.FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<EventGetResponse> AddEvents(EventCreateRequest request)
    {
        if (request.Events.Count == 0)
        {
            return new EventGetResponse();
        }

        var validRequest = await dbContext.Datasets.AnyAsync(e =>
            e.Id == request.Events[0].DatasetId && (e.OwnerId == request.UserId || e.OwnerId == Guid.Empty));
        if(!validRequest) throw new Exception("Invalid request - dataset doesn't belong to the user");

        var eventsToAdd = new List<Event>(request.Events.Count);
        foreach (var eventDto in request.Events)
        {
            var info = eventDto.Info;

            if (!string.IsNullOrWhiteSpace(eventDto.WikiPageTitle))
            {
                try
                {
                    var wikiResponse = await wikiHttpClient.GetPageExtractAsync(eventDto.WikiPageTitle, CancellationToken.None);
                    var wikiExtract = wikiResponse.Query?.Pages?.FirstOrDefault()?.Extract;
                    if (!string.IsNullOrWhiteSpace(wikiExtract))
                    {
                        info = wikiExtract;
                    }
                }
                catch
                {
                    info = "Failed to get descriptions from wikipedia - please add manually";
                }
            }

            eventsToAdd.Add(new Event
            {
                Id = Guid.NewGuid(),
                Date = eventDto.Date,
                Name = eventDto.Name,
                Info = info,
                DatasetId = eventDto.DatasetId,
            });
        }
        
        await dbContext.Events.AddRangeAsync(eventsToAdd);
        await dbContext.SaveChangesAsync();
        
        return new EventGetResponse { Events = eventsToAdd.Select(e => new EventDto(e)).ToList() };
    }

    public async Task<EventUpdateResponse> UpdateEvent(EventUpdateRequest request)
    {
        var validRequest = dbContext.Datasets.Any(e =>
            e.Id == request.Event.DatasetId && (e.OwnerId == request.UserId || e.OwnerId == Guid.Empty));
        if(!validRequest) throw new Exception("Invalid request - dataset doesn't belong to the user");
        
        var eventToUpdate = request.Event;
        var existingEvent = await dbContext.Events
            .FirstOrDefaultAsync(e => e.Id == eventToUpdate.Id);

        if (existingEvent == null)
            return null;

        existingEvent.DatasetId = eventToUpdate.DatasetId;
        existingEvent.Name = eventToUpdate.Name;
        existingEvent.Info = eventToUpdate.Info;
        existingEvent.Date = eventToUpdate.Date;

        await dbContext.SaveChangesAsync();
        return new EventUpdateResponse(existingEvent);
    }

    public async Task<bool> DeleteEvent(EventDeleteRequest request)
    {
        var validRequest = dbContext.Datasets.Any(e =>
            e.Id == request.Event.DatasetId && (e.OwnerId == request.UserId || e.OwnerId == Guid.Empty));
        if(!validRequest) throw new Exception("Invalid request - dataset doesn't belong to the user");
        
        var eventToDelete = await dbContext.Events
            .FirstOrDefaultAsync(e => e.Id == request.Event.Id);

        if (eventToDelete == null)
            return false;

        dbContext.Events.Remove(eventToDelete);
        await dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<int> GetEventsCountByDataset(Guid datasetId)
    {
        return await dbContext.Events
            .CountAsync(e => e.DatasetId == datasetId);
    }

    public async Task<DatasetGetResponse> GetDatasets(Guid userId = default)
    {
        var datasets = await dbContext.Datasets
                .Where(d => d.OwnerId == userId || d.IsPublic)
                .Select(d => new DatasetDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Description = d.Description,
                    DomainStart = d.DomainStart,
                    DomainEnd = d.DomainEnd ?? DateTime.Now.Year,
                    CreatedBy = d.CreatedBy,
                    CreatedAt = d.CreatedAt
                })
                .OrderBy(d => d.CreatedAt)
                .ToListAsync();
        return new DatasetGetResponse { Datasets = datasets };
    }

    public async Task<Dataset> AddDataset(DatasetCreateRequest request)
    {
        var dataset = new Dataset
        {
            OwnerId = request.UserId,
            Name = request.Name,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow,
            DomainStart = request.DomainStart,
            DomainEnd = request.DomainEnd,
            IsPublic = request.IsPublic,
            Events = new List<Event>(),
            Periods = new List<Period>()
        };

        await dbContext.Datasets.AddRangeAsync(dataset);
        await dbContext.SaveChangesAsync();
        return dataset;
    }
}
