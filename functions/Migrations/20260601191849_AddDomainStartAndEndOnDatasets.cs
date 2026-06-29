using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace everything_timeline.Migrations
{
    /// <inheritdoc />
    public partial class AddDomainStartAndEndOnDatasets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DomainEnd",
                schema: "dbo",
                table: "Datasets",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DomainStart",
                schema: "dbo",
                table: "Datasets",
                type: "int",
                nullable: false,
                defaultValue: -3200);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DomainEnd",
                schema: "dbo",
                table: "Datasets");

            migrationBuilder.DropColumn(
                name: "DomainStart",
                schema: "dbo",
                table: "Datasets");
        }
    }
}
