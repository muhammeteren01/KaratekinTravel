using FluentValidation;
using Core.Entities;

namespace Service.Validations
{
    public class ReviewValidator : AbstractValidator<Review>
    {
        public ReviewValidator()
        {
            RuleFor(x => x.TripId)
                .NotEmpty().WithMessage("Tur ID zorunludur.");

            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("Kullanıcı ID zorunludur.");

            RuleFor(x => x.Rating)
                .InclusiveBetween(1, 5).WithMessage("Rating 1 ile 5 arasında olmalıdır.");

            RuleFor(x => x.Comment)
                .MaximumLength(2000).WithMessage("Yorum en fazla 2000 karakter olabilir.")
                .MinimumLength(10).WithMessage("Yorum en az 10 karakter olmalıdır.")
                .When(x => !string.IsNullOrEmpty(x.Comment));
        }
    }
}
