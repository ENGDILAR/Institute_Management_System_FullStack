using Lpgin2.Data;
using Lpgin2.DTOs.Request;
using Lpgin2.DTOs.Response;
using Lpgin2.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lpgin2.Controllers
{
    [Authorize(Roles = "admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class StudentsController : ControllerBase
    {
        private readonly AppDBContext _context;

        public StudentsController(AppDBContext context)
        {
            _context = context;
        }

        [HttpPost("AddNewStudents", Name = "AddNewStudents")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> AddNewStudents(
            [FromBody] StudentDTO student)
        {
            if (student == null)
            {
                return BadRequest(new
                {
                    message = "Invalid student data."
                });
            }

            using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                if (await _context.users.AnyAsync(u => u.Email == student.Email))
                {
                    return Conflict(new
                    {
                        message = "Email already exists. Please use another email."
                    });
                }

                var newUser = new clsUser
                {
                    Email = student.Email,
                    PasswordHash =
                        BCrypt.Net.BCrypt.HashPassword(student.Password),
                    role = Enums.enUserRoles.student
                };

                _context.users.Add(newUser);
                await _context.SaveChangesAsync();

                var newStudent = new clsStudent
                {
                    FirstName = student.FirstName,
                    LastName = student.LastName,
                    Address = student.Address,
                    Phone = student.Phone,
                    EPhone = student.EPhone,
                    UserId = newUser.id
                };

                _context.students.Add(newStudent);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "User registered successfully",

                    student = new StudentResopnseDTO
                    {
                        studentID = newStudent.id,
                        UserID = newUser.id,
                        Email = newUser.Email,
                        FirstName = newStudent.FirstName,
                        LastName = newStudent.LastName,
                        Address = newStudent.Address,
                        Phone = newStudent.Phone,
                        EPhone = newStudent.EPhone
                    }
                });
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync();

                return Conflict(new
                {
                    message =
                        "Concurrency conflict occurred. Please try again."
                });
            }
            catch (DbUpdateException dbEx)
            {
                await transaction.RollbackAsync();

                if (dbEx.InnerException != null &&
                    dbEx.InnerException.Message.Contains(
                        "UNIQUE",
                        StringComparison.OrdinalIgnoreCase))
                {
                    return Conflict(new
                    {
                        message =
                            "Email already exists (duplicate detected)."
                    });
                }

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = "Database error occurred."
                    });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = "An unexpected error occurred."
                    });
            }
        }

        [HttpPatch("UpdateStudent")]
        public async Task<ActionResult<StudentResopnseDTO>> UpdateStudent(
            int studentID,
            [FromBody] UpdateStudentDTO student)
        {
            if (studentID <= 0)
            {
                return BadRequest(new
                {
                    message = $"The ID: {studentID} is not valid."
                });
            }

            var std = await _context.students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.id == studentID);

            if (std == null)
            {
                return NotFound(new
                {
                    message = $"No student found with ID {studentID}"
                });
            }

            using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                if (!string.IsNullOrWhiteSpace(student.Email) &&
                    std.User != null &&
                    std.User.Email != student.Email)
                {
                    bool emailExists =
                        await _context.users.AnyAsync(
                            u => u.Email == student.Email &&
                                 u.id != std.User.id);

                    if (emailExists)
                    {
                        return Conflict(new
                        {
                            message =
                                "Email already exists for another user."
                        });
                    }

                    std.User.Email = student.Email;
                }

                if (!string.IsNullOrWhiteSpace(student.FirstName))
                    std.FirstName = student.FirstName;

                if (!string.IsNullOrWhiteSpace(student.LastName))
                    std.LastName = student.LastName;

                if (!string.IsNullOrWhiteSpace(student.Address))
                    std.Address = student.Address;

                if (!string.IsNullOrWhiteSpace(student.Phone))
                    std.Phone = student.Phone;

                if (!string.IsNullOrWhiteSpace(student.EPhone))
                    std.EPhone = student.EPhone;

                if (!string.IsNullOrWhiteSpace(student.Password) &&
                    std.User != null)
                {
                    std.User.PasswordHash =
                        BCrypt.Net.BCrypt.HashPassword(student.Password);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "Student updated successfully",

                    student = new StudentResopnseDTO
                    {
                        studentID = std.id,
                        UserID = std.UserId,
                        Email = std.User?.Email!,
                        FirstName = std.FirstName,
                        LastName = std.LastName,
                        Address = std.Address,
                        Phone = std.Phone,
                        EPhone = std.EPhone
                    }
                });
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync();
                return Conflict(new
                {
                    message="Concurrency conflict occurred. Please try again."
                });
            }
            catch (DbUpdateException)
            {
                await transaction.RollbackAsync();

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = "Database error occurred while updating the student."
                    });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = "An unexpected error occurred while updating the student."
                    });
            }
        }

        [HttpGet("AllStudents")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<ActionResult<IEnumerable<StudentResopnseDTO>>>
            GetAllStudents()
        {
            var students = await _context.students
                .Include(s => s.User)
                .ToListAsync();

            if (students.Count == 0)
                return NoContent();
            return Ok(
                students.Select(s => new StudentResopnseDTO
                {
                    studentID = s.id,
                    UserID = s.UserId,
                    Email = s.User.Email,
                    FirstName = s.FirstName,
                    LastName = s.LastName,
                    Address = s.Address,
                    Phone = s.Phone,
                    EPhone = s.EPhone
                })
            );
        }
        [HttpGet("GetStudentByID/{StudentID}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<StudentResopnseDTO>>
            GetStudentByID(int StudentID)
        {
            if (StudentID <= 0)
            {
                return BadRequest(new
                {
                    message = $"The ID: {StudentID} is not valid."
                });
            }
            var std = await _context.students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.id == StudentID);

            if (std == null)
            {
                return NotFound(new
                {
                    message = $"There is no student with ID {StudentID}"
                });
            }
            return Ok(new StudentResopnseDTO
            {
                Address = std.Address,
                Email = std.User.Email,
                EPhone = std.EPhone,
                Phone = std.Phone,
                FirstName = std.FirstName,
                LastName = std.LastName,
                studentID = std.id,
                UserID = std.UserId
            });
        }

        [HttpGet("GetStudentCourser/{StudentID}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<StudentResopnseDTO>>
        GetStudentCourses(int StudentID)
        {
            if (StudentID <= 0)
            {
                return BadRequest(new
                {
                    message = $"The ID: {StudentID} is not valid."
                });
            }
            var stdCourses = await _context.enrollments
                          .Where(e => e.StudentId == StudentID)
                          .Select(e => new
                          {

                           CouresName=   e.CourseOffering.Course.CourseName,
                           Course_Hours = e.CourseOffering.Course.Hours,
                           Instructor = e.CourseOffering.Instructor.FirstName,
                           StrtDate = e.CourseOffering.StartDate,
                          }).ToListAsync();
              

            return Ok(stdCourses);
        }
        [HttpDelete("DeleteStudent/{StudentID}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteStudent(int StudentID)
        {
            if (StudentID <= 0)
            {
                return BadRequest(new
                {
                    message = $"The ID: {StudentID} is not valid."
                });
            }
            var student = await _context.students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.id == StudentID);

            if (student == null)
            {
                return NotFound(new
                {
                    message = $"There is no student with ID {StudentID}"
                });
            }
            bool hasEnrollments =
                await _context.enrollments
                    .AnyAsync(e => e.StudentId == StudentID);

            if (hasEnrollments)
            {
                return Conflict(new
                {
                    message = "Cannot delete this student because the student has existing enrollments."
                });
            }
            using var transaction =
                await _context.Database.BeginTransactionAsync();
            try
            {
                if (student.User != null)
                {
                    _context.users.Remove(student.User);
                }
                _context.students.Remove(student);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return NoContent();
            }
            catch (DbUpdateException)
            {
                await transaction.RollbackAsync();
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new
                    {
                        message ="Database error occurred while deleting the student."
                    });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message ="An unexpected error occurred while deleting the student."
                    });
            }
        }
    }
}
