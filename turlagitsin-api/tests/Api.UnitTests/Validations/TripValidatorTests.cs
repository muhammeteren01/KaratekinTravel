using Core.Entities;
using FluentAssertions;
using Service.Validations;

namespace Api.UnitTests.Validations;

public class TripValidatorTests
{
    private readonly TripValidator _sut = new();

    private static Trip ValidTrip() => new()
    {
        CompanyId = Guid.NewGuid(),
        Title = "Karadeniz Turu",
        Capacity = 40,
        JoinedCount = 0,
        Rating = 4.5m,
        Location = "Trabzon",
        City = "Trabzon",
        Region = "Karadeniz",
        Description = "Güzel bir tur"
    };

    [Fact]
    public void Valid_trip_passes()
    {
        _sut.Validate(ValidTrip()).IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("")]
    [InlineData("abc")]
    public void Title_too_short_fails(string title)
    {
        var trip = ValidTrip();
        trip.Title = title;
        var result = _sut.Validate(trip);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(Trip.Title));
    }

    [Fact]
    public void Title_over_300_chars_fails()
    {
        var trip = ValidTrip();
        trip.Title = new string('a', 301);
        _sut.Validate(trip).IsValid.Should().BeFalse();
    }

    [Fact]
    public void Empty_CompanyId_fails()
    {
        var trip = ValidTrip();
        trip.CompanyId = Guid.Empty;
        _sut.Validate(trip).IsValid.Should().BeFalse();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(1001)]
    public void Capacity_out_of_range_fails(int capacity)
    {
        var trip = ValidTrip();
        trip.Capacity = capacity;
        _sut.Validate(trip).IsValid.Should().BeFalse();
    }

    [Fact]
    public void Negative_JoinedCount_fails()
    {
        var trip = ValidTrip();
        trip.JoinedCount = -1;
        _sut.Validate(trip).IsValid.Should().BeFalse();
    }

    [Theory]
    [InlineData(-0.1)]
    [InlineData(5.1)]
    public void Rating_out_of_range_fails(double rating)
    {
        var trip = ValidTrip();
        trip.Rating = (decimal)rating;
        _sut.Validate(trip).IsValid.Should().BeFalse();
    }

    [Fact]
    public void Description_over_2000_fails()
    {
        var trip = ValidTrip();
        trip.Description = new string('x', 2001);
        _sut.Validate(trip).IsValid.Should().BeFalse();
    }
}
