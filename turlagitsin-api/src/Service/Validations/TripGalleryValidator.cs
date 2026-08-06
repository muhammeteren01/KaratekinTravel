using FluentValidation;
using Core.Entities;

namespace Service.Validations
{
    public class TripGalleryValidator : AbstractValidator<TripGallery>
    {
        public TripGalleryValidator()
        {
            RuleFor(x => x.TripId)
                .NotEmpty().WithMessage("Tur ID zorunludur.");

            RuleFor(x => x.ImageUrl)
                .NotEmpty().WithMessage("Resim URL'si zorunludur.")
                .MaximumLength(500).WithMessage("Resim URL'si en fazla 500 karakter olabilir.");

            RuleFor(x => x.Caption)
                .MaximumLength(200).WithMessage("Resim açıklaması en fazla 200 karakter olabilir.");

            RuleFor(x => x.DisplayOrder)
                .GreaterThanOrEqualTo(0).WithMessage("Sıralama negatif olamaz.");
        }
    }
}
