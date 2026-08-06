using FluentValidation;
using Core.Entities;

namespace Service.Validations
{
    public class ReservationValidator : AbstractValidator<Reservation>
    {
        public ReservationValidator()
        {
            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("Kullanıcı ID zorunludur.");

            RuleFor(x => x.TripId)
                .NotEmpty().WithMessage("Tur ID zorunludur.");

            RuleFor(x => x.CompanyId)
                .NotEmpty().WithMessage("Şirket ID zorunludur.");

            RuleFor(x => x.SeatNumbers)
                .NotEmpty().WithMessage("Koltuk numaraları zorunludur.")
                .MaximumLength(500).WithMessage("Koltuk numaraları çok uzun.");

            RuleFor(x => x.TotalAmount)
                .GreaterThan(0).WithMessage("Toplam tutar 0'dan büyük olmalıdır.")
                .LessThanOrEqualTo(1000000).WithMessage("Toplam tutar çok yüksek.");

            RuleFor(x => x.Currency)
                .NotEmpty().WithMessage("Para birimi zorunludur.")
                .MaximumLength(10).WithMessage("Para birimi en fazla 10 karakter olabilir.");

            RuleFor(x => x.Status)
                .NotEmpty().WithMessage("Durum zorunludur.")
                .MaximumLength(50).WithMessage("Durum en fazla 50 karakter olabilir.");

            RuleFor(x => x.Notes)
                .MaximumLength(1000).WithMessage("Notlar en fazla 1000 karakter olabilir.");
        }
    }
}
