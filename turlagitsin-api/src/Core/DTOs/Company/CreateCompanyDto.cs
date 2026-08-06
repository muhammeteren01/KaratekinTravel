using System.ComponentModel.DataAnnotations;

namespace Core.DTOs.Company
{
    public class CreateCompanyDto
    {
        public string Name { get; set; }
        public string? Logo { get; set; }
        public string? Location { get; set; }
        public string? About { get; set; }
        public string? FullAbout { get; set; }
    }
}