using Core.Entities;
using FluentAssertions;
using Service.Validations;

namespace Api.UnitTests.Validations;

public class ReservationValidatorTests
{
    private readonly ReservationValidator _sut = new();

    private static Reservation Valid() => new()
    {
        UserId = Guid.NewGuid(),
        TripId = Guid.NewGuid(),
        CompanyId = Guid.NewGuid(),
        SeatNumbers = "[\"1A\",\"1B\"]",
        TotalAmount = 1500,
        Currency = "TRY",
        Status = "confirmed"
    };

    [Fact]
    public void Valid_reservation_passes() =>
        _sut.Validate(Valid()).IsValid.Should().BeTrue();

    [Fact]
    public void Empty_ids_fail()
    {
        var r = Valid();
        r.UserId = Guid.Empty;
        r.TripId = Guid.Empty;
        r.CompanyId = Guid.Empty;
        var result = _sut.Validate(r);
        result.IsValid.Should().BeFalse();
        result.Errors.Select(e => e.PropertyName).Should().Contain(new[]
        {
            nameof(Reservation.UserId),
            nameof(Reservation.TripId),
            nameof(Reservation.CompanyId)
        });
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-10)]
    [InlineData(1000001)]
    public void TotalAmount_out_of_range_fails(decimal amount)
    {
        var r = Valid();
        r.TotalAmount = amount;
        _sut.Validate(r).IsValid.Should().BeFalse();
    }

    [Fact]
    public void Empty_seats_currency_status_fail()
    {
        var r = Valid();
        r.SeatNumbers = "";
        r.Currency = "";
        r.Status = "";
        _sut.Validate(r).IsValid.Should().BeFalse();
    }
}
