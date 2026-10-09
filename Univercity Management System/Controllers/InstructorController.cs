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
    [Authorize(Roles = "admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class InstructorController : ControllerBase
    {
        private readonly AppDBContext _context;

        public InstructorController(AppDBContext context)
        {
            _context = context;
        }

        // =========================================================
        // Add Instructor
        // =========================================================

        [HttpPost("AddNewInstructor")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<InstructorResponseDTO>> AddNewInstructor(
            [FromBody] InstructorDTO model)
        {
            if (model == null)
            {
                return BadRequest(new
                {
                    message = "Invalid instructor data."
                });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    message = "Invalid instructor data.",
                    errors = ModelState
                });
            }

            bool emailExists = await _context.users
                .AnyAsync(u => u.Email == model.Email);

            if (emailExists)
            {
                return Conflict(new
                {
                    message = "Email already exists. Please use another email."
                });
            }

            using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                var newUser = new clsUser
                {
                    Email = model.Email,
                    PasswordHash =
                        BCrypt.Net.BCrypt.HashPassword(model.Password),
                    role = Enums.enUserRoles.instructor
                };

                _context.users.Add(newUser);
                await _context.SaveChangesAsync();

                var newInstructor = new clsInstructor
                {
                    FirstName = model.FirstName,
                    LastName = model.LastName,
                    Address = model.Address,
                    Phone = model.Phone,
                    EPhone = model.EPhone,
                    UserId = newUser.id
                };

                _context.Instructors.Add(newInstructor);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                var response = new InstructorResponseDTO
                {
                    InstructorID = newInstructor.id,
                    UserID = newUser.id,
                    Email = newUser.Email,
                    FirstName = newInstructor.FirstName,
                    LastName = newInstructor.LastName,
                    Address = newInstructor.Address,
                    Phone = newInstructor.Phone,
                    EPhone = newInstructor.EPhone
                };

                return CreatedAtAction(
                    nameof(GetInstructorByID),
                    new { InstructorID = newInstructor.id },
                    new
                    {
                        message = "Instructor added successfully",
                        instructor = response
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
                            "Email already exists. Please use another email."
                    });
                }

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Database error occurred while adding the instructor."
                    });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "An unexpected error occurred while adding the instructor."
                    });
            }
        }


        [HttpPut("Update/{InstructorID:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<InstructorResponseDTO>> UpdateInstructor(
            int InstructorID,
            [FromBody] UpdateInstructorDTO
            model)
        {
            if (InstructorID <= 0)
            {
                return BadRequest(new
                {
                    message = $"The ID: {InstructorID} is not valid."
                });
            }

            if (model == null)
            {
                return BadRequest(new
                {
                    message = "Invalid instructor data."
                });
            }

            var instructor = await _context.Instructors
                .Include(i => i.User)
                .FirstOrDefaultAsync(i => i.id == InstructorID);

            if (instructor == null)
            {
                return NotFound(new
                {
                    message =
                        $"There is no instructor with ID {InstructorID}"
                });
            }

            try
            {
                // Update Email
                if (!string.IsNullOrWhiteSpace(model.Email) &&
                    instructor.User != null &&
                    instructor.User.Email != model.Email)
                {
                    bool emailExists = await _context.users
                        .AnyAsync(u =>
                            u.Email == model.Email &&
                            u.id != instructor.User.id);

                    if (emailExists)
                    {
                        return Conflict(new
                        {
                            message =
                                "Email already exists for another user."
                        });
                    }

                    instructor.User.Email = model.Email;
                }

                // Update personal information
                if (!string.IsNullOrWhiteSpace(model.FirstName))
                    instructor.FirstName = model.FirstName;

                if (!string.IsNullOrWhiteSpace(model.LastName))
                    instructor.LastName = model.LastName;

                if (!string.IsNullOrWhiteSpace(model.Address))
                    instructor.Address = model.Address;

                if (!string.IsNullOrWhiteSpace(model.Phone))
                    instructor.Phone = model.Phone;

                if (!string.IsNullOrWhiteSpace(model.EPhone))
                    instructor.EPhone = model.EPhone;

                // Update password only if provided
                if (!string.IsNullOrWhiteSpace(model.Password) &&
                    instructor.User != null)
                {
                    instructor.User.PasswordHash =
                        BCrypt.Net.BCrypt.HashPassword(model.Password);
                }

                await _context.SaveChangesAsync();

                var response = new InstructorResponseDTO
                {
                    InstructorID = instructor.id,
                    UserID = instructor.UserId,
                    Email = instructor.User?.Email,
                    FirstName = instructor.FirstName,
                    LastName = instructor.LastName,
                    Address = instructor.Address,
                    Phone = instructor.Phone,
                    EPhone = instructor.EPhone
                };

                return Ok(new
                {
                    message = "Instructor updated successfully",
                    instructor = response
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
                            "Database error occurred while updating the instructor."
                    });
            }
            catch (Exception)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "An unexpected error occurred while updating the instructor."
                    });
            }
        }


        // =========================================================
        // Get All Instructors
        // =========================================================

        [HttpGet("AllInstructor")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<ActionResult<IEnumerable<InstructorResponseDTO>>>
            AllInstructor()
        {
            var instructors = await _context.Instructors
                .Select(i => new InstructorResponseDTO
                {
                    InstructorID = i.id,
                    UserID = i.UserId,
                    Email = i.User.Email,
                    FirstName = i.FirstName,
                    LastName = i.LastName,
                    Address = i.Address,
                    Phone = i.Phone,
                    EPhone = i.EPhone
                })
                .ToListAsync();

            if (instructors.Count == 0)
                return NoContent();

            return Ok(instructors);
        }


        // =========================================================
        // Get Instructor By ID
        // =========================================================

        [Authorize(Roles = "admin,student")]
        [HttpGet("GetInstructor/{InstructorID:int}",
            Name = "GetInstructorByID")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<InstructorResponseDTO>>
            GetInstructorByID(int InstructorID)
        {
            if (InstructorID <= 0)
            {
                return BadRequest(new
                {
                    message =
                        $"The ID: {InstructorID} is not valid."
                });
            }

            var instructor = await _context.Instructors
                .Where(i => i.id == InstructorID)
                .Select(i => new InstructorResponseDTO
                {
                    InstructorID = i.id,
                    UserID = i.UserId,
                    Email = i.User.Email,
                    FirstName = i.FirstName,
                    LastName = i.LastName,
                    Address = i.Address,
                    Phone = i.Phone,
                    EPhone = i.EPhone
                })
                .FirstOrDefaultAsync();

            if (instructor == null)
            {
                return NotFound(new
                {
                    message =
                        $"There is no instructor with ID {InstructorID}"
                });
            }

            return Ok(instructor);
        }


        // =========================================================
        // Delete Instructor
        // =========================================================

        [HttpDelete("DeleteInstructor/{InstructorID:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteInstructor(int InstructorID)
        {
            if (InstructorID <= 0)
            {
                return BadRequest(new
                {
                    message =
                        $"The ID: {InstructorID} is not valid."
                });
            }

            var instructor = await _context.Instructors
                .Include(i => i.User)
                .FirstOrDefaultAsync(i => i.id == InstructorID);

            if (instructor == null)
            {
                return NotFound(new
                {
                    message =
                        $"There is no instructor with ID {InstructorID}"
                });
            }

            try
            {
                if (instructor.User != null)
                {
                    _context.users.Remove(instructor.User);
                }

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
                            "Database error occurred while deleting the instructor."
                    });
            }
            catch (Exception)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "An unexpected error occurred while deleting the instructor."
                    });
            }
        }
    }
}
