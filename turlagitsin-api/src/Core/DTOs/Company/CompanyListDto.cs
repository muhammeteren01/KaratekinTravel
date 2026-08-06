namespace Core.DTOs.Company
{
    public class CompanyListDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Logo { get; set; }
        public decimal Rating { get; set; }
        public int ReviewCount { get; set; }
        public string? Location { get; set; }
    }
}