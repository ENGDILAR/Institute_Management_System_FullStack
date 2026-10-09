using BCrypt.Net;
using Lpgin2.Models.Entities;
using Lpgin2.Models.MTM;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using static Lpgin2.Models.Entities.Enums;
using static System.Net.Mime.MediaTypeNames;

namespace Lpgin2.Data.Seed
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(AppDBContext context)
        {

            var requiredUsers = new[]
            {
                new
                {
                    Email = "admin@gmail.com",
                    Password = "Admin123456",
                    Role = enUserRoles.admin
                },
                new
                {
                    Email = "std@gmail.com",
                    Password = "Std123456",
                    Role = enUserRoles.student
                },
                new
                {
                    Email = "inst@gmail.com",
                    Password = "Teach123456",
                    Role = enUserRoles.instructor
                },


                new
                {
                    Email = "inst2@gmail.com",
                    Password = "Teach123456",
                    Role = enUserRoles.instructor
                },
                new
                {
                    Email = "inst3@gmail.com",
                    Password = "Teach123456",
                    Role = enUserRoles.instructor
                },
                new
                {
                    Email = "inst4@gmail.com",
                    Password = "Teach123456",
                    Role = enUserRoles.instructor
                },
                new
                {
                    Email = "inst5@gmail.com",
                    Password = "Teach123456",
                    Role = enUserRoles.instructor
                },

                // Additional students
                new
                {
                    Email = "student2@gmail.com",
                    Password = "Student123",
                    Role = enUserRoles.student
                },
                new
                {
                    Email = "student3@gmail.com",
                    Password = "Student123",
                    Role = enUserRoles.student
                },
                new
                {
                    Email = "student4@gmail.com",
                    Password = "Student123",
                    Role = enUserRoles.student
                },
                new
                {
                    Email = "student5@gmail.com",
                    Password = "Student123",
                    Role = enUserRoles.student
                },
                new
                {
                    Email = "student6@gmail.com",
                    Password = "Student123",
                    Role = enUserRoles.student
                },
                new
                {
                    Email = "student7@gmail.com",
                    Password = "Student123",
                    Role = enUserRoles.student
                },
                new
                {
                    Email = "student8@gmail.com",
                    Password = "Student123",
                    Role = enUserRoles.student
                },
                new
                {
                    Email = "student9@gmail.com",
                    Password = "Student123",
                    Role = enUserRoles.student
                },
                new
                {
                    Email = "student10@gmail.com",
                    Password = "Student123",
                    Role = enUserRoles.student
                },
                new
                {
                    Email = "student11@gmail.com",
                    Password = "Student123",
                    Role = enUserRoles.student
                }
            };

            var userEmails = requiredUsers
                .Select(u => u.Email)
                .ToList();

            var existingUsers = await context.users
                .Where(u => userEmails.Contains(u.Email))
                .ToListAsync();

            var existingUserEmails = existingUsers
                .Select(u => u.Email)
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            var newUsers = requiredUsers
                .Where(u => !existingUserEmails.Contains(u.Email))
                .Select(u => new clsUser
                {
                    Email = u.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(u.Password),
                    role = u.Role
                })
                .ToList();

            if (newUsers.Count > 0)
            {
                await context.users.AddRangeAsync(newUsers);
                await context.SaveChangesAsync();
            }


            // =========================================================
            // Reload users
            // =========================================================

            var users = await context.users
                .Where(u => userEmails.Contains(u.Email))
                .ToListAsync();

            var usersByEmail = users.ToDictionary(
                u => u.Email,
                StringComparer.OrdinalIgnoreCase
            );


            // =========================================================
            // 2. ADMINS
            // =========================================================

            var adminUser = usersByEmail["admin@gmail.com"];

            var existingAdmin = await context.admins
                .FirstOrDefaultAsync(a => a.UserId == adminUser.id);

            if (existingAdmin == null)
            {
                await context.admins.AddAsync(new clsAdmin
                {
                    FirstName = "System",
                    LastName = "Administrator",
                    Address = "University Administration",
                    Phone = "0911111111",
                    EPhone = "0922222222",
                    UserId = adminUser.id
                });

                await context.SaveChangesAsync();
            }


            // =========================================================
            // 3. INSTRUCTORS
            // =========================================================

            var instructorData = new[]
            {
                new
                {
                    Email = "inst@gmail.com",
                    FirstName = "Ahmad",
                    LastName = "Hassan",
                    Address = "Damascus",
                    Phone = "0931111111",
                    EPhone = "0941111111"
                },
                new
                {
                    Email = "inst2@gmail.com",
                    FirstName = "Omar",
                    LastName = "Khaled",
                    Address = "Damascus",
                    Phone = "0932222222",
                    EPhone = "0942222222"
                },
                new
                {
                    Email = "inst3@gmail.com",
                    FirstName = "Youssef",
                    LastName = "Ali",
                    Address = "Aleppo",
                    Phone = "0933333333",
                    EPhone = "0943333333"
                },
                new
                {
                    Email = "inst4@gmail.com",
                    FirstName = "Mohammad",
                    LastName = "Sami",
                    Address = "Homs",
                    Phone = "0934444444",
                    EPhone = "0944444444"
                },
                new
                {
                    Email = "inst5@gmail.com",
                    FirstName = "Khaled",
                    LastName = "Nasser",
                    Address = "Latakia",
                    Phone = "0935555555",
                    EPhone = "0945555555"
                }
            };

            var instructorUserIds = users
                .Where(u => u.role == enUserRoles.instructor)
                .Select(u => u.id)
                .ToList();

            var existingInstructors = await context.Instructors
                .Where(i => instructorUserIds.Contains(i.UserId))
                .ToListAsync();

            var existingInstructorUserIds = existingInstructors
                .Select(i => i.UserId)
                .ToHashSet();

            var newInstructors = instructorData
                .Where(x =>
                    usersByEmail.ContainsKey(x.Email) &&
                    !existingInstructorUserIds.Contains(usersByEmail[x.Email].id))
                .Select(x => new clsInstructor
                {
                    FirstName = x.FirstName,
                    LastName = x.LastName,
                    Address = x.Address,
                    Phone = x.Phone,
                    EPhone = x.EPhone,
                    UserId = usersByEmail[x.Email].id
                })
                .ToList();

            if (newInstructors.Count > 0)
            {
                await context.Instructors.AddRangeAsync(newInstructors);
                await context.SaveChangesAsync();
            }


            // =========================================================
            // Reload instructors
            // =========================================================

            var instructors = await context.Instructors
                .Include(i => i.User)
                .ToListAsync();

            var instructorsByEmail = instructors
                .Where(i => i.User != null)
                .ToDictionary(
                    i => i.User.Email,
                    StringComparer.OrdinalIgnoreCase
                );


            // =========================================================
            // 4. STUDENTS
            // =========================================================

            var studentData = new[]
            {
                new
                {
                    Email = "std@gmail.com",
                    FirstName = "Main",
                    LastName = "Student",
                    Address = "Damascus",
                    Phone = "0951111111",
                    EPhone = "0961111111"
                },
                new
                {
                    Email = "student2@gmail.com",
                    FirstName = "Ali",
                    LastName = "Hassan",
                    Address = "Damascus",
                    Phone = "0952222222",
                    EPhone = "0962222222"
                },
                new
                {
                    Email = "student3@gmail.com",
                    FirstName = "Sara",
                    LastName = "Khaled",
                    Address = "Aleppo",
                    Phone = "0953333333",
                    EPhone = "0963333333"
                },
                new
                {
                    Email = "student4@gmail.com",
                    FirstName = "Lina",
                    LastName = "Samir",
                    Address = "Homs",
                    Phone = "0954444444",
                    EPhone = "0964444444"
                },
                new
                {
                    Email = "student5@gmail.com",
                    FirstName = "Yazan",
                    LastName = "Omar",
                    Address = "Latakia",
                    Phone = "0955555555",
                    EPhone = "0965555555"
                },
                new
                {
                    Email = "student6@gmail.com",
                    FirstName = "Rami",
                    LastName = "Ahmad",
                    Address = "Damascus",
                    Phone = "0956666666",
                    EPhone = "0966666666"
                },
                new
                {
                    Email = "student7@gmail.com",
                    FirstName = "Nour",
                    LastName = "Ali",
                    Address = "Aleppo",
                    Phone = "0957777777",
                    EPhone = "0967777777"
                },
                new
                {
                    Email = "student8@gmail.com",
                    FirstName = "Kareem",
                    LastName = "Sami",
                    Address = "Hama",
                    Phone = "0958888888",
                    EPhone = "0968888888"
                },
                new
                {
                    Email = "student9@gmail.com",
                    FirstName = "Maya",
                    LastName = "Nasser",
                    Address = "Homs",
                    Phone = "0959999999",
                    EPhone = "0969999999"
                },
                new
                {
                    Email = "student10@gmail.com",
                    FirstName = "Fadi",
                    LastName = "Salim",
                    Address = "Damascus",
                    Phone = "0951010101",
                    EPhone = "0961010101"
                },
                new
                {
                    Email = "student11@gmail.com",
                    FirstName = "Tala",
                    LastName = "Omar",
                    Address = "Latakia",
                    Phone = "0951212121",
                    EPhone = "0961212121"
                }
            };

            var studentUserIds = users
                .Where(u => u.role == enUserRoles.student)
                .Select(u => u.id)
                .ToList();

            var existingStudents = await context.students
                .Where(s => studentUserIds.Contains(s.UserId))
                .ToListAsync();

            var existingStudentUserIds = existingStudents
                .Select(s => s.UserId)
                .ToHashSet();

            var newStudents = studentData
                .Where(x =>
                    usersByEmail.ContainsKey(x.Email) &&
                    !existingStudentUserIds.Contains(usersByEmail[x.Email].id))
                .Select(x => new clsStudent
                {
                    FirstName = x.FirstName,
                    LastName = x.LastName,
                    Address = x.Address,
                    Phone = x.Phone,
                    EPhone = x.EPhone,
                    UserId = usersByEmail[x.Email].id
                })
                .ToList();

            if (newStudents.Count > 0)
            {
                await context.students.AddRangeAsync(newStudents);
                await context.SaveChangesAsync();
            }


            // =========================================================
            // Reload students
            // =========================================================

            var students = await context.students
                .ToListAsync();


            // =========================================================
            // 5. COURSES
            // =========================================================

            var courseData = new[]
            {
                new { Name = "Introduction to Programming", Hours = 4 },
                new { Name = "Object Oriented Programming", Hours = 4 },
                new { Name = "Database Systems", Hours = 3 },
                new { Name = "Web Development", Hours = 4 },
                new { Name = "Software Engineering", Hours = 3 },
                new { Name = "Computer Networks", Hours = 3 },
                new { Name = "Operating Systems", Hours = 4 },
                new { Name = "Data Structures", Hours = 4 }
            };

            var courseNames = courseData
                .Select(c => c.Name)
                .ToList();

            var existingCourses = await context.courses
                .Where(c => courseNames.Contains(c.CourseName))
                .ToListAsync();

            var existingCourseNames = existingCourses
                .Select(c => c.CourseName)
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            var newCourses = courseData
                .Where(c => !existingCourseNames.Contains(c.Name))
                .Select(c => new clsCourse
                {
                    CourseName = c.Name,
                    Hours = c.Hours
                })
                .ToList();

            if (newCourses.Count > 0)
            {
                await context.courses.AddRangeAsync(newCourses);
                await context.SaveChangesAsync();
            }


            // =========================================================
            // Reload courses
            // =========================================================

            var courses = await context.courses
                .ToListAsync();

            var coursesByName = courses.ToDictionary(
                c => c.CourseName,
                StringComparer.OrdinalIgnoreCase
            );


            // =========================================================
            // 6. COURSE OFFERINGS
            // =========================================================

            var offeringData = new[]
            {
                new
                {
                    Course = "Introduction to Programming",
                    Instructor = "inst@gmail.com",
                    Capacity = 30,
                    Status = enCourseOfferingStatus.Open,
                    Start = new DateTime(2026, 9, 1),
                    End = new DateTime(2026, 12, 30)
                },
                new
                {
                    Course = "Object Oriented Programming",
                    Instructor = "inst2@gmail.com",
                    Capacity = 25,
                    Status = enCourseOfferingStatus.Open,
                    Start = new DateTime(2026, 9, 1),
                    End = new DateTime(2026, 12, 30)
                },
                new
                {
                    Course = "Database Systems",
                    Instructor = "inst3@gmail.com",
                    Capacity = 30,
                    Status = enCourseOfferingStatus.Open,
                    Start = new DateTime(2026, 9, 5),
                    End = new DateTime(2026, 12, 30)
                },
                new
                {
                    Course = "Web Development",
                    Instructor = "inst4@gmail.com",
                    Capacity = 25,
                    Status = enCourseOfferingStatus.Open,
                    Start = new DateTime(2026, 9, 10),
                    End = new DateTime(2026, 12, 30)
                },
                new
                {
                    Course = "Software Engineering",
                    Instructor = "inst5@gmail.com",
                    Capacity = 20,
                    Status = enCourseOfferingStatus.Open,
                    Start = new DateTime(2026, 9, 10),
                    End = new DateTime(2026, 12, 30)
                },
                new
                {
                    Course = "Computer Networks",
                    Instructor = "inst@gmail.com",
                    Capacity = 25,
                    Status = enCourseOfferingStatus.Closed,
                    Start = new DateTime(2026, 1, 1),
                    End = new DateTime(2026, 5, 30)
                },
                new
                {
                    Course = "Operating Systems",
                    Instructor = "inst2@gmail.com",
                    Capacity = 25,
                    Status = enCourseOfferingStatus.Open,
                    Start = new DateTime(2026, 10, 1),
                    End = new DateTime(2027, 1, 15)
                },
                new
                {
                    Course = "Data Structures",
                    Instructor = "inst3@gmail.com",
                    Capacity = 30,
                    Status = enCourseOfferingStatus.Cancelled,
                    Start = new DateTime(2026, 2, 1),
                    End = new DateTime(2026, 5, 30)
                }
            };

            var existingOfferings = await context.courseOfferings
                .ToListAsync();

            var existingOfferingKeys = existingOfferings
                .Select(o => $"{o.CourseId}_{o.InstructorId}_{o.StartDate:yyyyMMdd}")
                .ToHashSet();

            var newOfferings = new List<clsCourseOffering>();

            foreach (var item in offeringData)
            {
                if (!coursesByName.TryGetValue(item.Course, out var course))
                    continue;

                if (!instructorsByEmail.TryGetValue(item.Instructor, out var instructor))
                    continue;

                var key = $"{course.id}_{instructor.id}_{item.Start:yyyyMMdd}";

                if (existingOfferingKeys.Contains(key))
                    continue;

                newOfferings.Add(new clsCourseOffering
                {
                    OfferName = $"Section "+course.CourseName,
                    CourseId = course.id,
                    InstructorId = instructor.id,
                    Capacity = item.Capacity,
                    Status = item.Status,
                    StartDate = item.Start,
                    EndDate = item.End
                });
            }

            if (newOfferings.Count > 0)
            {
                await context.courseOfferings.AddRangeAsync(newOfferings);
                await context.SaveChangesAsync();
            }

            var allOfferings = await context.courseOfferings
                .Where(o =>
                    o.Status == enCourseOfferingStatus.Open ||
                    o.Status == enCourseOfferingStatus.Closed)
                .OrderBy(o => o.Id)
                .ToListAsync();

            var existingEnrollments = await context.enrollments
                .ToListAsync();

            var existingEnrollmentKeys = existingEnrollments
                .Select(e => $"{e.StudentId}_{e.CourseOfferingId}")
                .ToHashSet();

            var newEnrollments = new List<clsEnrollments>();

            foreach (var student in students)
            {
                // Give each student 3 courses
                foreach (var offering in allOfferings.Take(3))
                {
                    var key = $"{student.id}_{offering.Id}";

                    if (existingEnrollmentKeys.Contains(key))
                        continue;

                    newEnrollments.Add(new clsEnrollments
                    {
                        StudentId = student.id,
                        CourseOfferingId = offering.Id,
                        RegisteredAt = DateTime.UtcNow.AddDays(-10)
                    });

                    existingEnrollmentKeys.Add(key);
                }
            }

            if (newEnrollments.Count > 0)
            {
                await context.enrollments.AddRangeAsync(newEnrollments);
                await context.SaveChangesAsync();
            }


            // =========================================================
            // 8. STUDENT MARKS
            // =========================================================

            var allEnrollments = await context.enrollments
                .ToListAsync();

            var existingMarks = await context.StudentMarks
                .ToListAsync();

            var existingMarkKeys = existingMarks
                .Select(m => $"{m.EnrollmentId}_{m.ExamTypeId}")
                .ToHashSet();

            var newMarks = new List<clsStudentMark>();

            foreach (var enrollment in allEnrollments)
            {
                var marks = new[]
                {
                    new { ExamTypeId = 1, Mark = 15m },
                    new { ExamTypeId = 2, Mark = 17m },
                    new { ExamTypeId = 3, Mark = 48m }
                };

                foreach (var mark in marks)
                {
                    var key = $"{enrollment.Id}_{mark.ExamTypeId}";

                    if (existingMarkKeys.Contains(key))
                        continue;

                    newMarks.Add(new clsStudentMark
                    {
                        EnrollmentId = enrollment.Id,
                        ExamTypeId = mark.ExamTypeId,
                        Mark = mark.Mark
                    });

                    existingMarkKeys.Add(key);
                }
            }

            if (newMarks.Count > 0)
            {
                await context.StudentMarks.AddRangeAsync(newMarks);
                await context.SaveChangesAsync();
            }
        }
    }
}

