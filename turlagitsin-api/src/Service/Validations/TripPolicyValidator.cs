using FluentValidation;
using Core.Entities;

namespace Service.Validations
{
    public class TripPolicyValidator : AbstractValidator<TripPolicy>
    {
        public TripPolicyValidator()
        {
            RuleFor(x => x.TripId)
                .NotEmpty().WithMessage("Tur ID zorunludur.");

            RuleFor(x => x.Title)
                .MaximumLength(200).WithMessage("Politika başlığı en fazla 200 karakter olabilir.");
        }
    }
}
