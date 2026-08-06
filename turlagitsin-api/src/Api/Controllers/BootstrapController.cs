using Microsoft.AspNetCore.Mvc;
using Core.Services;
using Core.DTOs.ResponseDto;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BootstrapController : ControllerBase
    {
        private readonly IBootstrapService _bootstrapService;

        public BootstrapController(IBootstrapService bootstrapService)
        {
            _bootstrapService = bootstrapService;
        }

        [HttpGet]
        public async Task<ActionResult<BootstrapResponseDto>> GetBootstrapData()
        {
            var data = await _bootstrapService.GetBootstrapDataAsync();
            return Ok(data);
        }
    }
}
