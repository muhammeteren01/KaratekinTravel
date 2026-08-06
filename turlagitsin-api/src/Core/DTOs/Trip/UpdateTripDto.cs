namespace Core.DTOs.Trip;

public class UpdateTripDto
{
    public string? Title { get; set; }
    public string? Location { get; set; }
    public string? City { get; set; }
    public string? Region { get; set; }
    public DateTime? DateStart { get; set; }
    public DateTime? DateEnd { get; set; }
    public int? Capacity { get; set; }
    public string? Image { get; set; }
    public string? Description { get; set; }
    public bool? IsFeatured { get; set; }
}