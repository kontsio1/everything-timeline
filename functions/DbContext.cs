using Microsoft.EntityFrameworkCore;

namespace everything_timeline;

public class DbContext : Microsoft.EntityFrameworkCore.DbContext
{
    public DbContext(DbContextOptions<DbContext> options) : base(options)
    {
    }

    public DbSet<Event> Events { get; set; }
    public DbSet<Dataset> Datasets { get; set; }
    public DbSet<Period> Periods { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Event>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.ToTable("Events", "dbo");
            
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd();
                
            entity.Property(e => e.DatasetId)
                .IsRequired();
                
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(255);
                
            entity.Property(e => e.Info)
                .HasMaxLength(1000);
                
            entity.Property(e => e.Date)
                .IsRequired();
        });

        modelBuilder.Entity<Dataset>(entity =>
        {
            entity.HasKey(d => d.Id);
            entity.ToTable("Datasets", "dbo");
            
            entity.Property(d => d.Id)
                .ValueGeneratedOnAdd();
                
            entity.Property(d => d.Name)
                .IsRequired()
                .HasMaxLength(255);
                
            entity.Property(d => d.CreatedBy)
                .HasMaxLength(255);
                
            entity.Property(d => d.CreatedAt)
                .IsRequired();
                
            entity.Property(d => d.Value)
                .IsRequired();
        });

        modelBuilder.Entity<Period>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.ToTable("Periods", "dbo");
            
            entity.Property(p => p.Id)
                .ValueGeneratedOnAdd();
                
            entity.Property(p => p.DatasetId)
                .IsRequired();
                
            entity.Property(p => p.Name)
                .IsRequired()
                .HasMaxLength(255);
                
            entity.Property(p => p.StartYear)
                .IsRequired();
                
            entity.Property(p => p.EndYear)
                .IsRequired();
                
            entity.Property(p => p.Priority);
        });

        base.OnModelCreating(modelBuilder);
    }
}
