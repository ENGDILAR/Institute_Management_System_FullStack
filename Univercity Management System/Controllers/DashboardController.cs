using Lpgin2.Data;
using Lpgin2.DTOs.Dashboard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Lpgin2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly AppDBContext _Context;

        public DashboardController(AppDBContext context)
        {
            _Context = context;
        }



        [HttpGet("Statistics", Name = "Statistics")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<StatisticsDTO>> GetStatistics()
        {
            var totalCourses = await _Context.courses
                .AsNoTracking()
                .CountAsync();

            var totalInstructors = await _Context.Instructors
                .AsNoTracking()
                .CountAsync();

            var totalStudents = await _Context.students
                .AsNoTracking()
                .CountAsync();

            var totalCourseOfferings = await _Context.courseOfferings
                .AsNoTracking()
                .CountAsync();

            var statistics = new StatisticsDTO
            {
                TotalCourses = totalCourses,
                TotalInstructors = totalInstructors,
                TotalStudents = totalStudents,
                TotalCourseOfferings = totalCourseOfferings
            };

            return Ok(statistics);
        }

        [Authorize(Roles = "admin")]
        [HttpGet("Admin")]
        public async Task<ActionResult<AdminDashboardDTO>> GetAdminDashboard()
        {
            var result = new AdminDashboardDTO
            {
                TotalStudents = await _Context.students
                    .CountAsync(),

                TotalInstructors = await _Context.Instructors
                    .CountAsync(),

                TotalCourses = await _Context.courses
                    .CountAsync(),

                TotalCourseOfferings = await _Context.courseOfferings
                    .CountAsync()
            };



            result.OfferingsByStatus = await _Context.courseOfferings
                .GroupBy(o => o.Status)
                .Select(g => new OfferingStatusDTO
                {
                    Status = g.Key.ToString(),
                    Count = g.Count()
                })
                .ToListAsync();


            result.EnrollmentsByCourse = await _Context.courseOfferings
                .GroupBy(o => o.Course.CourseName)
                .Select(g => new CourseEnrollmentDTO
                {
                    CourseName = g.Key,
                    Students = g.SelectMany(o => o.Enrollments)
                                .Select(e => e.StudentId)
                                .Distinct()
                                .Count()
                })
                .ToListAsync();


            return Ok(result);
        }

        [Authorize(Roles = "instructor")]
        [HttpGet("instructorDashboard")]
        public async Task<ActionResult<InstructorDashboardDTO>> GetInstructorDashboard()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(userIdString, out int userId))
                return Unauthorized("Invalid user identity.");

            
            var instructor = await _Context.Instructors
                .AsNoTracking()
                .Where(i => i.UserId == userId)
                .Select(i => new
                {
                    i.id,
                    InstructorName = i.FirstName + " " + i.LastName
                })
                .FirstOrDefaultAsync();

            if (instructor == null)
                return NotFound("Instructor profile not found.");
            var offerings = await _Context.courseOfferings
     
                .Where(o => o.InstructorId == instructor.id)
                .Select(o => new
                {
                    o.Id,
                    o.CourseId,
                    o.OfferName,

                    CourseName = o.Course.CourseName,

                    Enrollments = o.Enrollments
                        .Select(e => new
                        {
                            e.StudentId,

                            Marks = e.StudentMarks
                                .Select(m => new
                                {
                                    m.ExamTypeId,
                                    m.Mark
                                })
                                .ToList()
                        })
                        .ToList()
                })
                .ToListAsync();


            var courses = offerings
                .Select(o =>
                {
                    var studentResults = o.Enrollments
                        .GroupBy(e => e.StudentId)
                        .Select(studentGroup =>
                        {
         
                            var enrollment = studentGroup.First();

                            var firstMark = enrollment.Marks
                                .FirstOrDefault(m => m.ExamTypeId == 1);

                            var secondMark = enrollment.Marks
                                .FirstOrDefault(m => m.ExamTypeId == 2);

                            var finalMark = enrollment.Marks
                                .FirstOrDefault(m => m.ExamTypeId == 3);

                            var isCompleted =
                                firstMark?.Mark.HasValue == true &&
                                secondMark?.Mark.HasValue == true &&
                                finalMark?.Mark.HasValue == true;

                            var totalMark = isCompleted
                                ? enrollment.Marks
                                    .Where(m => m.Mark.HasValue)
                                    .Sum(m => m.Mark!.Value)
                                : (decimal?)null;

                            return new
                            {
                                StudentId = studentGroup.Key,
                                IsCompleted = isCompleted,
                                TotalMark = totalMark
                            };
                        })
                        .ToList();


                    var completedStudents = studentResults
                        .Where(s => s.IsCompleted)
                        .ToList();

                    var successfulStudents = completedStudents
                        .Where(s => s.TotalMark >= 60)
                        .ToList();

                    var failedStudents = completedStudents
                        .Where(s => s.TotalMark < 60)
                        .ToList();


                    var averageMark = completedStudents.Count > 0
                        ? Math.Round(
                            completedStudents.Average(s => s.TotalMark!.Value),
                            2)
                        : 0;


                    return new InstructorCourseDTO
                    {
                        OfferingId = o.Id,

                        CourseName = o.CourseName,
                        OfferName = o.OfferName,

                        Students = studentResults.Count,

                        CompletedStudents = completedStudents.Count,

                        SuccessfulStudents = successfulStudents.Count,

                        FailedStudents = failedStudents.Count,

                        AverageMark = averageMark
                    };
                })
                .ToList();
            var totalCourses = offerings
                .Select(o => o.CourseId)
                .Distinct()
                .Count();

            var totalOfferings = offerings.Count;

            var totalEnrollments = offerings
                .SelectMany(o => o.Enrollments)
                .Count();

            var totalStudents = offerings
                .SelectMany(o => o.Enrollments)
                .Select(e => e.StudentId)
                .Distinct()
                .Count();


            var allStudentResults = offerings
                .SelectMany(o => o.Enrollments)
                .GroupBy(e => new
                {
                    e.StudentId,
                })
                .SelectMany(g => g)
                .Select(e =>
                {
                    var firstMark = e.Marks
                        .FirstOrDefault(m => m.ExamTypeId == 1);

                    var secondMark = e.Marks
                        .FirstOrDefault(m => m.ExamTypeId == 2);

                    var finalMark = e.Marks
                        .FirstOrDefault(m => m.ExamTypeId == 3);

                    var isCompleted =
                        firstMark?.Mark.HasValue == true &&
                        secondMark?.Mark.HasValue == true &&
                        finalMark?.Mark.HasValue == true;

                    var totalMark = isCompleted
                        ? e.Marks
                            .Where(m => m.Mark.HasValue)
                            .Sum(m => m.Mark!.Value)
                        : (decimal?)null;

                    return new
                    {
                        IsCompleted = isCompleted,
                        TotalMark = totalMark
                    };
                })
                .ToList();


            var completedResults = allStudentResults
                .Where(x => x.IsCompleted)
                .ToList();

            var successfulStudents = completedResults
                .Count(x => x.TotalMark >= 60);

            var failedStudents = completedResults
                .Count(x => x.TotalMark < 60);

            var average = completedResults.Count > 0
                ? Math.Round(
                    completedResults.Average(x => x.TotalMark!.Value),
                    2)
                : 0;


            var result = new InstructorDashboardDTO
            {
                InstructorName = instructor.InstructorName,

                TotalCourses = totalCourses,

                TotalOfferings = totalOfferings,

                TotalEnrollments = totalEnrollments,

                TotalStudents = totalStudents,

                SuccessfulStudents = successfulStudents,

                FailedStudents = failedStudents,

                Average = average,

                Courses = courses
            };

            return Ok(result);
        }


        [Authorize(Roles = "student")]
        [HttpGet("studentDashboard")]
        public async Task<ActionResult<StudentDashboardDTO>> GetStudentDashboard()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(userIdString, out int userId))
            {
                return BadRequest(new
                {
                    message = "There is an error while parsing the ID."
                });
            }

            var student = await _Context.students
                .AsNoTracking()
                .Where(s => s.UserId == userId)
                .Select(s => new
                {
                    s.id,
                    StudentName = s.FirstName + " " + s.LastName
                })
                .FirstOrDefaultAsync();

            if (student == null)
            {
                return NotFound("Student profile not found.");
            }

            var enrollments = await _Context.enrollments
                .AsNoTracking()
                .Where(e => e.StudentId == student.id)
                .Select(e => new
                {
                    CourseId = e.CourseOffering.CourseId,
                    CourseName = e.CourseOffering.Course.CourseName,
                    Hours = e.CourseOffering.Course.Hours,

                    Marks = e.StudentMarks
                        .Select(m => new
                        {
                            m.ExamTypeId,
                            m.Mark
                        })
                        .ToList()
                })
                .ToListAsync();

            var totalEnrollments = enrollments.Count;

            var courseResults = enrollments
                .GroupBy(e => new
                {
                    e.CourseId,
                    e.CourseName,
                    e.Hours
                })
                .Select(g =>
                {
                    var enrollmentResults = g
                        .Select(e =>
                        {
                            var firstMark = e.Marks
                                .FirstOrDefault(m => m.ExamTypeId == 1);

                            var secondMark = e.Marks
                                .FirstOrDefault(m => m.ExamTypeId == 2);

                            var finalMark = e.Marks
                                .FirstOrDefault(m => m.ExamTypeId == 3);

                            var isCompleted =
                                firstMark?.Mark.HasValue == true &&
                                secondMark?.Mark.HasValue == true &&
                                finalMark?.Mark.HasValue == true;

                            var totalMark = isCompleted
                                ? e.Marks
                                    .Where(m => m.Mark.HasValue)
                                    .Sum(m => m.Mark!.Value)
                                : (decimal?)null;

                            return new
                            {
                                IsCompleted = isCompleted,
                                TotalMark = totalMark
                            };
                        })
                        .OrderByDescending(x => x.IsCompleted)
                        .ThenByDescending(x => x.TotalMark ?? 0)
                        .First();

                    return new
                    {
                        CourseId = g.Key.CourseId,
                        CourseName = g.Key.CourseName,
                        Hours = g.Key.Hours,
                        TotalMark = enrollmentResults.TotalMark
                    };
                })
                .ToList();

            var completedCourses = courseResults
                .Where(c => c.TotalMark.HasValue)
                .ToList();

            var successfulCourses = completedCourses
                .Where(c => c.TotalMark!.Value >= 60)
                .ToList();

            var average = completedCourses.Count > 0
                ? Math.Round(
                    completedCourses.Average(c => c.TotalMark!.Value),
                    2)
                : 0;

            var examPerformance = enrollments
                .SelectMany(e => e.Marks)
                .Where(m => m.Mark.HasValue)
                .GroupBy(m => m.ExamTypeId)
                .Select(g => new ExamPerformanceDTO
                {
                    ExamType = g.Key switch
                    {
                        1 => "First",
                        2 => "Second",
                        3 => "Final",
                        _ => "Unknown"
                    },

                    Average = Math.Round(
                        g.Average(m => m.Mark!.Value),
                        2)
                })
                .ToList();

            var result = new StudentDashboardDTO
            {
                StudentName = student.StudentName,

                TotalEnrollments = totalEnrollments,

                TotalCourses = courseResults.Count,

                SuccessfulCourses = successfulCourses.Count,

                CompletedHours = successfulCourses.Sum(c => c.Hours),

                Average = average,

                Courses = courseResults
                    .Select(c => new StudentCourseDTO
                    {
                        CourseName = c.CourseName,
                        Hours = c.Hours,
                        TotalMark = c.TotalMark,
                        IsPassed = c.TotalMark.HasValue &&
                                   c.TotalMark.Value >= 60
                    })
                    .ToList(),

                ExamPerformance = examPerformance
            };

            return Ok(result);
        }



    }
}