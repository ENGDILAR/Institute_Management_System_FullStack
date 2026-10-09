using FluentValidation;
using Lpgin2.DTOs.Request;

namespace Lpgin2.Validators.Course_Validation
{

        public class CourseValidation : AbstractValidator<CourseDTO>
        {
            public CourseValidation()
            {
                RuleFor(c => c.CourseName)
                    .Cascade(CascadeMode.Stop)
                    .NotEmpty().WithMessage("Course name is required.")
                    .MinimumLength(3).WithMessage("Course name must be at least 3 characters long.")
                    .MaximumLength(100).WithMessage("Course name cannot exceed 100 characters.");

                RuleFor(c => c.Hours)
                    .GreaterThan(0).WithMessage("Hours must be greater than 0.");
            }
        }
    
}
