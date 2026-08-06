using FluentValidation;
using Core.Entities;

namespace Service.Validations
{
    public class TripPricingValidator : AbstractValidator<TripPricing>
    {
        public TripPricingValidator()
        {
            RuleFor(x => x.TripId)
                .NotEmpty().WithMessage("Tur ID zorunludur.");

            RuleFor(x => x.Currency)
                .NotEmpty().WithMessage("Para birimi zorunludur.")
                .MaximumLength(10).WithMessage("Para birimi en fazla 10 karakter olabilir.")
                .Must(BeValidCurrency).WithMessage("Geçerli bir para birimi giriniz (TRY, USD, EUR).");

            RuleFor(x => x.BasePrice)
                .GreaterThan(0).WithMessage("Temel fiyat 0'dan büyük olmalıdır.")
                .LessThanOrEqualTo(1000000).WithMessage("Temel fiyat çok yüksek.");

            RuleFor(x => x.DiscountLabel)
                .MaximumLength(100).WithMessage("İndirim etiketi en fazla 100 karakter olabilir.");

            RuleFor(x => x.DiscountAmount)
                .GreaterThan(0).WithMessage("İndirim miktarı 0'dan büyük olmalıdır.")
                .LessThan(x => x.BasePrice).WithMessage("İndirim miktarı temel fiyattan küçük olmalıdır.")
                .When(x => x.DiscountAmount.HasValue);
        }

        private bool BeValidCurrency(string currency)
        {
            var validCurrencies = new[] { "TRY", "USD", "EUR", "GBP" };
            return validCurrencies.Contains(currency.ToUpper());
        }
    }
}
