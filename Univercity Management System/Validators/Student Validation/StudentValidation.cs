using FluentValidation;
using Lpgin2.DTOs.Request;

namespace Lpgin2.Validators.Student_Validation
{
    public class StudentValidation : AbstractValidator<StudentDTO>
    {
        public StudentValidation()
        {
            RuleFor(s => s.FirstName)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("First name is required.")
                .Length(3, 50).WithMessage("First name must be between 3 and 50 characters.");

            RuleFor(s => s.LastName)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Last name is required.")
                .Length(3, 50).WithMessage("Last name must be between 3 and 50 characters.");

            RuleFor(s => s.Address)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Address is required.")
                .MaximumLength(200).WithMessage("Address cannot exceed 200 characters.");

            RuleFor(s => s.Phone)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Phone number is required.")
                .Matches(@"^\d+$").WithMessage("Phone number must contain only digits.")
                .MaximumLength(20).WithMessage("Phone number cannot exceed 20 digits.");

            RuleFor(s => s.EPhone)
                .Cascade(CascadeMode.Stop)
                .Matches(@"^\d+$").When(s => !string.IsNullOrWhiteSpace(s.EPhone))
                .WithMessage("Emergency phone must contain only digits.")
                .MaximumLength(20).When(s => !string.IsNullOrWhiteSpace(s.EPhone))
                .WithMessage("Emergency phone cannot exceed 20 digits.");

            RuleFor(s => s.Email)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Invalid email address.")
                .MaximumLength(150).WithMessage("Email cannot exceed 150 characters.");

            RuleFor(s => s.Password)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters long.")
                .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
                .Matches(@"\d").WithMessage("Password must contain at least one number.");
        }
    }
}