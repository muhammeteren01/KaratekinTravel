namespace Core.DTOs.Trip;

public class TripPolicyDto
{
    public string? Title { get; set; }
    public List<string> Paragraphs { get; set; } = new();
}