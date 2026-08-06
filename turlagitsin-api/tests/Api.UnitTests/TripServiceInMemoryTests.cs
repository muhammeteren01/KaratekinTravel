using Api.UnitTests.Helpers;
using Core.DTOs.Trip;
using Core.DTOs.TripSeatch;
using FluentAssertions;

namespace Api.UnitTests;

public class TripServiceInMemoryTests
{
    [Fact]
    public async Task Create_Get_Update_Delete_lifecycle()
    {
        using var db = TestDb.Create();
        var company = db.SeedCompany();
        var sut = db.CreateTripService();

        var created = await sut.CreateTripAsync(new CreateTripDto
        {
            CompanyId = company.Id,
            Title = "Kapadokya Balon",
            Capacity = 25,
            City = "Nevşehir",
            Location = "Göreme",
            Region = "İç Anadolu",
            Description = "Balon turu",
            IsFeatured = true
        });

        created.Id.Should().NotBeNullOrWhiteSpace();
        created.Title.Should().Be("Kapadokya Balon");
        created.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(10));
        created.IsPublished.Should().BeTrue();
        created.IsFeatured.Should().BeTrue();

        var byId = await sut.GetTripByIdAsync(Guid.Parse(created.Id));
        byId.Should().NotBeNull();
        byId!.City.Should().Be("Nevşehir");

        var updated = await sut.UpdateTripAsync(Guid.Parse(created.Id), new UpdateTripDto
        {
            Title = "Kapadokya Güncellendi",
            Capacity = 30,
            IsFeatured = false
        });

        updated.Should().NotBeNull();
        updated!.Title.Should().Be("Kapadokya Güncellendi");
        updated.Capacity.Should().Be(30);
        updated.IsFeatured.Should().BeFalse();
        updated.UpdatedAt.Should().NotBeNull();

        var deleted = await sut.DeleteTripAsync(Guid.Parse(created.Id));
        deleted.Should().BeTrue();

        var afterDelete = await sut.GetTripByIdAsync(Guid.Parse(created.Id));
        afterDelete.Should().BeNull();
    }

    [Fact]
    public async Task Update_returns_null_when_missing()
    {
        using var db = TestDb.Create();
        var sut = db.CreateTripService();

        var result = await sut.UpdateTripAsync(Guid.NewGuid(), new UpdateTripDto { Title = "Yok" });
        result.Should().BeNull();
    }

    [Fact]
    public async Task Delete_returns_false_when_missing()
    {
        using var db = TestDb.Create();
        var sut = db.CreateTripService();

        (await sut.DeleteTripAsync(Guid.NewGuid())).Should().BeFalse();
    }

    [Fact]
    public async Task Search_filters_published_city_and_term()
    {
        using var db = TestDb.Create();
        var company = db.SeedCompany();
        var sut = db.CreateTripService();

        await sut.CreateTripAsync(new CreateTripDto
        {
            CompanyId = company.Id,
            Title = "Antalya Yaz Turu",
            Capacity = 40,
            City = "Antalya",
            Description = "Plaj ve tarih"
        });

        await sut.CreateTripAsync(new CreateTripDto
        {
            CompanyId = company.Id,
            Title = "Bursa Termal",
            Capacity = 20,
            City = "Bursa",
            Description = "Termal oteller"
        });

        var search = await sut.SearchTripsAsync(new TripSearchDto
        {
            SearchTerm = "Antalya",
            City = "Antalya",
            Page = 1,
            PageSize = 10
        });

        search.TotalCount.Should().Be(1);
        search.Items.Should().ContainSingle(t => t.Title.Contains("Antalya"));
        search.Page.Should().Be(1);
        search.PageSize.Should().Be(10);
    }

    [Fact]
    public async Task Search_clamps_page_and_pageSize()
    {
        using var db = TestDb.Create();
        var company = db.SeedCompany();
        var sut = db.CreateTripService();

        await sut.CreateTripAsync(new CreateTripDto
        {
            CompanyId = company.Id,
            Title = "Test Turu XX",
            Capacity = 10,
            City = "Ankara"
        });

        var search = await sut.SearchTripsAsync(new TripSearchDto
        {
            Page = 0,
            PageSize = 500
        });

        search.Page.Should().Be(1);
        search.PageSize.Should().Be(100);
    }

    [Fact]
    public async Task GetAllTrips_returns_created_trips()
    {
        using var db = TestDb.Create();
        var company = db.SeedCompany();
        var sut = db.CreateTripService();

        await sut.CreateTripAsync(new CreateTripDto
        {
            CompanyId = company.Id,
            Title = "Liste Turu 1",
            Capacity = 15
        });

        var all = await sut.GetAllTripsAsync();
        all.Should().Contain(t => t.Title == "Liste Turu 1");
    }
}
