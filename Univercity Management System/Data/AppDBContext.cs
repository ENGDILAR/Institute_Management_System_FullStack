using Lpgin2.Models.Entities;
using Lpgin2.Models.MTM;
using Microsoft.EntityFrameworkCore;

namespace Lpgin2.Data
{
    public class AppDBContext : DbContext
    {
        public AppDBContext(DbContextOptions options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);


            modelBuilder.Entity<clsInstructor>(entity =>
            {
                entity.Property(i => i.FirstName)
                      .IsRequired()
                      .HasMaxLength(50);

                entity.Property(i => i.LastName)
                      .IsRequired()
                      .HasMaxLength(50);

                entity.Property(i => i.Address)
                      .IsRequired()
                      .HasMaxLength(200);

                entity.Property(i => i.Phone)
                      .IsRequired()
                      .HasMaxLength(20);

                entity.Property(i => i.EPhone)
                      .HasMaxLength(20);

                entity.HasIndex(i => i.UserId)
                      .IsUnique()
                      .HasDatabaseName("IX_Instructors_UserId");

                entity.HasOne(i => i.User)
                      .WithOne(u => u.Instructor)
                      .HasForeignKey<clsInstructor>(i => i.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<clsStudent>(entity =>
            {
                entity.Property(s => s.FirstName)
                      .IsRequired()
                      .HasMaxLength(50);

                entity.Property(s => s.LastName)
                      .IsRequired()
                      .HasMaxLength(50);

                entity.Property(s => s.Address)
                      .IsRequired()
                      .HasMaxLength(200);

                entity.Property(s => s.Phone)
                      .IsRequired()
                      .HasMaxLength(20);

                entity.Property(s => s.EPhone)
                      .HasMaxLength(20);

                entity.HasIndex(s => s.UserId)
                      .IsUnique()
                      .HasDatabaseName("IX_Students_UserId");

                entity.HasOne(s => s.User)
                      .WithOne(u => u.student)
                      .HasForeignKey<clsStudent>(s => s.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<clsAdmin>(entity =>
            {
                entity.Property(a => a.FirstName)
                      .IsRequired()
                      .HasMaxLength(50);

                entity.Property(a => a.LastName)
                      .IsRequired()
                      .HasMaxLength(50);

                entity.Property(a => a.Address)
                      .IsRequired()
                      .HasMaxLength(200);

                entity.Property(a => a.Phone)
                      .IsRequired()
                      .HasMaxLength(20);

                entity.Property(a => a.EPhone)
                      .HasMaxLength(20);

                entity.HasIndex(a => a.UserId)
                      .IsUnique()
                      .HasDatabaseName("IX_Admins_UserId");

                entity.HasOne(a => a.User)
                      .WithOne(u => u.Admin)
                      .HasForeignKey<clsAdmin>(a => a.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<clsCourse>(entity =>
            {
                entity.Property(c => c.CourseName)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(c => c.Hours)
                      .IsRequired();

                entity.HasIndex(c => c.CourseName)
                      .IsUnique()
                      .HasDatabaseName("IX_Courses_CourseName");

                entity.ToTable(t =>
                {
                    t.HasCheckConstraint(
                        "CK_Course_Hours",
                        "[Hours] > 0");
                });
            });

            modelBuilder.Entity<clsCourseOffering>(entity =>
            {
                entity.Property(o => o.Capacity)
                      .IsRequired();

                entity.Property(o => o.Status)
                      .IsRequired();

                entity.Property(o => o.StartDate);

                entity.Property(o => o.EndDate);

                entity.HasIndex(o => new
                {
                    o.CourseId,
                    o.InstructorId,
                    o.StartDate
                })
                .IsUnique()
                .HasDatabaseName("IX_CourseOffering_Course_Instructor");

                entity.ToTable(t =>
                {
                    t.HasCheckConstraint(
                        "CK_CourseOffering_Capacity",
                        "[Capacity] > 0");
                });

                entity.HasOne(o => o.Course)
                      .WithMany(c => c.Offerings)
                      .HasForeignKey(o => o.CourseId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(o => o.Instructor)
                      .WithMany(i => i.Offerings)
                      .HasForeignKey(o => o.InstructorId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<clsEnrollments>(entity =>
            {
                entity.Property(e => e.RegisteredAt)
                      .HasDefaultValueSql("GETUTCDATE()");

                entity.HasIndex(e => new
                {
                    e.StudentId,
                    e.CourseOfferingId
                })
                .IsUnique()
                .HasDatabaseName("IX_Enrollments_Student_CourseOffering");

                entity.HasOne(e => e.CourseOffering)
                      .WithMany(c => c.Enrollments)
                      .HasForeignKey(e => e.CourseOfferingId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Student)
                      .WithMany(s => s.enrollments)
                      .HasForeignKey(e => e.StudentId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            modelBuilder.Entity<clsStudentMark>(entity =>
            {
                entity.Property(sm => sm.Mark)
                      .HasPrecision(5, 2)
                      .IsRequired();

                entity.HasIndex(sm => new
                {
                    sm.EnrollmentId,
                    sm.ExamTypeId
                })
                .IsUnique()
                .HasDatabaseName("IX_StudentMarks_Enrollment_ExamType");

                entity.ToTable(t =>
                {
                    t.HasCheckConstraint(
                        "CK_StudentMark_Mark",
                        "[Mark] >= 0");
                });

                entity.HasOne(sm => sm.Enrollment)
                      .WithMany(e => e.StudentMarks)
                      .HasForeignKey(sm => sm.EnrollmentId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(sm => sm.ExamType)
                      .WithMany(et => et.StudentMarks)
                      .HasForeignKey(sm => sm.ExamTypeId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<clsUser>(entity =>
            {
                entity.Property(u => u.Email)
                      .IsRequired()
                      
                      .HasMaxLength(150);

                entity.Property(u => u.PasswordHash)
                      .IsRequired()
                      .HasMaxLength(500);

                entity.Property(u => u.RefreshTokenHash)
                      .HasMaxLength(500);

                entity.HasIndex(u => u.Email)
                      .IsUnique()
                      .HasDatabaseName("IX_Users_Email");
            });

            modelBuilder.Entity<clsExamType>(entity =>
            {
                entity.Property(e => e.Name)
                      .IsRequired()
                      .HasMaxLength(50);

                entity.Property(e => e.MaxMark)
                      .IsRequired();

                entity.HasIndex(e => e.Name)
                      .IsUnique()
                      .HasDatabaseName("IX_ExamTypes_Name");

                entity.ToTable(t =>
                {
                    t.HasCheckConstraint(
                        "CK_ExamType_MaxMark",
                        "[MaxMark] > 0");
                });

                entity.HasData(
                    new clsExamType
                    {
                        Id = 1,
                        Name = "First Exam",
                        MaxMark = 20
                    },
                    new clsExamType
                    {
                        Id = 2,
                        Name = "Second Exam",
                        MaxMark = 20
                    },
                    new clsExamType
                    {
                        Id = 3,
                        Name = "Final Exam",
                        MaxMark = 60
                    });
            });
   
        }
        public DbSet<clsAdmin> admins { get; set; }

        public DbSet<clsCourse> courses { get; set; }

        public DbSet<clsStudent> students { get; set; }

        public DbSet<clsInstructor> Instructors { get; set; }

        public DbSet<clsUser> users { get; set; }

        public DbSet<clsCourseOffering> courseOfferings { get; set; }

        public DbSet<clsEnrollments> enrollments { get; set; }

        public DbSet<clsStudentMark> StudentMarks { get; set; }

        public DbSet<clsExamType> ExamTypes { get; set; }
    }
}