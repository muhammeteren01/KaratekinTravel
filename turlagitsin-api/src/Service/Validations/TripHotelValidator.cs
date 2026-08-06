using FluentValidation;
using Core.Entities;
using System.Text.RegularExpressions;

namespace Service.Validations
{
    public class TripHotelValidator : AbstractValidator<TripHotel>
    {
        public TripHotelValidator()
        {
            RuleFor(x => x.TripId)
                .NotEmpty().WithMessage("Tur ID zorunludur.");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Otel adı zorunludur.")
                .MaximumLength(200).WithMessage("Otel adı en fazla 200 karakter olabilir.")
                .MinimumLength(2).WithMessage("Otel adı en az 2 karakter olmalıdır.");

            RuleFor(x => x.Stars)
                .InclusiveBetween(0, 5).WithMessage("Yıldız sayısı 0 ile 5 arasında olmalıdır.");

            RuleFor(x => x.Address)
                .MaximumLength(500).WithMessage("Adres en fazla 500 karakter olabilir.");

            RuleFor(x => x.CheckIn)
                .MaximumLength(20).WithMessage("Check-in saati en fazla 20 karakter olabilir.");

            RuleFor(x => x.CheckOut)
                .MaximumLength(20).WithMessage("Check-out saati en fazla 20 karakter olabilir.");

            RuleFor(x => x.Description)
                .MaximumLength(1000).WithMessage("Açıklama en fazla 1000 karakter olabilir.");

            RuleFor(x => x.Phone)
                .MaximumLength(50).WithMessage("Telefon en fazla 50 karakter olabilir.")
                .Must(BeValidPhone).WithMessage("Geçerli bir telefon numarası giriniz.")
                .When(x => !string.IsNullOrEmpty(x.Phone));

            RuleFor(x => x.Website)
                .MaximumLength(500).WithMessage("Website en fazla 500 karakter olabilir.");

            RuleFor(x => x.MapLink)
                .MaximumLength(500).WithMessage("Harita linki en fazla 500 karakter olabilir.");

            RuleFor(x => x.DisplayOrder)
                .GreaterThanOrEqualTo(0).WithMessage("Sıralama negatif olamaz.");
        }

        private bool BeValidPhone(string? phone)
        {
            if (string.IsNullOrWhiteSpace(phone)) return true;
            var phonePattern = @"^[\d\s\+\-\(\)]+$";
            return Regex.IsMatch(phone, phonePattern);
        }
    }
}
