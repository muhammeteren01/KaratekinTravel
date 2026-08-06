namespace Core.DTOs.CalendarTrip
{
    public class CreateCalendarTripDto
    {
        public DateTime Date { get; set; }
        public Guid? UserId { get; set; }
        public Guid? TripId { get; set; }
    }
}

