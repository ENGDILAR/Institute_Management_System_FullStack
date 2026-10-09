using Lpgin2.Data;
using Lpgin2.DTOs.Request;
using Lpgin2.DTOs.Response;
using Lpgin2.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lpgin2.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CourseController : ControllerBase
    {
        private readonly AppDBContext _context;

        public CourseController(AppDBContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "admin,student")]
        [HttpGet("GetAllCourses")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<ActionResult<IEnumerable<CourseResponseDTO>>> GetAllCourses()
        {
            var courses = await _context.courses
                .Select(c => new CourseResponseDTO
                {
                    CourseId = c.id,
                    CourseName = c.CourseName,
                    Hours = c.Hours,
                    Offers = _context.courseOfferings.Where(O=>O.CourseId == c.id ).Count(),
                })
                .ToListAsync();

            if (courses.Count == 0)
                return NoContent();

            return Ok(courses);
        }

        [Authorize(Roles = "admin,student")]
        [HttpGet("GetById/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<CourseResponseDTO>> GetCourseById(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new
                {
                    message = $"The ID: {id} is not valid."
                });
            }

            var course = await _context.courses
                .Where(c => c.id == id)
                .Select(c => new CourseResponseDTO
                {
                    CourseId = c.id,
                    CourseName = c.CourseName,
                    Hours = c.Hours,
                 
                })
                .FirstOrDefaultAsync();

            if (course == null)
            {
                return NotFound(new
                {
                    message = $"There is no course with ID {id}"
                });
            }

            return Ok(course);
        }

        [Authorize(Roles = "admin,student")]
        [HttpGet("GetByName")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<CourseResponseDTO>> GetCourseByName(
            [FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest(new
                {
                    message = "Course name is required."
                });
            }

            var course = await _context.courses
                .Where(c => c.CourseName.ToLower() == name.ToLower())
                .Select(c => new CourseResponseDTO
                {
                    CourseId = c.id,
                    CourseName = c.CourseName,
                    Hours = c.Hours
                })
                .FirstOrDefaultAsync();

            if (course == null)
            {
                return NotFound(new
                {
                    message = $"There is no course with name {name}"
                });
            }

            return Ok(course);
        }

        [HttpPost("AddCourse")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CourseResponseDTO>> AddCourse(
            [FromBody] CourseDTO model)
        {
            if (model == null)
            {
                return BadRequest(new
                {
                    message = "Invalid course data."
                });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    message = "Invalid course data.",
                    errors = ModelState
                });
            }

            bool courseExists = await _context.courses
                .AnyAsync(c => c.CourseName.ToLower() == model.CourseName.ToLower());

            if (courseExists)
            {
                return Conflict(new
                {
                    message = "Course already exists. Please use another course name."
                });
            }

            try
            {
                var course = new clsCourse
                {
                    CourseName = model.CourseName,
                    Hours = model.Hours
                };

                _context.courses.Add(course);
                await _context.SaveChangesAsync();

                var response = new CourseResponseDTO
                {
                    CourseId = course.id,
                    CourseName = course.CourseName,
                    Hours = course.Hours
                };

                return CreatedAtAction(
                    nameof(GetCourseById),
                    new { id = course.id },
                    new
                    {
                        message = "Course added successfully",
                        course = response
                    });
            }
            catch (DbUpdateException)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = "Database error occurred while adding the course."
                    });
            }
            catch (Exception)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = "An unexpected error occurred while adding the course."
                    });
            }
        }

        [HttpPut("Update/{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateCourse(int id, [FromBody] CourseDTO model)
        {
            if (id <= 0)
            {
                return BadRequest(new
                {
                    message = $"The ID: {id} is not valid."
                });
            }

            if (model == null)
            {
                return BadRequest(new
                {
                    message = "Invalid course data."
                });
            }

            var course = await _context.courses
                .FirstOrDefaultAsync(c => c.id == id);

            if (course == null)
            {
                return NotFound(new
                {
                    message = $"There is no course with ID {id}"
                });
            }

            bool courseExists = await _context.courses
                .AnyAsync(c =>
                    c.id != id &&
                    c.CourseName.ToLower() == model.CourseName.ToLower());

            if (courseExists)
            {
                return Conflict(new
                {
                    message = "Another course already exists with this name."
                });
            }

            try
            {
                course.CourseName = model.CourseName;
                course.Hours = model.Hours;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Course updated successfully",
                    course = new CourseResponseDTO
                    {
                        CourseId = course.id,
                        CourseName = course.CourseName,
                        Hours = course.Hours
                    }
                });
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict(new
                {
                    message = "Concurrency conflict occurred. Please try again."
                });
            }
            catch (DbUpdateException)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = "Database error occurred while updating the course."
                    });
            }
            catch (Exception)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = "An unexpected error occurred while updating the course."
                    });
            }
        }

        [HttpDelete("Delete/{id:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new
                {
                    message = $"The ID: {id} is not valid."
                });
            }

            var course = await _context.courses
                .FirstOrDefaultAsync(c => c.id == id);

            if (course == null)
            {
                return NotFound(new
                {
                    message = $"There is no course with ID {id}"
                });
            }

            // Prevent deleting a course that is already used
            bool hasOfferings = await _context.courseOfferings
                .AnyAsync(o => o.CourseId == id);

            if (hasOfferings)
            {
                return Conflict(new
                {
                    message = "Cannot delete this course because it has existing course offerings."
                });
            }

            try
            {
                _context.courses.Remove(course);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateException)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = "Database error occurred while deleting the course."
                    });
            }
            catch (Exception)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = "An unexpected error occurred while deleting the course."
                    });
            }
        }
    }
}