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
    public class CourseOfferingController : ControllerBase
    {
        private readonly AppDBContext _context;

        public CourseOfferingController(AppDBContext context)
        {
            _context = context;
        }
        [HttpPost("AddNewOffer")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CourseOfferResponseDTO>> AddNewOffer(
            [FromBody] CourseOfferingDTO dto)
        {
            if (dto == null)
            {
                return BadRequest(new
                {
                    message = "Invalid course offering data."
                });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    message = "Invalid course offering data.",
                    errors = ModelState
                });
            }

            bool courseExists = await _context.courses
                .AnyAsync(c => c.id == dto.CourseId);

            if (!courseExists)
            {
                return BadRequest(new
                {
                    message =
                        $"There is no course with ID {dto.CourseId}."
                });
            }

            bool instructorExists = await _context.Instructors
                .AnyAsync(i => i.id == dto.InstructorId);

            if (!instructorExists)
            {
                return BadRequest(new
                {
                    message =
                        $"There is no instructor with ID {dto.InstructorId}."
                });
            }

            try
            {
                var offering = new clsCourseOffering
                {
                    OfferName = dto.OfferName,
                    CourseId = dto.CourseId,
                    InstructorId = dto.InstructorId,
                    StartDate = dto.StartDate,
                    EndDate = dto.EndDate,
                    Capacity = dto.Capacity,
                    Status = dto.Status
                };

                _context.courseOfferings.Add(offering);

                await _context.SaveChangesAsync();

                var response = new CourseOfferResponseDTO
                {
                    OfferName = offering.OfferName,
                    OfferId = offering.Id,
                    CourseId = offering.CourseId,
                    DoctorId = offering.InstructorId,
                    Capacity = offering.Capacity,
                    Status = offering.Status,
                    StartDate = offering.StartDate,
                    EndDate = offering.EndDate
                };
                    return CreatedAtAction(
                    nameof(GetOfferByID),
                    new { id = offering.Id },
                    new
                    {
                        message = "Course offering added successfully",
                        offer = response
                    });
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict(new
                {
                    message =
                        "Concurrency conflict occurred. Please try again."
                });
            }
            catch (DbUpdateException)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Database error occurred while adding the course offering."
                    });
            }
            catch (Exception)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "An unexpected error occurred while adding the course offering."
                    });
            }
        }

        [Authorize(Roles = "admin,student")]
        [HttpGet("GetOfferByID/{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> GetOfferByID(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new
                {
                    message = $"The ID: {id} is not valid."
                });
            }

            var offering = await _context.courseOfferings
                .Where(o => o.Id == id)
                .Select(o => new
                {
                    Offer = new CourseOfferResponseDTO
                    {
                        OfferName = o.OfferName,
                        CourseName = o.Course.CourseName,
                        DoctorName = o.Instructor.FirstName + " " + o.Instructor.LastName,
                        OfferId = o.Id,
                        CourseId = o.CourseId,
                        DoctorId = o.InstructorId,
                        Capacity = o.Capacity,
                        Status = o.Status,
                        StartDate = o.StartDate,
                        EndDate = o.EndDate
                    },
                    EnrollmentCount = o.Enrollments.Count()
                })
                .FirstOrDefaultAsync();

            if (offering == null)
            {
                return NotFound(new
                {
                    message =
                        $"There is no course offering with ID {id}"
                });
            }

            return Ok(new
            {
                offer = offering.Offer,
                enrollmentCount = offering.EnrollmentCount,
                isFull =
                    offering.EnrollmentCount >= offering.Offer.Capacity
            });
        }

        [Authorize(Roles = "admin,student")]
        [HttpGet("GetOfferByCourseID/{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> GetOfferByCourseID(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new
                {
                    message = $"The ID: {id} is not valid."
                });
            }

            var offering = await _context.courseOfferings
                .Where(o => o.CourseId == id)
                .Select(o => new
                {
                    Offer = new CourseOfferResponseDTO
                    {
                        OfferName = o.OfferName,
                        DoctorName = o.Instructor.FirstName + " " + o.Instructor.LastName,
                        OfferId = o.Id,
                        DoctorId = o.InstructorId,
                        Capacity = o.Capacity,
                        Status = o.Status,
                        StartDate = o.StartDate,
                        EndDate = o.EndDate
                    },
                    EnrollmentCount = o.Enrollments.Count()
                })
                .ToListAsync();

            if (offering == null)
            {
                return NotFound(new
                {
                    message =
                        $"There is no course offering with ID {id}"
                });
            }

            return Ok(new
            {offering});
        }
        [Authorize(Roles = "admin,student")]
        [HttpGet("GetAllCourseOfferings")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<IEnumerable<CourseOfferResponseDTO>>>
           GetAllCourseOfferings(int pageNumber = 1,int pageSize = 10)
        {
            if (pageNumber < 1)
            {
                return BadRequest(new
                {
                    message = "Page number must be greater than 0."
                });
            }

            if (pageSize < 1)
            {
                return BadRequest(new
                {
                    message = "Page size must be greater than 0."
                });
            }

            if (pageSize > 100)
            {
                return BadRequest(new
                {
                    message = "Page size cannot be greater than 100."
                });
            }

            var totalCount = await _context.courseOfferings
                .CountAsync();

            if (totalCount == 0)
            {
                return NoContent();
            }

            var offerings = await _context.courseOfferings
                .OrderBy(o => o.Id)
                .Select(o => new CourseOfferResponseDTO
                {
                    OfferName = o.OfferName,
                    OfferId = o.Id,
                    CourseName = o.Course.CourseName,
                    DoctorName = o.Instructor.FirstName + " "+o.Instructor.LastName,
                    CourseId = o.CourseId,
                    Capacity = o.Capacity,
                    DoctorId = o.InstructorId,
                    StartDate = o.StartDate,
                    EndDate = o.EndDate,
                    Status = o.Status,
                    Enrollments = o.Enrollments.Count.ToString(),
                })
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var totalPages = (int)Math.Ceiling(
                totalCount / (double)pageSize
            );

            return Ok(new
            {
                data = offerings,
                pageNumber,
                pageSize,
                totalCount,
                totalPages,
                hasNextPage = pageNumber < totalPages,
                hasPreviousPage = pageNumber > 1
            });
        }

        [Authorize(Roles = "admin")]
        [HttpGet("GetInfo")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> GetData()
        {
            var Instructors = await _context.Instructors
                .Select(i => new
                {
                    InstructorID = i.id,
                    InstructorName = i.FirstName + " " + i.LastName,


                }).ToListAsync();
            var Courses = await _context.courses
              .Select(c => new
              {
                  CourseID = c.id,
                  CourseName = c.CourseName,

              }).ToListAsync();

            return Ok(new{ Courses, Instructors });
        }
        [HttpPut("UpdateOffer/{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CourseOfferResponseDTO>> UpdateOffer(int id,[FromBody] CourseOfferingDTO dto)
        {
            if (id <= 0)
            {
                return BadRequest(new
                {
                    message = $"The ID: {id} is not valid."
                });
            }

            if (dto == null)
            {
                return BadRequest(new
                {
                    message = "Invalid course offering data."
                });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    message = "Invalid course offering data.",
                    errors = ModelState
                });
            }

            var offering = await _context.courseOfferings
                .FirstOrDefaultAsync(o => o.Id == id);

            if (offering == null)
            {
                return NotFound(new
                {
                    message =
                        $"There is no course offering with ID {id}"
                });
            }

            bool courseExists = await _context.courses
                .AnyAsync(c => c.id == dto.CourseId);

            if (!courseExists)
            {
                return BadRequest(new
                {
                    message =
                        $"There is no course with ID {dto.CourseId}."
                });
            }

            bool instructorExists = await _context.Instructors
                .AnyAsync(i => i.id == dto.InstructorId);

            if (!instructorExists)
            {
                return BadRequest(new
                {
                    message =
                        $"There is no instructor with ID {dto.InstructorId}."
                });
            }

            try
            {
                offering.CourseId = dto.CourseId;
                offering.InstructorId = dto.InstructorId;
                offering.StartDate = dto.StartDate;
                offering.EndDate = dto.EndDate;
                offering.Capacity = dto.Capacity;
                offering.Status = dto.Status;

                await _context.SaveChangesAsync();

                var response = new CourseOfferResponseDTO
                {
      OfferName = offering.OfferName,
                    OfferId = offering.Id,
                    CourseId = offering.CourseId,
                    DoctorId = offering.InstructorId,
                    Capacity = offering.Capacity,
                    Status = offering.Status,
                    StartDate = offering.StartDate,
                    EndDate = offering.EndDate
                };

                return Ok(new
                {
                    message = "Course offering updated successfully",
                    offer = response
                });
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict(new
                {
                    message =
                        "Concurrency conflict occurred. Please try again."
                });
            }
            catch (DbUpdateException)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Database error occurred while updating the course offering."
                    });
            }
            catch (Exception)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "An unexpected error occurred while updating the course offering."
                    });
            }
        }

        [HttpDelete("DeleteOffer/{id:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteOffer(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new
                {
                    message = $"The ID: {id} is not valid."
                });
            }

            var offering = await _context.courseOfferings
                .Include(o => o.Enrollments)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (offering == null)
            {
                return NotFound(new
                {
                    message =
                        $"There is no course offering with ID {id}"
                });
            }

            try
            {
                if (offering.Enrollments.Any())
                {
                    _context.enrollments.RemoveRange(
                        offering.Enrollments);
                }

                _context.courseOfferings.Remove(offering);

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict(new
                {
                    message =
                        "Concurrency conflict occurred. Please try again."
                });
            }
            catch (DbUpdateException)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Database error occurred while deleting the course offering."
                    });
            }
            catch (Exception)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "An unexpected error occurred while deleting the course offering."
                    });
            }
        }
   
    }
}
