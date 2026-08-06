namespace Core.DTOs.Company
{
    public class UpdateCompanyDto
    {
        public string? Name { get; set; }
        public string? Logo { get; set; }
        public string? Location { get; set; }
        public string? About { get; set; }
        public string? FullAbout { get; set; }
    }
}