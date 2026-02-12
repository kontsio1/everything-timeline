using System.ComponentModel.DataAnnotations;

namespace AzureSQL.Event;

public class Entities
{
    public class Event
    {
        public Guid Id { get; set; }
        [Required] public Guid DatasetId { get; set; }
        [Required] public string? Name { get; set; }
        public string? Info { get; set; }
        [Required] public int Date { get; set; }
    }
}