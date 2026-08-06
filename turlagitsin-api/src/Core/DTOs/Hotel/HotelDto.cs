namespace Core.DTOs.Hotel
{
    public class HotelDto
    {
        public Guid Id { get; set; }
        public Guid? CompanyId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Website { get; set; }
        public string? City { get; set; }
        public string? District { get; set; }
        public string? Address { get; set; }
        public string? Category { get; set; }
        public string? Image { get; set; }
        public string? DetailsJson { get; set; }
        public bool IsDraft { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
