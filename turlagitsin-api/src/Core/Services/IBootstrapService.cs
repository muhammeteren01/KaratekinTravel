using Core.DTOs.ResponseDto;

namespace Core.Services
{
    public interface IBootstrapService
    {
        Task<BootstrapResponseDto> GetBootstrapDataAsync();
    }
}
