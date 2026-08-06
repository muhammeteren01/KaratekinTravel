namespace Core.DTOs.CalendarTrip
{
    public class CalendarTripDto
    {
        public Guid Id { get; set; }
        public string Date { get; set; }
        public Guid? UserId { get; set; }
        public Guid? TripId { get; set; }
    }
}

