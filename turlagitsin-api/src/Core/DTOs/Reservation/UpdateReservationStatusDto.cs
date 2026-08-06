namespace Core.DTOs.Reservation
{
    public class UpdateReservationStatusDto
    {
        public string Status { get; set; }  // confirmed, cancelled, completed
        public string? Reason { get; set; }
    }
}