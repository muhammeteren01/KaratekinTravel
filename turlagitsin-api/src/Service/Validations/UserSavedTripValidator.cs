using FluentValidation;
using Core.Entities;

namespace Service.Validations
{
    public class UserSavedTripValidator : AbstractValidator<UserSavedTrip>
    {
        public UserSavedTripValidator()
        {
            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("Kullanıcı ID zorunludur.");

            RuleFor(x => x.TripId)
                .NotEmpty().WithMessage("Tur ID zorunludur.");
        }
    }
}
