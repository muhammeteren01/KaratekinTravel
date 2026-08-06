using FluentValidation;
using Core.Entities;

namespace Service.Validations
{
    public class TripIncludedValidator : AbstractValidator<TripIncluded>
    {
        public TripIncludedValidator()
        {
            RuleFor(x => x.DetailsId)
                .NotEmpty().WithMessage("Detay ID zorunludur.");

            RuleFor(x => x.Item)
                .NotEmpty().WithMessage("Dahil edilen öğe zorunludur.")
                .MaximumLength(500).WithMessage("Öğe en fazla 500 karakter olabilir.")
                .MinimumLength(3).WithMessage("Öğe en az 3 karakter olmalıdır.");

            RuleFor(x => x.DisplayOrder)
                .GreaterThanOrEqualTo(0).WithMessage("Sıralama negatif olamaz.");
        }
    }
}
