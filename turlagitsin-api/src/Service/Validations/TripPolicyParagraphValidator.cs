using FluentValidation;
using Core.Entities;

namespace Service.Validations
{
    public class TripPolicyParagraphValidator : AbstractValidator<TripPolicyParagraph>
    {
        public TripPolicyParagraphValidator()
        {
            RuleFor(x => x.PolicyId)
                .NotEmpty().WithMessage("Politika ID zorunludur.");

            RuleFor(x => x.Content)
                .NotEmpty().WithMessage("Politika içeriği boş olamaz.")
                .MaximumLength(2000).WithMessage("Politika içeriği en fazla 2000 karakter olabilir.")
                .MinimumLength(10).WithMessage("Politika içeriği en az 10 karakter olmalıdır.");

            RuleFor(x => x.DisplayOrder)
                .GreaterThanOrEqualTo(0).WithMessage("Sıralama negatif olamaz.");
        }
    }
}
