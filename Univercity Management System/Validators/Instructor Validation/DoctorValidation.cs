using FluentValidation;
using Lpgin2.DTOs.Request;

namespace Lpgin2.Validators.Doctor_Validation
{
    public class DoctorValidation : AbstractValidator<InstructorDTO>
    {
        public DoctorValidation()
        {
            RuleFor(d => d.FirstName)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("First name is required.")
                .Length(3, 50).WithMessage("First name must be between 3 and 50 characters.");

            RuleFor(d => d.LastName)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Last name is required.")
                .Length(3, 50).WithMessage("Last name must be between 3 and 50 characters.");

            RuleFor(d => d.Address)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Address is required.")
                .MaximumLength(200).WithMessage("Address cannot exceed 200 characters.");

            RuleFor(d => d.Phone)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Phone number is required.")
                .Matches(@"^[0-9]+$").WithMessage("Phone number must contain only digits.")
                .MaximumLength(20).WithMessage("Phone number cannot exceed 20 digits.");

            RuleFor(d => d.EPhone)
                .Cascade(CascadeMode.Stop)
                .Matches(@"^[0-9]+$").When(d => !string.IsNullOrWhiteSpace(d.EPhone))
                .WithMessage("Emergency phone must contain only digits.")
                .MaximumLength(20).When(d => !string.IsNullOrWhiteSpace(d.EPhone))
                .WithMessage("Emergency phone cannot exceed 20 digits.");

            RuleFor(d => d.Email)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Invalid email address.")
                .MaximumLength(150).WithMessage("Email cannot exceed 150 characters.");

            RuleFor(d => d.Password)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters long.")
                .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
                .Matches(@"\d").WithMessage("Password must contain at least one number.");
        }
    }
}