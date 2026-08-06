using FluentValidation;
using Core.Entities;

namespace Service.Validations
{
    public class TripItineraryValidator : AbstractValidator<TripItinerary>
    {
        public TripItineraryValidator()
        {
            RuleFor(x => x.TripId)
                .NotEmpty().WithMessage("Tur ID zorunludur.");

            RuleFor(x => x.Day)
                .GreaterThan(0).WithMessage("Gün sayısı 0'dan büyük olmalıdır.")
                .LessThanOrEqualTo(365).WithMessage("Gün sayısı çok yüksek.");

            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Program başlığı zorunludur.")
                .MaximumLength(300).WithMessage("Program başlığı en fazla 300 karakter olabilir.")
                .MinimumLength(3).WithMessage("Program başlığı en az 3 karakter olmalıdır.");

            RuleFor(x => x.DateLabel)
                .MaximumLength(100).WithMessage("Tarih etiketi en fazla 100 karakter olabilir.");

            RuleFor(x => x.Note)
                .MaximumLength(1000).WithMessage("Not en fazla 1000 karakter olabilir.");

            RuleFor(x => x.DisplayOrder)
                .GreaterThanOrEqualTo(0).WithMessage("Sıralama negatif olamaz.");
        }
    }
}
