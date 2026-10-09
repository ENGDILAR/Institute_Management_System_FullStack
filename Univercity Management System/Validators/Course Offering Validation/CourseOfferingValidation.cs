using FluentValidation;
using Lpgin2.DTOs.Request;

namespace Lpgin2.Validators.CourseOffering_Validation
{
    public class CourseOfferingValidation : AbstractValidator<CourseOfferingDTO>
    {
        public CourseOfferingValidation()
        {
            RuleFor(c => c.CourseId)
                .GreaterThan(0)
                .WithMessage("Course ID must be greater than 0.");

            RuleFor(c => c.InstructorId)
                .GreaterThan(0)
                .WithMessage("Doctor ID must be greater than 0.");

            RuleFor(c => c.Capacity)
                .GreaterThan(0)
                .WithMessage("Capacity must be greater than 0.");

            RuleFor(c => c.Status)
                .IsInEnum()
                .WithMessage("Invalid course offering status.");

            RuleFor(c => c)
                .Must(x =>
                    !x.StartDate.HasValue ||
                    !x.EndDate.HasValue ||
                    x.StartDate <= x.EndDate)
                .WithMessage("Start date must be earlier than or equal to end date.");
        }
    }
}