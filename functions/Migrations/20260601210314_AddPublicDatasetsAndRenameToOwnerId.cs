using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace everything_timeline.Migrations
{
    /// <inheritdoc />
    public partial class AddPublicDatasetsAndRenameToOwnerId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UserId",
                schema: "dbo",
                table: "Datasets",
                newName: "OwnerId");

            migrationBuilder.AddColumn<bool>(
                name: "IsPublic",
                schema: "dbo",
                table: "Datasets",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPublic",
                schema: "dbo",
                table: "Datasets");

            migrationBuilder.RenameColumn(
                name: "OwnerId",
                schema: "dbo",
                table: "Datasets",
                newName: "UserId");
        }
    }
}
