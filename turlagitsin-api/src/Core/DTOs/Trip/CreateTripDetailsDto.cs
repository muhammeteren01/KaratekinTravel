namespace Core.DTOs.Trip;

public class CreateTripDetailsDto
{
    public Guid TripId { get; set; }
    public List<string> Included { get; set; } = new();
    public List<string> Excluded { get; set; } = new();
    public string? SpecialNote { get; set; }
}