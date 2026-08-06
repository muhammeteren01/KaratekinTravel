using FluentValidation;
using Core.Entities;

namespace Service.Validations
{
    public class HotelAmenityValidator : AbstractValidator<HotelAmenity>
    {
        public HotelAmenityValidator()
        {
            RuleFor(x => x.HotelId)
                .NotEmpty().WithMessage("Otel ID zorunludur.");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Olanağın adı zorunludur.")
                .MaximumLength(100).WithMessage("Olanağın adı en fazla 100 karakter olabilir.");

            RuleFor(x => x.DisplayOrder)
                .GreaterThanOrEqualTo(0).WithMessage("Sıralama negatif olamaz.");
        }
    }
}
