using FluentValidation;
using Core.Entities;

namespace Service.Validations
{
    public class ChatGroupMemberValidator : AbstractValidator<ChatGroupMember>
    {
        public ChatGroupMemberValidator()
        {
            RuleFor(x => x.GroupId)
                .NotEmpty().WithMessage("Grup ID zorunludur.");

            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("Kullanıcı ID zorunludur.");

            RuleFor(x => x.Role)
                .NotEmpty().WithMessage("Rol zorunludur.")
                .MaximumLength(50).WithMessage("Rol en fazla 50 karakter olabilir.");
        }
    }
}
