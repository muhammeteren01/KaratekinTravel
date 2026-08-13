using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Repository;

#nullable disable

namespace Repository.Migrations
{
    /// <summary>
    /// Profil fotoğrafı base64 veri URL'i olarak saklanıyor; 500 karakterlik
    /// kolon buna yetmiyordu. Panelin "Fotoğraf Yükle" düğmesi bu yüzden
    /// devre dışı bırakılmıştı.
    /// </summary>
    [DbContext(typeof(AppDbContext))]
    [Migration("20260813140000_ExpandUserAvatarToText")]
    public partial class ExpandUserAvatarToText : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
ALTER TABLE public.users ALTER COLUMN ""Avatar"" TYPE text USING ""Avatar""::text;
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // no-op: text'ten varchar'a küçültmek veri kesebilir
        }
    }
}
