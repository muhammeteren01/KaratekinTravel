namespace Core.DTOs.VehicleOperation;

public class VehicleOperationDto
{
    public Guid Id { get; set; }
    public Guid VehicleId { get; set; }
    public string Plate { get; set; } = string.Empty;
    public string OperationType { get; set; } = string.Empty;
    public string? DriverName { get; set; }
    public DateTime OccurredAt { get; set; }
    public decimal? Cost { get; set; }
    public string Currency { get; set; } = "TRY";
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateVehicleOperationDto
{
    public Guid VehicleId { get; set; }
    public string OperationType { get; set; } = string.Empty;
    public string? DriverName { get; set; }
    public DateTime? OccurredAt { get; set; }
    public decimal? Cost { get; set; }
    public string? Currency { get; set; }
    public string? Notes { get; set; }
}

public class UpdateVehicleOperationDto
{
    public string? OperationType { get; set; }
    public string? DriverName { get; set; }
    public DateTime? OccurredAt { get; set; }
    public decimal? Cost { get; set; }
    public string? Currency { get; set; }
    public string? Notes { get; set; }
}
