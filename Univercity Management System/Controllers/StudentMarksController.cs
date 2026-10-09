using Lpgin2.Data;
using Lpgin2.DTOs.Request.StudentMarkDTO;
using Lpgin2.DTOs.Response;
using Lpgin2.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Lpgin2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentMarksController : ControllerBase
    {
        private readonly AppDBContext _context;

        public StudentMarksController(AppDBContext context)
        {
            _context = context;
        }

        [HttpPost("AddNewMark")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<StudentMarkResponseDTO>> AddNewMark(
            [FromBody] AddStudentMarkDTO model)
        {
            if (model == null)
            {
                return BadRequest(new
                {
                    message = "Invalid student mark data."
                });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    message = "Invalid student mark data.",
                    errors = ModelState
                });
            }

            var enrollment = await _context.enrollments
                .FindAsync(model.EnrollmentId);

            if (enrollment == null)
            {
                return NotFound(new
                {
                    message =
                        $"There is no enrollment with ID {model.EnrollmentId}"
                });
            }

            var existingMarks = await _context.StudentMarks
                .Where(m => m.EnrollmentId == model.EnrollmentId)
                .ToListAsync();

            if (existingMarks.Any(
                m => m.ExamTypeId == (int)model.ExamTypeId))
            {
                return Conflict(new
                {
                    message =
                        "This exam mark already exists. You can update it instead."
                });
            }

            // Second exam requires First exam
            switch (model.ExamTypeId)
            {
                case Enums.enExamTypes.Secound:

                    if (!existingMarks.Any(
                        m => m.ExamTypeId ==
                             (int)Enums.enExamTypes.First))
                    {
                        return BadRequest(new
                        {
                            message =
                                "Cannot add second exam mark before first exam mark."
                        });
                    }

                    break;


                // Final exam requires First and Second exams
                case Enums.enExamTypes.Final:

                    if (!existingMarks.Any(
                            m => m.ExamTypeId ==
                                 (int)Enums.enExamTypes.First) ||
                        !existingMarks.Any(
                            m => m.ExamTypeId ==
                                 (int)Enums.enExamTypes.Secound))
                    {
                        return BadRequest(new
                        {
                            message =
                                "Cannot add final exam mark before first and second exam marks."
                        });
                    }

                    break;
            }

            try
            {
                var newMark = new clsStudentMark
                {
                    EnrollmentId = model.EnrollmentId,
                    ExamTypeId = (int)model.ExamTypeId,
                    Mark = model.Mark
                };

                _context.StudentMarks.Add(newMark);

                await _context.SaveChangesAsync();

                var response = new StudentMarkResponseDTO
                {
                    EnrollmentId = newMark.EnrollmentId,
                    ExamTypeId = newMark.ExamTypeId,
                    Mark = newMark.Mark
                };

                return CreatedAtAction(
                    nameof(GetMarksByStudentID),
                    new { StudentID = enrollment.StudentId },
                    new
                    {
                        message = "Mark added successfully",
                        mark = response
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
                            "Database error occurred while adding the mark."
                    });
            }
            catch (Exception)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "An unexpected error occurred while adding the mark."
                    });
            }
        }

        [Authorize(Roles = "admin")]
        [HttpPost("AddCourseOfferingMarks")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> AddCourseOfferingMarks([FromBody] AddCourseOfferingMarksDTO model)
        {
            if (model == null)
            {
                return BadRequest(new
                {
                    message = "Invalid marks data."
                });
            }

            if (model.CourseOfferingId <= 0)
            {
                return BadRequest(new
                {
                    message = "Invalid Course Offering ID."
                });
            }

            if (model.Marks == null || model.Marks.Count == 0)
            {
                return BadRequest(new
                {
                    message = "No marks were provided."
                });
            }

            if (!Enum.IsDefined(typeof(Enums.enExamTypes), model.ExamTypeId))
            {
                return BadRequest(new
                {
                    message = "Invalid exam type."
                });
            }

            try
            {
                var courseOfferingExists =
                    await _context.courseOfferings
                        .AnyAsync(co =>
                            co.Id == model.CourseOfferingId);

                if (!courseOfferingExists)
                {
                    return NotFound(new
                    {
                        message =
                            $"There is no Course Offering with ID {model.CourseOfferingId}."
                    });
                }

                var enrollmentIds = model.Marks
                    .Select(m => m.EnrollmentId)
                    .Distinct()
                    .ToList();

                var enrollments = await _context.enrollments
                    .Where(e =>
                        e.CourseOfferingId == model.CourseOfferingId &&
                        enrollmentIds.Contains(e.Id))
                    .Select(e => new
                    {
                        e.Id,
                        e.StudentId,
                        ExistingMarks = e.StudentMarks
                            .Select(m => new
                            {
                                m.ExamTypeId,
                                m.Mark
                            })
                            .ToList()
                    })
                    .ToListAsync();

                var response = new AddCourseOfferingMarksResponseDTO
                {
                    Message = "Marks processed successfully.",
                    TotalReceived = model.Marks.Count
                };

                foreach (var item in model.Marks)
                {

                    var enrollment = enrollments
                        .FirstOrDefault(e =>
                            e.Id == item.EnrollmentId);

                    if (enrollment == null)
                    {
                        response.SkippedMarks.Add(
                            new SkippedMarkResponseDTO
                            {
                                EnrollmentId = item.EnrollmentId,
                                Reason =
                                    "This enrollment does not belong to the selected Course Offering."
                            });

                        continue;
                    }

                    var markAlreadyExists = enrollment.ExistingMarks
                        .Any(m =>
                            m.ExamTypeId == (int)model.ExamTypeId);

                    if (markAlreadyExists)
                    {
                        response.SkippedMarks.Add(
                            new SkippedMarkResponseDTO
                            {
                                EnrollmentId = item.EnrollmentId,
                                Reason =
                                    "This exam mark already exists."
                            });

                        continue;
                    }
                    if (model.ExamTypeId ==
                        Enums.enExamTypes.Secound)
                    {
                        var firstExamExists =
                            enrollment.ExistingMarks.Any(m =>
                                m.ExamTypeId ==
                                (int)Enums.enExamTypes.First);

                        if (!firstExamExists)
                        {
                            response.SkippedMarks.Add(
                                new SkippedMarkResponseDTO
                                {
                                    EnrollmentId = item.EnrollmentId,
                                    Reason =
                                        "Cannot add second exam mark before first exam mark."
                                });

                            continue;
                        }
                    }

                    // Final exam requires First + Second
                    if (model.ExamTypeId ==
                        Enums.enExamTypes.Final)
                    {
                        var firstExamExists =
                            enrollment.ExistingMarks.Any(m =>
                                m.ExamTypeId ==
                                (int)Enums.enExamTypes.First);

                        var secondExamExists =
                            enrollment.ExistingMarks.Any(m =>
                                m.ExamTypeId ==
                                (int)Enums.enExamTypes.Secound);

                        if (!firstExamExists ||
                            !secondExamExists)
                        {
                            response.SkippedMarks.Add(
                                new SkippedMarkResponseDTO
                                {
                                    EnrollmentId = item.EnrollmentId,
                                    Reason =
                                        "Cannot add final exam mark before first and second exam marks."
                                });

                            continue;
                        }
                    }

                    // Add new mark
                    var newMark = new clsStudentMark
                    {
                        EnrollmentId = item.EnrollmentId,

                        ExamTypeId =
                            (int)model.ExamTypeId,

                        Mark = item.Mark
                    };

                    _context.StudentMarks.Add(newMark);

                    response.AddedMarks.Add(
                        new AddedMarkResponseDTO
                        {
                            EnrollmentId = item.EnrollmentId,
                            Mark = item.Mark
                        });
                }

                await _context.SaveChangesAsync();

                response.Added = response.AddedMarks.Count;

                response.Skipped = response.SkippedMarks.Count;

                return Ok(response);
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
                            "Database error occurred while adding the marks."
                    });
            }
            catch (Exception)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "An unexpected error occurred while adding the marks."
                    });
            }
        }


        [HttpPut("UpdateMark")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<StudentMarkResponseDTO>> UpdateMark(
            [FromBody] UpdateStudentMarkDTO model)
        {
            if (model == null)
            {
                return BadRequest(new
                {
                    message = "Invalid student mark data."
                });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    message = "Invalid student mark data.",
                    errors = ModelState
                });
            }

            var mark = await _context.StudentMarks
                .FirstOrDefaultAsync(
                    m => m.EnrollmentId == model.EnrollmentId &&
                         m.ExamTypeId == (int)model.ExamTypeId);

            if (mark == null)
            {
                return NotFound(new
                {
                    message =
                        "Mark not found for this enrollment and exam type."
                });
            }

            try
            {
                mark.Mark = model.Mark;

                await _context.SaveChangesAsync();

                var response = new StudentMarkResponseDTO
                {
                    EnrollmentId = mark.EnrollmentId,
                    ExamTypeId = mark.ExamTypeId,
                    Mark = mark.Mark
                };

                return Ok(new
                {
                    message = "Mark updated successfully",
                    mark = response
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
                            "Database error occurred while updating the mark."
                    });
            }
            catch (Exception)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "An unexpected error occurred while updating the mark."
                    });
            }
        }

        [Authorize(Roles = "admin,doctor")]
        [HttpGet("GetAllMarksByCourseOfferingID/{COID:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetAllMarksByCourseOfferingID(
            int COID, int pageNumber = 1, int pageSiz = 20)
        {
            if (pageNumber < 1 || pageSiz < 1)
            {
                return BadRequest(new
                {
                    message = "Page Number and Page Size Should be Grater Than 1 "
                });
            }
            if (COID <= 0)
            {
                return BadRequest(new
                {
                    message = $"The ID: {COID} is not valid."
                });
            }

            var Query = _context.enrollments
                    .Where(e => e.CourseOfferingId == COID)
                    .Select(e => new
                    {
                        EnrollmentId = e.Id,
                        StudnetId = e.StudentId,
                        StudentName = e.Student.FirstName + " " + e.Student.LastName,
                        FirstExam = e.StudentMarks
                         .Where(m => m.ExamTypeId == (int)Enums.enExamTypes.First)
                         .Select(m => m.Mark)
                         .FirstOrDefault(),



                        SecondExam = e.StudentMarks
                         .Where(m => m.ExamTypeId == (int)Enums.enExamTypes.Secound)
                         .Select(m => m.Mark)
                         .FirstOrDefault(),

                        FinalExam = e.StudentMarks
                         .Where(m => m.ExamTypeId == (int)Enums.enExamTypes.Final)
                         .Select(m => m.Mark)
                         .FirstOrDefault()

                    });
            var TotalEnrollments = await Query.CountAsync();
            if (TotalEnrollments == 0)
            {
                return NoContent();
            }
            var Enrollments = await Query.OrderBy(e => e.StudnetId)
                .Skip((pageNumber - 1) * pageSiz)
                .Take(pageSiz)
                .ToListAsync();

            return Ok(new
            {
                pageNumber,
                pageSiz,
                TotalEnrollments,
                totalPages = (int)Math.Ceiling(
        TotalEnrollments / (double)pageSiz),

                data = Enrollments
            });
        }


        [Authorize(Roles = "admin")]
        [HttpGet("GetMarksByStudentID/{StudentID:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetMarksByStudentID(int StudentID)
        {
            if (StudentID <= 0)
            {
                return BadRequest(new
                {
                    message =
                        $"The ID: {StudentID} is not valid."
                });
            }

            var marks = await _context.StudentMarks
                .Where(sm =>
                    sm.Enrollment.StudentId == StudentID)
                .Select(m => new
                {
                    CourseName =
                        m.Enrollment.CourseOffering.Course.CourseName,

                    ExamType =
                        ((Enums.enExamTypes)m.ExamTypeId).ToString(),

                    Mark = m.Mark
                })
                .ToListAsync();

            if (marks.Count == 0)
            {
                return NoContent();
            }

            return Ok(marks);
        }


        [Authorize(Roles = "student")]
        [HttpGet("MyMarks")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetMyMarks()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(userIdString, out int userId))
            {
                return Unauthorized(new
                {
                    message = "There is an error while parsing the user ID."
                });
            }

            var studentId = await _context.students
                .Where(s => s.UserId == userId)
                .Select(s => (int?)s.id)
                .FirstOrDefaultAsync();

            if (!studentId.HasValue)
            {
                return NotFound(new
                {
                    message = "Student profile not found."
                });
            }
            var marks = await _context.enrollments
                .AsNoTracking()
                .Where(e => e.StudentId == studentId.Value)
                .Select(e => new
                {
                    EnrollmentId = e.Id,

                    CourseOfferingId = e.CourseOfferingId,

                    CourseName = e.CourseOffering.Course.CourseName,
                    Status = e.CourseOffering.Status.ToString(),

                    FirstExam = e.StudentMarks
                        .Where(m =>
                            m.ExamTypeId ==
                            (int)Enums.enExamTypes.First)
                        .Select(m => (int?)m.Mark)
                        .FirstOrDefault(),

                    SecondExam = e.StudentMarks
                        .Where(m =>
                            m.ExamTypeId ==
                            (int)Enums.enExamTypes.Secound)
                        .Select(m => (int?)m.Mark)
                        .FirstOrDefault(),

                    FinalExam = e.StudentMarks
                        .Where(m =>
                            m.ExamTypeId ==
                            (int)Enums.enExamTypes.Final)
                        .Select(m => (int?)m.Mark)
                        .FirstOrDefault()
                })
                .ToListAsync();

            if (marks.Count == 0)
            {
                return NoContent();
            }

            return Ok(marks);
        }

    }


}

