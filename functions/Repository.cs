using Microsoft.EntityFrameworkCore;

namespace everything_timeline;

public interface IRepository
{
    Task<IEnumerable<Event>> GetAllEvents();
    Task<IEnumerable<Event>> GetEventsByDatasetId(Guid datasetId);
    Task<Event?> GetEventById(Guid id);
    Task<IEnumerable<Event>> AddEvents(IEnumerable<Event> events);
    Task<Event?> UpdateEvent(Event eventToUpdate);
    Task<bool> DeleteEvent(Guid id);
    Task<int> GetEventsCountByDataset(Guid datasetId);
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

    public async Task<IEnumerable<Event>> GetEventsByDatasetId(Guid datasetId)
    {
        return await _dbContext.Events
            .Where(e => e.DatasetId == datasetId)
            .OrderBy(e => e.Date)
            .ToListAsync();
    }

    public async Task<Event> GetEventById(Guid id)
    {
        return await _dbContext.Events
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<IEnumerable<Event>> AddEvents(IEnumerable<Event> events)
    {
        var eventsToAdd = events.Select(e => new Event
        {
            Id = e.Id == Guid.Empty ? Guid.NewGuid() : e.Id,
            DatasetId = e.DatasetId,
            Name = e.Name,
            Info = e.Info,
            Date = e.Date
        }).ToList();

        await _dbContext.Events.AddRangeAsync(eventsToAdd);
        await _dbContext.SaveChangesAsync();
        
        return eventsToAdd;
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
}
