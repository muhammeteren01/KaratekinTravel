namespace Core.DTOs.TripItenarary;

public class TripItinararyDto
{
    public int Day { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? DateLabel { get; set; }
    public int? HotelIndex { get; set; }
    public string? Note { get; set; }
    public List<ItineraryActivityDto> Activities { get; set; } = new();
}