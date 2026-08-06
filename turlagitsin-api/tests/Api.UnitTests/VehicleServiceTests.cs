using Api.UnitTests.Helpers;
using Core.DTOs.Vehicle;
using FluentAssertions;

namespace Api.UnitTests;

public class VehicleServiceTests
{
    [Fact]
    public async Task Create_Get_Update_Delete_lifecycle()
    {
        using var db = TestDb.Create();
        var company = db.SeedCompany();
        var sut = db.CreateVehicleService();

        var created = await sut.CreateAsync(new CreateVehicleDto
        {
            CompanyId = company.Id,
            Plate = "06 ABC 123",
            Model = "Travego",
            BusType = "2+1",
            Capacity = 46,
            HasWifi = true,
            HasAirCondition = true,
            Status = "active"
        });

        created.Plate.Should().Be("06 ABC 123");
        created.Capacity.Should().Be(46);

        var byCompany = await sut.GetByCompanyIdAsync(company.Id);
        byCompany.Should().ContainSingle(v => v.Id == created.Id);

        var updated = await sut.UpdateAsync(created.Id, new UpdateVehicleDto
        {
            Plate = "06 XYZ 999",
            Capacity = 50,
            Status = "maintenance"
        });

        updated!.Plate.Should().Be("06 XYZ 999");
        updated.Capacity.Should().Be(50);
        updated.Status.Should().Be("maintenance");

        (await sut.DeleteAsync(created.Id)).Should().BeTrue();
        (await sut.GetByIdAsync(created.Id)).Should().BeNull();
        (await sut.UpdateAsync(Guid.NewGuid(), new UpdateVehicleDto { Plate = "X" })).Should().BeNull();
    }

    [Fact]
    public async Task CreateLayout_and_list_by_company()
    {
        using var db = TestDb.Create();
        var company = db.SeedCompany();
        var sut = db.CreateVehicleService();

        var layout = await sut.CreateLayoutAsync(new CreateSeatLayoutDto
        {
            CompanyId = company.Id,
            Name = "Standart 2+1",
            Rows = 12,
            SeatsLeft = 2,
            SeatsRight = 1,
            TotalSeats = 36,
            SeatMapJson = "[]"
        });

        layout.Name.Should().Be("Standart 2+1");
        layout.TotalSeats.Should().Be(36);

        var layouts = await sut.GetLayoutsByCompanyAsync(company.Id);
        layouts.Should().ContainSingle(l => l.Id == layout.Id);
    }
}
