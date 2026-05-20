using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace everything_timeline.Migrations
{
    /// <inheritdoc />
    public partial class AddDescriptionColumnOnDatasets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Value",
                schema: "dbo",
                table: "Datasets");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                schema: "dbo",
                table: "Datasets",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                schema: "dbo",
                table: "Datasets");

            migrationBuilder.AddColumn<int>(
                name: "Value",
                schema: "dbo",
                table: "Datasets",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
