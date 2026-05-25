using everything_timeline.Entities;
using everything_timeline.UseCases;
using everything_timeline.UseCases.Datasets;
using everything_timeline.UseCases.Events;
using Microsoft.EntityFrameworkCore;

namespace everything_timeline;

public interface IRepository
{
    Task<IEnumerable<Event>> GetAllEvents();
    Task<EventGetResponse> GetEventsByDatasetId(Guid datasetId, Guid userId);
    Task<Event?> GetEventById(Guid id);
    Task<EventGetResponse> AddEvents(IEnumerable<EventDto> events);
    Task<Event?> UpdateEvent(Event eventToUpdate);
    Task<bool> DeleteEvent(Guid id);
    Task<int> GetEventsCountByDataset(Guid datasetId);
    Task<DatasetGetResponse> GetDatasets(Guid userId);
    Task<Dataset> AddDataset(DatasetCreateRequest dataset, Guid userId);
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

    public async Task<EventGetResponse> GetEventsByDatasetId(Guid datasetId, Guid userId)
    {
        var events = await _dbContext.Events
            .Include(e => e.Dataset)
            .Where(e => e.DatasetId == datasetId && (e.Dataset.UserId == userId || e.Dataset.UserId == Guid.Empty))
            .Select(e => new EventDto
            {
                Id = e.Id,
                Date = e.Date,
                Name = e.Name,
                Info = e.Info,
                DatasetId = e.DatasetId,
            })
            .OrderBy(e => e.Date)
            .ToListAsync();
        return new EventGetResponse { Events = events };
    }

    public async Task<Event> GetEventById(Guid id)
    {
        return await _dbContext.Events.FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<EventGetResponse> AddEvents(IEnumerable<EventDto> events)
    {
        var eventsToAdd = events.Select(e => new Event
        {
            Id = Guid.NewGuid(),
            Date = e.Date,
            Name = e.Name,
            Info = e.Info,
            DatasetId = e.DatasetId,
        }).ToList();

        await _dbContext.Events.AddRangeAsync(eventsToAdd);
        await _dbContext.SaveChangesAsync();
        
        return new EventGetResponse { Events = events.ToList() };
    }

    public async Task<Event?> UpdateEvent(Event eventToUpdate)
    {
        var existingEvent = await _dbContext.Events
            .FirstOrDefaultAsync(e => e.Id == eventToUpdate.Id);

        if (existingEvent == null)
            return null;

        existingEvent.DatasetId = eventToUpdate.DatasetId;
        existingEvent.Name = eventToUpdate.Name;
        existingEvent.Info = eventToUpdate.Info;
        existingEvent.Date = eventToUpdate.Date;

        await _dbContext.SaveChangesAsync();
        return existingEvent;
    }

    public async Task<bool> DeleteEvent(Guid id)
    {
        var eventToDelete = await _dbContext.Events
            .FirstOrDefaultAsync(e => e.Id == id);

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

    public async Task<Dataset> AddDataset(DatasetCreateRequest request, Guid userId = default)
    {
        var dataset = new Dataset
        {
            UserId = userId,
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
