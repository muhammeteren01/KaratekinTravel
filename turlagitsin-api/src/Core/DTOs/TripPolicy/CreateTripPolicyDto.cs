namespace Core.DTOs.Trip;

public class CreateTripPolicyDto
{
    public Guid TripId { get; set; }
    public string? Title { get; set; }
    public List<string> Paragraphs { get; set; } = new();
}