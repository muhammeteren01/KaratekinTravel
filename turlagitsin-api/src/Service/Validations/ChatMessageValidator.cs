using FluentValidation;
using Core.Entities;

namespace Service.Validations
{
    public class ChatMessageValidator : AbstractValidator<ChatMessage>
    {
        public ChatMessageValidator()
        {
            RuleFor(x => x.GroupId)
                .NotEmpty().WithMessage("Grup ID zorunludur.");

            RuleFor(x => x.SenderId)
                .NotEmpty().WithMessage("Gönderen ID zorunludur.");

            RuleFor(x => x.Text)
                .NotEmpty().WithMessage("Mesaj metni zorunludur.")
                .MaximumLength(2000).WithMessage("Mesaj metni en fazla 2000 karakter olabilir.")
                .MinimumLength(1).WithMessage("Mesaj metni en az 1 karakter olmalıdır.");

            RuleFor(x => x.AttachmentUrl)
                .MaximumLength(500).WithMessage("Ek URL'si en fazla 500 karakter olabilir.");
        }
    }
}
