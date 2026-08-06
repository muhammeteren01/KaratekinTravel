namespace Core.DTOs.Company
{
    public class CompanyDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Logo { get; set; }
        public decimal Rating { get; set; }
        public int ReviewCount { get; set; }
        public string? Location { get; set; }
        public string? About { get; set; }
        public string? FullAbout { get; set; }
        public string? TripsLabel { get; set; }
        public string? ParticipantsLabel { get; set; }
        public bool IsActive { get; set; }
        public bool IsVerified { get; set; }
    }
}