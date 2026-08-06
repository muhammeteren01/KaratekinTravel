using FluentValidation;
using Core.Entities;

namespace Service.Validations
{
    public class CompanyReviewValidator : AbstractValidator<CompanyReview>
    {
        public CompanyReviewValidator()
        {
            RuleFor(x => x.CompanyId)
                .NotEmpty().WithMessage("Şirket ID zorunludur.");

            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("Kullanıcı ID zorunludur.");

            RuleFor(x => x.TripName)
                .NotEmpty().WithMessage("Tur adı zorunludur.")
                .MaximumLength(200).WithMessage("Tur adı en fazla 200 karakter olabilir.");

            RuleFor(x => x.Rating)
                .InclusiveBetween(1, 5).WithMessage("Puan 1 ile 5 arasında olmalıdır.");

            RuleFor(x => x.Comment)
                .MaximumLength(2000).WithMessage("Yorum en fazla 2000 karakter olabilir.");
        }
    }
}
