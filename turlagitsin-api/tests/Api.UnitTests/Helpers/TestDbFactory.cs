using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Repository;
using Repository.Repository;
using Repository.UnitOfWork;
using Service.Service;

namespace Api.UnitTests.Helpers;

public sealed class TestDb : IDisposable
{
    public AppDbContext Context { get; }
    public UnitOfWork UnitOfWork { get; }

    private TestDb(AppDbContext context)
    {
        Context = context;
        UnitOfWork = new UnitOfWork(context);
    }

    public static TestDb Create()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        var context = new AppDbContext(options);
        context.Database.EnsureCreated();
        return new TestDb(context);
    }

    public Company SeedCompany(string name = "Test Acenta")
    {
        var company = new Company { Name = name };
        Context.Companies.Add(company);
        Context.SaveChanges();
        return company;
    }

    public TripService CreateTripService() =>
        new(new GenericRepository<Trip>(Context), UnitOfWork);

    public CouponService CreateCouponService() =>
        new(new GenericRepository<Coupon>(Context), UnitOfWork);

    public VehicleService CreateVehicleService() =>
        new(new GenericRepository<Vehicle>(Context), UnitOfWork, new SeatLayoutRepository(Context));

    public void Dispose() => Context.Dispose();
}
