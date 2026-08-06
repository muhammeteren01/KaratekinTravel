using FluentValidation;
using Core.Entities;

namespace Service.Validations
{
    public class TripValidator : AbstractValidator<Trip>
    {
        public TripValidator()
        {
            RuleFor(x => x.CompanyId)
                .NotEmpty().WithMessage("Şirket ID zorunludur.");

            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Tur başlığı zorunludur.")
                .MaximumLength(300).WithMessage("Tur başlığı en fazla 300 karakter olabilir.")
                .MinimumLength(5).WithMessage("Tur başlığı en az 5 karakter olmalıdır.");

            RuleFor(x => x.Location)
                .MaximumLength(200).WithMessage("Konum en fazla 200 karakter olabilir.");

            RuleFor(x => x.City)
                .MaximumLength(100).WithMessage("Şehir adı en fazla 100 karakter olabilir.");

            RuleFor(x => x.Region)
                .MaximumLength(100).WithMessage("Bölge adı en fazla 100 karakter olabilir.");

            RuleFor(x => x.Rating)
                .InclusiveBetween(0, 5).WithMessage("Rating 0 ile 5 arasında olmalıdır.");

            RuleFor(x => x.Capacity)
                .GreaterThan(0).WithMessage("Kapasite 0'dan büyük olmalıdır.")
                .LessThanOrEqualTo(1000).WithMessage("Kapasite çok yüksek.");

            RuleFor(x => x.JoinedCount)
                .GreaterThanOrEqualTo(0).WithMessage("Katılımcı sayısı negatif olamaz.");

            RuleFor(x => x.Description)
                .MaximumLength(2000).WithMessage("Açıklama en fazla 2000 karakter olabilir.");
        }
    }
}
