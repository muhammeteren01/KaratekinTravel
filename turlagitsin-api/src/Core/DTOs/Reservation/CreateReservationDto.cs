namespace Core.DTOs.Reservation
{
    public class CreateReservationDto
    {
        public Guid TripId { get; set; }
        public Guid? DepartureId { get; set; }
        public List<int> SeatNumbers { get; set; } = new();
        public string? Notes { get; set; }
        public string? CouponCode { get; set; }
    }
}