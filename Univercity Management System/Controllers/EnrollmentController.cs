using Lpgin2.Data;
using Lpgin2.DTOs.Request;
using Lpgin2.DTOs.Response;
using Lpgin2.Models.MTM;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lpgin2.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class EnrollmentController : ControllerBase
    {
        private readonly AppDBContext _context;

        public EnrollmentController(AppDBContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "admin,doctor")]
        [HttpGet("GetEnrollmentsByOfferID/{courseOfferId:int}")]
        [ProducesResponseType(typeof(IEnumerable<EnrollmentResponseDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<IEnumerable<EnrollmentResponseDTO>>> GetAllEnrollmentsByOfferId(
            int courseOfferId)
        {
            if (courseOfferId <= 0)
                return BadRequest(new
                {
                    message = "Invalid course offering ID."
                });

            var enrollments = await _context.enrollments
                .Where(e => e.CourseOfferingId == courseOfferId)
                .Select(e => new EnrollmentResponseDTO
                {
                    Id = e.Id,
                    StudentName =e.Student.FirstName+" "+e.Student.LastName,
                    CourseOfferingId = e.CourseOfferingId,
                    StudentId = e.StudentId,
                    RegisteredAt = e.RegisteredAt
                })
                .ToListAsync();

            if (enrollments.Count == 0)
                return NoContent();

            return Ok(enrollments);
        }


        [Authorize(Roles = "admin,student")]
        [HttpGet("GetEnrollmentsByStudentID/{studentId:int}")]
        [ProducesResponseType(typeof(IEnumerable<EnrollmentResponseDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<IEnumerable<EnrollmentResponseDTO>>> GetEnrollmentsByStudentId(
            int studentId)
        {
            if (studentId <= 0)
                return BadRequest(new
                {
                    message = "Invalid student ID."
                });

            var enrollments = await _context.enrollments
                .Where(e => e.StudentId == studentId)
                .Select(e => new EnrollmentResponseDTO
                {
                    Id = e.Id,
                    CourseOfferingId = e.CourseOfferingId,
                    StudentId = e.StudentId,
                    RegisteredAt = e.RegisteredAt
                })
                .ToListAsync();

            if (enrollments.Count == 0)
                return NoContent();

            return Ok(enrollments);
        }


        [HttpGet("GetEnrollmentByID/{id:int}", Name = "GetEnrollmentByID")]
        [ProducesResponseType(typeof(EnrollmentResponseDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<EnrollmentResponseDTO>> GetEnrollmentByID(int id)
        {
            if (id <= 0)
                return BadRequest(new
                {
                    message = "Invalid enrollment ID."
                });

            var enrollment = await _context.enrollments
                .Where(e => e.Id == id)
                .Select(e => new EnrollmentResponseDTO
                {
                    Id = e.Id,
                    CourseOfferingId = e.CourseOfferingId,
                    StudentId = e.StudentId,
                    RegisteredAt = e.RegisteredAt
                })
                .FirstOrDefaultAsync();

            if (enrollment == null)
                return NotFound(new
                {
                    message = "Enrollment not found."
                });

            return Ok(enrollment);
        }


        [HttpPost("AddNewEnrollment", Name = "CreateEnrollment")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<EnrollmentResponseDTO>> CreateEnrollment(
            [FromBody] EnrollmentDTO enrollment)
        {
            if (enrollment == null ||
                enrollment.CourseOfferingId <= 0 ||
                enrollment.StudentId <= 0)
            {
                return BadRequest(new
                {
                    message = "Invalid enrollment data. Please check again."
                });
            }

            var courseOffering = await _context.courseOfferings
                .FirstOrDefaultAsync(o => o.Id == enrollment.CourseOfferingId);

            if (courseOffering == null)
            {
                return NotFound(new
                {
                    message = "Course offering not found."
                });
            }

            if (courseOffering.Status != Models.Entities.Enums.enCourseOfferingStatus.Open)
            {
                return BadRequest(new
                {
                    message = "This Course is Not Open Any More"
                });
            }

            var studentExists = await _context.students
                .AnyAsync(s => s.id == enrollment.StudentId);

            if (!studentExists)
            {
                return NotFound(new
                {
                    message = "Student not found."
                });
            }

            var alreadyEnrolled = await _context.enrollments
                .AnyAsync(e =>
                    e.CourseOfferingId == enrollment.CourseOfferingId &&
                    e.StudentId == enrollment.StudentId);

            if (alreadyEnrolled)
            {
                return Conflict(new
                {
                    message = "The student is already enrolled in this course offering."
                });
            }

            if (courseOffering.Capacity <= 0)
            {
                return Conflict(new
                {
                    message = "No available seats in this course offering."
                });
            }

            var entity = new clsEnrollments
            {
                CourseOfferingId = enrollment.CourseOfferingId,
                StudentId = enrollment.StudentId
            };

            try
            {
                await _context.enrollments.AddAsync(entity);

                courseOffering.Capacity -= 1;

                await _context.SaveChangesAsync();

                var response = new EnrollmentResponseDTO
                {
                    Id = entity.Id,
                    CourseOfferingId = entity.CourseOfferingId,
                    StudentId = entity.StudentId,
                    RegisteredAt = entity.RegisteredAt
                };

                return CreatedAtRoute(
                    "GetEnrollmentByID",
                    new { id = entity.Id },
                    new
                    {
                        message = "Enrollment created successfully.",
                        enrollment = response
                    });
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict(new
                {
                    message = "The enrollment could not be created because the data was modified by another operation."
                });
            }
            catch (DbUpdateException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = "An error occurred while creating the enrollment."
                });
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = "An unexpected error occurred."
                });
            }
        }


        [Authorize(Roles = "admin")]
        [HttpDelete("DeleteEnrollmentByID/{id:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteEnrollment(int id)
        {
            if (id <= 0)
                return BadRequest(new
                {
                    message = "Invalid enrollment ID."
                });

            var enrollment = await _context.enrollments
                .FindAsync(id);

            if (enrollment == null)
            {
                return NotFound(new
                {
                    message = "Enrollment not found."
                });
            }

            try
            {
                var courseOffering = await _context.courseOfferings
                    .FindAsync(enrollment.CourseOfferingId);

                if (courseOffering != null)
                {
                    courseOffering.Capacity += 1;
                }

                _context.enrollments.Remove(enrollment);

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict(new
                {
                    message = "The enrollment could not be deleted because the data was modified by another operation."
                });
            }
            catch (DbUpdateException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = "An error occurred while deleting the enrollment."
                });
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = "An unexpected error occurred."
                });
            }
        }
    }
}