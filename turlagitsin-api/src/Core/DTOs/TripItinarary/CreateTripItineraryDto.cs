namespace Core.DTOs.TripItenarary;

public class CreateTripItineraryDto
{
    public Guid TripId { get; set; }
    public int Day { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? DateLabel { get; set; }
    public int? HotelIndex { get; set; }
    public string? Note { get; set; }
    public List<CreateActivityDto> Activities { get; set; } = new();
}