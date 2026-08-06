using FluentValidation;
using Core.Entities;

namespace Service.Validations
{
    public class CompanyValidator : AbstractValidator<Company>
    {
        public CompanyValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Şirket adı zorunludur.")
                .MaximumLength(200).WithMessage("Şirket adı en fazla 200 karakter olabilir.")
                .MinimumLength(2).WithMessage("Şirket adı en az 2 karakter olmalıdır.");

            RuleFor(x => x.Logo)
                .MaximumLength(500).WithMessage("Logo URL'si en fazla 500 karakter olabilir.");

            RuleFor(x => x.Rating)
                .InclusiveBetween(0, 10).WithMessage("Rating 0 ile 10 arasında olmalıdır.");

            RuleFor(x => x.ReviewCount)
                .GreaterThanOrEqualTo(0).WithMessage("Yorum sayısı negatif olamaz.");

            RuleFor(x => x.Location)
                .MaximumLength(200).WithMessage("Konum en fazla 200 karakter olabilir.");

            RuleFor(x => x.About)
                .MaximumLength(500).WithMessage("Hakkında en fazla 500 karakter olabilir.");

            RuleFor(x => x.FullAbout)
                .MaximumLength(2000).WithMessage("Detaylı açıklama en fazla 2000 karakter olabilir.");
        }
    }
}
