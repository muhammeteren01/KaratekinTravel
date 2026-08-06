using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Repository;

#nullable disable

namespace Repository.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260806130000_ExpandTripDescriptionToText")]
    public partial class ExpandTripDescriptionToText : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
ALTER TABLE public.trips ALTER COLUMN ""Description"" TYPE text USING ""Description""::text;
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // no-op: shrinking text back to varchar(2000) can truncate data
        }
    }
}
