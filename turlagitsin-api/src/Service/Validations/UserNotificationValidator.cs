using FluentValidation;
using Core.Entities;

namespace Service.Validations
{
    public class UserNotificationValidator : AbstractValidator<UserNotification>
    {
        public UserNotificationValidator()
        {
            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("Kullanıcı ID zorunludur.");

            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Başlık zorunludur.")
                .MaximumLength(200).WithMessage("Başlık en fazla 200 karakter olabilir.");

            RuleFor(x => x.Message)
                .NotEmpty().WithMessage("Mesaj zorunludur.")
                .MaximumLength(1000).WithMessage("Mesaj en fazla 1000 karakter olabilir.");

            RuleFor(x => x.Type)
                .NotEmpty().WithMessage("Tip zorunludur.")
                .MaximumLength(50).WithMessage("Tip en fazla 50 karakter olabilir.");

            RuleFor(x => x.ActionUrl)
                .MaximumLength(500).WithMessage("Aksiyon URL'si en fazla 500 karakter olabilir.");

            RuleFor(x => x.ActionLabel)
                .MaximumLength(100).WithMessage("Aksiyon etiketi en fazla 100 karakter olabilir.");
        }
    }
}
