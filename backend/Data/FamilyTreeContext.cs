using Microsoft.EntityFrameworkCore;
using FamilyTreeAPI.Models;

namespace FamilyTreeAPI.Data
{
    public class FamilyTreeContext : DbContext
    {
        public FamilyTreeContext(DbContextOptions<FamilyTreeContext> options) : base(options) { }

        public DbSet<City> Cities { get; set; }
        public DbSet<Family> Families { get; set; }
        public DbSet<Person> Persons { get; set; }
        public DbSet<Wedding> Weddings { get; set; }
        public DbSet<Connexion> Connexions { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<EventParticipant> EventParticipants { get; set; }
        public DbSet<EventPhoto> EventPhotos { get; set; }

        // 🆕 Système de mariage amélioré
        public DbSet<MarriageUnion> MarriageUnions { get; set; }
        public DbSet<FamilyRelation> FamilyRelations { get; set; }

        // 📸 Module Albums Photos
        public DbSet<Album> Albums { get; set; }
        public DbSet<Photo> Photos { get; set; }
        public DbSet<PhotoPerson> PhotoPersons { get; set; }
        public DbSet<AlbumComment> AlbumComments { get; set; }
        public DbSet<PhotoLike> PhotoLikes { get; set; }
        public DbSet<AlbumPermission> AlbumPermissions { get; set; }

        // 📊 Module Sondages
        public DbSet<Poll> Polls { get; set; }
        public DbSet<PollOption> PollOptions { get; set; }
        public DbSet<PollVote> PollVotes { get; set; }
        public DbSet<PollParticipant> PollParticipants { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 🔧 CRITICAL FIX: Force TEXT columns (unlimited length) for Person entity
            // Override any StringLength attributes from the model
            modelBuilder.Entity<Person>()
                .Property(p => p.FirstName)
                .HasMaxLength(int.MaxValue);  // Equivalent to TEXT in PostgreSQL
            
            modelBuilder.Entity<Person>()
                .Property(p => p.LastName)
                .HasMaxLength(int.MaxValue);
            
            modelBuilder.Entity<Person>()
                .Property(p => p.Email)
                .HasMaxLength(int.MaxValue);
            
            modelBuilder.Entity<Person>()
                .Property(p => p.Activity)
                .HasMaxLength(int.MaxValue);
            
            modelBuilder.Entity<Person>()
                .Property(p => p.PhotoUrl)
                .HasMaxLength(int.MaxValue);
            
            modelBuilder.Entity<Person>()
                .Property(p => p.Notes)
                .HasMaxLength(int.MaxValue);
            
            modelBuilder.Entity<Person>()
                .Property(p => p.PendingFatherName)
                .HasMaxLength(int.MaxValue);
            
            modelBuilder.Entity<Person>()
                .Property(p => p.PendingMotherName)
                .HasMaxLength(int.MaxValue);
            
            modelBuilder.Entity<Person>()
                .Property(p => p.Status)
                .HasMaxLength(int.MaxValue);

            // Configure Person relationships
            modelBuilder.Entity<Person>()
                .HasOne(p => p.Father)
                .WithMany(p => p.ChildrenAsFather)
                .HasForeignKey(p => p.FatherID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Person>()
                .HasOne(p => p.Mother)
                .WithMany(p => p.ChildrenAsMother)
                .HasForeignKey(p => p.MotherID)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Wedding relationships
            modelBuilder.Entity<Wedding>()
                .HasOne(w => w.Man)
                .WithMany(p => p.WeddingsAsMan)
                .HasForeignKey(w => w.ManID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Wedding>()
                .HasOne(w => w.Woman)
                .WithMany(p => p.WeddingsAsWoman)
                .HasForeignKey(w => w.WomanID)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Wedding → MarriageUnion relationship
            modelBuilder.Entity<Wedding>()
                .HasMany(w => w.Unions)
                .WithOne(u => u.Wedding)
                .HasForeignKey(u => u.WeddingID)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Family → Person relationship
            modelBuilder.Entity<Family>()
                .HasMany(f => f.Members)
                .WithOne(p => p.Family)
                .HasForeignKey(p => p.FamilyID)
                .OnDelete(DeleteBehavior.Restrict);

            // 📸 Configure Albums Photos relationships
            modelBuilder.Entity<Album>()
                .HasMany(a => a.Photos)
                .WithOne(p => p.Album)
                .HasForeignKey(p => p.AlbumID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Album>()
                .HasMany(a => a.Comments)
                .WithOne(c => c.Album)
                .HasForeignKey(c => c.AlbumID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Photo>()
                .HasMany(p => p.TaggedPersons)
                .WithOne(pp => pp.Photo)
                .HasForeignKey(pp => pp.PhotoID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Photo>()
                .HasMany(p => p.Likes)
                .WithOne(l => l.Photo)
                .HasForeignKey(l => l.PhotoID)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Connexion unique constraint
            modelBuilder.Entity<Connexion>()
                .HasIndex(c => c.UserName)
                .IsUnique();

            modelBuilder.Entity<Connexion>()
                .HasIndex(c => c.Email)
                .IsUnique();

            // Configure Person-Connexion one-to-one relationship
            modelBuilder.Entity<Connexion>()
                .HasOne(c => c.Person)
                .WithOne(p => p.Connexion)
                .HasForeignKey<Connexion>(c => c.IDPerson);

            // Configure Family-Creator relationship
            modelBuilder.Entity<Family>()
                .HasOne(f => f.Creator)
                .WithMany()  // Pas de collection inverse pour éviter les cycles
                .HasForeignKey(f => f.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            // Seed data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed Cities
            modelBuilder.Entity<City>().HasData(
                new City { CityID = 1, Name = "Paris", CountryName = "France" },
                new City { CityID = 2, Name = "Lyon", CountryName = "France" },
                new City { CityID = 3, Name = "Marseille", CountryName = "France" },
                new City { CityID = 4, Name = "Yaoundé", CountryName = "Cameroun" },
                new City { CityID = 5, Name = "Douala", CountryName = "Cameroun" }
            );

            // Seed Families
            modelBuilder.Entity<Family>().HasData(
                new Family 
                { 
                    FamilyID = 1, 
                    FamilyName = "Famille Exemple", 
                    Description = "Famille de démonstration",
                    CreatedDate = DateTime.UtcNow 
                }
            );
        }
    }
}
