using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Repository;

#nullable disable

namespace Repository.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260806120000_ExpandImageColumnsToText")]
    public partial class ExpandImageColumnsToText : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
ALTER TABLE public.trips ALTER COLUMN ""Image"" TYPE text USING ""Image""::text;
ALTER TABLE public.trips ALTER COLUMN ""HeaderImage"" TYPE text USING ""HeaderImage""::text;
ALTER TABLE public.trip_galleries ALTER COLUMN ""ImageUrl"" TYPE text USING ""ImageUrl""::text;
ALTER TABLE public.vehicles ALTER COLUMN ""CoverImage"" TYPE text USING ""CoverImage""::text;
ALTER TABLE public.hotels ALTER COLUMN ""Image"" TYPE text USING ""Image""::text;
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // no-op: shrinking text back to varchar can truncate data
        }
    }
}
