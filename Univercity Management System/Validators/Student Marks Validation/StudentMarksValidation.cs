using FluentValidation;
using Lpgin2.DTOs.Request.StudentMarkDTO;
using static Lpgin2.Models.Entities.Enums;

namespace Lpgin2.Validators.Student_Marks_Validation
{
    public class StudentMarksValidation
        : AbstractValidator<AddCourseOfferingMarksDTO>
    {
        public StudentMarksValidation()
        {
            RuleFor(s => s.CourseOfferingId)
                .GreaterThan(0)
                .WithMessage("CourseOfferingId must be a valid value");

            RuleFor(s => s.ExamTypeId)
                .IsInEnum()
                .WithMessage("Invalid exam type");

            RuleFor(s => s.Marks)
                .NotEmpty()
                .WithMessage("Marks list cannot be empty");

            RuleFor(s => s.Marks)
                .Must((dto, marks) =>
                {
                    return marks.All(mark =>
                        mark.EnrollmentId > 0 &&
                        mark.Mark >= 0 &&
                        IsValidMark(dto.ExamTypeId, mark.Mark)
                    );
                })
                .WithMessage("One or more marks are invalid");
        }

        private bool IsValidMark(
            enExamTypes examType,
            decimal mark)
        {
            return examType switch
            {
                enExamTypes.First => mark <= 20,

                enExamTypes.Secound => mark <= 20,

                enExamTypes.Final => mark <= 60,

                _ => false
            };
        }
    }
}