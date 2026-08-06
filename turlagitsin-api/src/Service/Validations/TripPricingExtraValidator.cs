using FluentValidation;
using Core.Entities;

namespace Service.Validations
{
    public class TripPricingExtraValidator : AbstractValidator<TripPricingExtra>
    {
        public TripPricingExtraValidator()
        {
            RuleFor(x => x.PricingId)
                .NotEmpty().WithMessage("Fiyatlandırma ID zorunludur.");

            RuleFor(x => x.Label)
                .NotEmpty().WithMessage("Ekstra etiket zorunludur.")
                .MaximumLength(200).WithMessage("Ekstra etiket en fazla 200 karakter olabilir.");

            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("Ekstra ücret 0'dan büyük olmalıdır.")
                .LessThanOrEqualTo(100000).WithMessage("Ekstra ücret çok yüksek.");

            RuleFor(x => x.DisplayOrder)
                .GreaterThanOrEqualTo(0).WithMessage("Sıralama negatif olamaz.");
        }
    }
}
