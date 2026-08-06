using Core.Entities;
using FluentAssertions;

namespace Api.UnitTests;

public class BaseEntityTests
{
    [Fact]
    public void NewTrip_HasCreatedAtAndIdByDefault()
    {
        var before = DateTime.UtcNow.AddSeconds(-5);
        var trip = new Trip
        {
            CompanyId = Guid.NewGuid(),
            Title = "Test"
        };
        var after = DateTime.UtcNow.AddSeconds(5);

        trip.Id.Should().NotBe(Guid.Empty);
        trip.CreatedAt.Should().BeOnOrAfter(before).And.BeOnOrBefore(after);
        trip.IsDeleted.Should().BeFalse();
    }
}
