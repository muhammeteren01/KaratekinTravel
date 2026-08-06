using FluentValidation;
using Core.Entities;
using System.Text.RegularExpressions;

namespace Service.Validations
{
    public class ItineraryActivityValidator : AbstractValidator<ItineraryActivity>
    {
        public ItineraryActivityValidator()
        {
            RuleFor(x => x.ItineraryId)
                .NotEmpty().WithMessage("Program ID zorunludur.");

            RuleFor(x => x.Time)
                .NotEmpty().WithMessage("Saat zorunludur.")
                .MaximumLength(20).WithMessage("Saat en fazla 20 karakter olabilir.")
                .Must(BeValidTime).WithMessage("Geçerli bir saat formatı giriniz (HH:mm).");

            RuleFor(x => x.Label)
                .NotEmpty().WithMessage("Aktivite başlığı zorunludur.")
                .MaximumLength(300).WithMessage("Aktivite başlığı en fazla 300 karakter olabilir.")
                .MinimumLength(3).WithMessage("Aktivite başlığı en az 3 karakter olmalıdır.");

            RuleFor(x => x.Description)
                .MaximumLength(1000).WithMessage("Aktivite açıklaması en fazla 1000 karakter olabilir.");

            RuleFor(x => x.DisplayOrder)
                .GreaterThanOrEqualTo(0).WithMessage("Sıralama negatif olamaz.");
        }

        private bool BeValidTime(string? time)
        {
            if (string.IsNullOrWhiteSpace(time)) return false;
            var timePattern = @"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$";
            return Regex.IsMatch(time, timePattern);
        }
    }
}
