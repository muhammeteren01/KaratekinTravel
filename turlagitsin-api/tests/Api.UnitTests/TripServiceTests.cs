using Core.DTOs.Trip;
using Core.Entities;
using Core.Repositories;
using Core.UnitOfWork;
using FluentAssertions;
using Moq;
using Service.Service;

namespace Api.UnitTests;

public class TripServiceTests
{
    private static TripService CreateSut(
        Mock<IGenericRepository<Trip>>? repository = null,
        Mock<IUnitOfWork>? unitOfWork = null,
        Action<Trip>? onAdd = null)
    {
        repository ??= new Mock<IGenericRepository<Trip>>();
        unitOfWork ??= new Mock<IUnitOfWork>();

        repository
            .Setup(r => r.AddAsync(It.IsAny<Trip>()))
            .Returns<Trip>(trip =>
            {
                onAdd?.Invoke(trip);
                return Task.CompletedTask;
            });

        unitOfWork
            .Setup(u => u.SaveChangesAsync())
            .Returns(Task.CompletedTask);

        return new TripService(repository.Object, unitOfWork.Object);
    }

    [Fact]
    public async Task CreateTripAsync_PersistsEntity_AndReturnsCreatedAt()
    {
        Trip? saved = null;
        var sut = CreateSut(onAdd: trip => saved = trip);
        var companyId = Guid.NewGuid();
        var before = DateTime.UtcNow.AddMinutes(-1);

        var result = await sut.CreateTripAsync(new CreateTripDto
        {
            CompanyId = companyId,
            Title = "Karadeniz Turu",
            Capacity = 50,
            Description = "Test açıklama",
            IsFeatured = false
        });

        var after = DateTime.UtcNow.AddMinutes(1);

        saved.Should().NotBeNull();
        saved!.Title.Should().Be("Karadeniz Turu");
        saved.CompanyId.Should().Be(companyId);
        saved.Capacity.Should().Be(50);
        saved.IsPublished.Should().BeTrue();
        saved.CreatedAt.Should().BeOnOrAfter(before).And.BeOnOrBefore(after);

        result.Title.Should().Be("Karadeniz Turu");
        result.CreatedAt.Should().Be(saved.CreatedAt);
        result.IsPublished.Should().BeTrue();
        result.IsDeleted.Should().BeFalse();
        result.Capacity.Should().Be(50);
    }

    [Fact]
    public async Task CreateTripAsync_MapsOptionalFields()
    {
        var sut = CreateSut();

        var result = await sut.CreateTripAsync(new CreateTripDto
        {
            CompanyId = Guid.NewGuid(),
            Title = "Kapadokya",
            Capacity = 20,
            Location = "Nevşehir",
            City = "Göreme",
            Region = "İç Anadolu",
            Description = "Balon turu",
            Image = "https://cdn.example.com/cover.jpg",
            HeaderImage = "https://cdn.example.com/header.jpg",
            IsFeatured = true
        });

        result.Location.Should().Be("Nevşehir");
        result.City.Should().Be("Göreme");
        result.Region.Should().Be("İç Anadolu");
        result.Description.Should().Be("Balon turu");
        result.Image.Should().Be("https://cdn.example.com/cover.jpg");
        result.HeaderImage.Should().Be("https://cdn.example.com/header.jpg");
        result.IsFeatured.Should().BeTrue();
    }
}
