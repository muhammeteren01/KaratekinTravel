using Api.UnitTests.Helpers;
using Core.DTOs.Coupon;
using FluentAssertions;

namespace Api.UnitTests;

public class CouponServiceTests
{
    [Fact]
    public async Task Create_normalizes_code_and_rejects_duplicates()
    {
        using var db = TestDb.Create();
        var sut = db.CreateCouponService();
        var companyId = db.SeedCompany().Id;

        var created = await sut.CreateAsync(new CreateCouponDto
        {
            Code = " yaz25 ",
            CompanyId = companyId,
            Type = "percent",
            Value = 25,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(30),
            MaxUsage = 100,
            IsActive = true
        });

        created.Code.Should().Be("YAZ25");
        created.UsedCount.Should().Be(0);

        var act = () => sut.CreateAsync(new CreateCouponDto
        {
            Code = "YAZ25",
            Type = "percent",
            Value = 10,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(1)
        });

        await act.Should().ThrowAsync<Exception>().WithMessage("*already exists*");
    }

    [Fact]
    public async Task Validate_rejects_empty_missing_inactive_expired_and_overused()
    {
        using var db = TestDb.Create();
        var sut = db.CreateCouponService();

        (await sut.ValidateAsync("")).IsValid.Should().BeFalse();
        (await sut.ValidateAsync("YOK")).Message.Should().Contain("not found");

        var coupon = await sut.CreateAsync(new CreateCouponDto
        {
            Code = "AKTIF",
            Type = "amount",
            Value = 100,
            StartDate = DateTime.UtcNow.AddDays(-2),
            EndDate = DateTime.UtcNow.AddDays(10),
            MaxUsage = 1,
            IsActive = true
        });

        var ok = await sut.ValidateAsync("aktif");
        ok.IsValid.Should().BeTrue();
        ok.Value.Should().Be(100);

        await sut.UpdateAsync(coupon.Id, new UpdateCouponDto { IsActive = false });
        (await sut.ValidateAsync("AKTIF")).Message.Should().Contain("inactive");

        await sut.UpdateAsync(coupon.Id, new UpdateCouponDto
        {
            IsActive = true,
            StartDate = DateTime.UtcNow.AddDays(5),
            EndDate = DateTime.UtcNow.AddDays(10)
        });
        (await sut.ValidateAsync("AKTIF")).Message.Should().Contain("valid date range");

        await sut.UpdateAsync(coupon.Id, new UpdateCouponDto
        {
            StartDate = DateTime.UtcNow.AddDays(-5),
            EndDate = DateTime.UtcNow.AddDays(5),
            MaxUsage = 1
        });

        var entity = db.Context.Coupons.First(c => c.Id == coupon.Id);
        entity.UsedCount = 1;
        await db.Context.SaveChangesAsync();

        (await sut.ValidateAsync("AKTIF")).Message.Should().Contain("usage limit");
    }

    [Fact]
    public async Task Update_and_soft_delete_work()
    {
        using var db = TestDb.Create();
        var sut = db.CreateCouponService();

        var created = await sut.CreateAsync(new CreateCouponDto
        {
            Code = "SIL",
            Type = "percent",
            Value = 15,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(7)
        });

        var updated = await sut.UpdateAsync(created.Id, new UpdateCouponDto
        {
            Code = "sil2",
            Value = 20
        });

        updated!.Code.Should().Be("SIL2");
        updated.Value.Should().Be(20);

        (await sut.DeleteAsync(created.Id)).Should().BeTrue();
        (await sut.GetByIdAsync(created.Id)).Should().BeNull();
        (await sut.DeleteAsync(Guid.NewGuid())).Should().BeFalse();
    }
}
