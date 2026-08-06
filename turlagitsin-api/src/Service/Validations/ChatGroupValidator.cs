using FluentValidation;
using Core.Entities;

namespace Service.Validations
{
    public class ChatGroupValidator : AbstractValidator<ChatGroup>
    {
        public ChatGroupValidator()
        {
            RuleFor(x => x.GroupName)
                .NotEmpty().WithMessage("Grup adı zorunludur.")
                .MaximumLength(200).WithMessage("Grup adı en fazla 200 karakter olabilir.")
                .MinimumLength(2).WithMessage("Grup adı en az 2 karakter olmalıdır.");

            RuleFor(x => x.TripId)
                .NotEmpty().WithMessage("Tur ID zorunludur.");

            RuleFor(x => x.Avatar)
                .MaximumLength(500).WithMessage("Avatar URL'si en fazla 500 karakter olabilir.");

            RuleFor(x => x.LastMessage)
                .MaximumLength(1000).WithMessage("Son mesaj en fazla 1000 karakter olabilir.");
        }
    }
}
