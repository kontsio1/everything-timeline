using everything_timeline.Entities;
using everything_timeline.UseCases;
using everything_timeline.UseCases.Datasets;
using everything_timeline.UseCases.Events;
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

public class Repository : IRepository
{
    private readonly DbContext _dbContext;

    public Repository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<Event>> GetAllEvents()
    {
        return await _dbContext.Events
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
            events = await _dbContext.Events
                .Include(e => e.Dataset)
                .Where(e => e.DatasetId == datasetId && (e.Dataset.UserId == userId))
                .OrderBy(e => e.Date)
                .Select(e => new EventDto(e))
                .ToListAsync();
        }
        else
        {
            events = await _dbContext.Events
                .Include(e => e.Dataset)
                .Where(e => e.Dataset.UserId == Guid.Empty)
                .OrderBy(e => e.Date)
                .Select(e => new EventDto(e))
                .ToListAsync();
        }
        
        return new EventGetResponse { Events = events };
    }

    public async Task<Event> GetEventById(Guid id)
    {
        return await _dbContext.Events.FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<EventGetResponse> AddEvents(EventCreateRequest request)
    {
        var validRequest = _dbContext.Datasets.Any(e =>
            e.Id == request.Events.First().DatasetId && (e.UserId == request.UserId || e.UserId == Guid.Empty));
        if(!validRequest) throw new Exception("Invalid request - dataset doesn't belong to the user");

        var events = request.Events;
        var eventsToAdd = events.Select(e => new Event
        {
            Id = Guid.NewGuid(),
            Date = e.Date,
            Name = e.Name,
            Info = e.Info,
            DatasetId = e.DatasetId,
        });
        
        await _dbContext.Events.AddRangeAsync(eventsToAdd);
        await _dbContext.SaveChangesAsync();
        
        return new EventGetResponse { Events = events.ToList() };
    }

    public async Task<EventUpdateResponse> UpdateEvent(EventUpdateRequest request)
    {
        var validRequest = _dbContext.Datasets.Any(e =>
            e.Id == request.Event.DatasetId && (e.UserId == request.UserId || e.UserId == Guid.Empty));
        if(!validRequest) throw new Exception("Invalid request - dataset doesn't belong to the user");
        
        var eventToUpdate = request.Event;
        var existingEvent = await _dbContext.Events
            .FirstOrDefaultAsync(e => e.Id == eventToUpdate.Id);

        if (existingEvent == null)
            return null;

        existingEvent.DatasetId = eventToUpdate.DatasetId;
        existingEvent.Name = eventToUpdate.Name;
        existingEvent.Info = eventToUpdate.Info;
        existingEvent.Date = eventToUpdate.Date;

        await _dbContext.SaveChangesAsync();
        return new EventUpdateResponse(existingEvent);
    }

    public async Task<bool> DeleteEvent(EventDeleteRequest request)
    {
        var validRequest = _dbContext.Datasets.Any(e =>
            e.Id == request.Event.DatasetId && (e.UserId == request.UserId || e.UserId == Guid.Empty));
        if(!validRequest) throw new Exception("Invalid request - dataset doesn't belong to the user");
        
        var eventToDelete = await _dbContext.Events
            .FirstOrDefaultAsync(e => e.Id == request.Event.Id);

        if (eventToDelete == null)
            return false;

        _dbContext.Events.Remove(eventToDelete);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<int> GetEventsCountByDataset(Guid datasetId)
    {
        return await _dbContext.Events
            .CountAsync(e => e.DatasetId == datasetId);
    }

    public async Task<DatasetGetResponse> GetDatasets(Guid userId = default)
    {
        var datasets = await _dbContext.Datasets
                .Where(d => d.UserId == userId || d.UserId == Guid.Empty)
                .Select(d => new DatasetDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Description = d.Description,
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
            UserId = request.UserId,
            Name = request.Name,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow,
            Events = new List<Event>(),
            Periods = new List<Period>()
        };

        await _dbContext.Datasets.AddRangeAsync(dataset);
        await _dbContext.SaveChangesAsync();
        return dataset;
    }
}
