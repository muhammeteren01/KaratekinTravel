using FluentValidation;
using Core.Entities;

namespace Service.Validations
{
    public class CalendarTripValidator : AbstractValidator<CalendarTrip>
    {
        public CalendarTripValidator()
        {
            RuleFor(x => x.Date)
                .NotEmpty().WithMessage("Tarih zorunludur.")
                .GreaterThan(DateTime.Now.AddDays(-1)).WithMessage("Tarih geçmişte olamaz.");

            RuleFor(x => x.Status)
                .IsInEnum().WithMessage("Geçersiz durum.");
        }
    }
}
