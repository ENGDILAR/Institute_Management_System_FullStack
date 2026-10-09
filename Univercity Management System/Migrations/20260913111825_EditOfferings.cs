using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lpgin2.Migrations
{
    /// <inheritdoc />
    public partial class EditOfferings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "OfferName",
                table: "courseOfferings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OfferName",
                table: "courseOfferings");
        }
    }
}
