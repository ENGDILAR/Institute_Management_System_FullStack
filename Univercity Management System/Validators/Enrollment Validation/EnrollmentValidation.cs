using FluentValidation;
using Lpgin2.DTOs.Request;

namespace Lpgin2.Validators.Enrollment_Validation
{
    public class EnrollmentValidation : AbstractValidator<EnrollmentDTO>
    {
        public EnrollmentValidation()
        {
            RuleFor(e => e.StudentId)
                .GreaterThan(0)
                .WithMessage("Student ID must be greater than 0.");

            RuleFor(e => e.CourseOfferingId)
                .GreaterThan(0)
                .WithMessage("Course offering ID must be greater than 0.");

            RuleFor(e => e.RegisteredAt)
                .LessThanOrEqualTo(DateTime.UtcNow)
                .WithMessage("Registration date cannot be in the future.");
        }
    }
}