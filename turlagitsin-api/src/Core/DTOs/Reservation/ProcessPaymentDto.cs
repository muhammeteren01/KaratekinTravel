namespace Core.DTOs.Reservation
{
    public class ProcessPaymentDto
    {
        public Guid ReservationId { get; set; }
        public string PaymentMethod { get; set; }
        public string TransactionId { get; set; }
    }
}