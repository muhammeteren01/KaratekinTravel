using FluentValidation;
using Core.Entities;
using System.Text.RegularExpressions;

namespace Service.Validations
{
    public class UserValidator : AbstractValidator<User>
    {
        public UserValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("İsim zorunludur.")
                .MaximumLength(200).WithMessage("İsim en fazla 200 karakter olabilir.")
                .MinimumLength(2).WithMessage("İsim en az 2 karakter olmalıdır.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email zorunludur.")
                .MaximumLength(200).WithMessage("Email en fazla 200 karakter olabilir.")
                .EmailAddress().WithMessage("Geçerli bir email adresi giriniz.")
                .Must(BeValidEmail).WithMessage("Geçerli bir email formatı giriniz.");

            RuleFor(x => x.PasswordHash)
                .NotEmpty().WithMessage("Şifre zorunludur.")
                .MaximumLength(500).WithMessage("Şifre hash'i çok uzun.");

            RuleFor(x => x.Location)
                .MaximumLength(200).WithMessage("Konum en fazla 200 karakter olabilir.");

            RuleFor(x => x.Phone)
                .MaximumLength(50).WithMessage("Telefon en fazla 50 karakter olabilir.")
                .Must(BeValidPhone).WithMessage("Geçerli bir telefon numarası giriniz.")
                .When(x => !string.IsNullOrEmpty(x.Phone));

            RuleFor(x => x.Avatar)
                .MaximumLength(500).WithMessage("Avatar URL'si en fazla 500 karakter olabilir.");
        }

        private bool BeValidEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email)) return false;
            var emailPattern = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
            return Regex.IsMatch(email, emailPattern);
        }

        private bool BeValidPhone(string? phone)
        {
            if (string.IsNullOrWhiteSpace(phone)) return true;
            var phonePattern = @"^[\d\s\+\-\(\)]+$";
            return Regex.IsMatch(phone, phonePattern) && 
                   phone.Replace(" ", "").Replace("+", "").Replace("-", "")
                        .Replace("(", "").Replace(")", "").Length >= 10;
        }
    }
}
