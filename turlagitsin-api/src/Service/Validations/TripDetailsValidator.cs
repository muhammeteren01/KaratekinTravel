using FluentValidation;
using Core.Entities;

namespace Service.Validations
{
    public class TripDetailsValidator : AbstractValidator<TripDetails>
    {
        public TripDetailsValidator()
        {
            RuleFor(x => x.TripId)
                .NotEmpty().WithMessage("Tur ID zorunludur.");

            RuleFor(x => x.SpecialNote)
                .MaximumLength(2000).WithMessage("Özel not en fazla 2000 karakter olabilir.");
        }
    }
}
