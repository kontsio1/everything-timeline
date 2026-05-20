using System;
using System.Collections.Generic;

namespace everything_timeline.Entities;

public partial class Dataset
{
    public Guid Id { get; set; }

    public string? Name { get; set; }
    
    public string? Description { get; set; }

    public string? CreatedBy { get; set; }
    
    public Guid UserId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Event> Events { get; set; } = new List<Event>();

    public virtual ICollection<Period> Periods { get; set; } = new List<Period>();
}
