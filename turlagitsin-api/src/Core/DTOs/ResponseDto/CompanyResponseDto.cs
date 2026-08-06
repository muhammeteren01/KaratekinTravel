namespace Core.DTOs.ResponseDto
{
    public class CompanyResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Logo { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Website { get; set; } = string.Empty;
        public double Rating { get; set; }
        public int ReviewCount { get; set; }
        public string About { get; set; } = string.Empty;
        public string FullAbout { get; set; } = string.Empty;
        public string TripsLabel { get; set; } = string.Empty;
        public string ParticipantsLabel { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
    }
}
