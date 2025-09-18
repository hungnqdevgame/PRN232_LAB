using Microsoft.EntityFrameworkCore;

namespace Covid_API.Models;

public partial class PRN232Context : DbContext
{
    public PRN232Context()
    {
    }

    public PRN232Context(DbContextOptions<PRN232Context> options)
        : base(options)
    {
    }

    public virtual DbSet<Case> Cases { get; set; }

    public virtual DbSet<Region> Regions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Case>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("pk_Finalize");

            entity.Property(e => e.ConfirmedCases).HasDefaultValue(0L);
            entity.Property(e => e.DeathCases).HasDefaultValue(0L);
            entity.Property(e => e.RecoveredCases).HasDefaultValue(0L);

            entity.HasOne(d => d.Region).WithMany(p => p.Cases)
                .HasForeignKey(d => d.RegionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_Finalize_Region");
        });

        modelBuilder.Entity<Region>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("pk_Region");

            entity.ToTable("Region");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
