using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FamilyTreeAPI.Migrations
{
    /// <inheritdoc />
    public partial class ProductionSync : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "City",
                columns: table => new
                {
                    CityID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CountryName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_City", x => x.CityID);
                });

            migrationBuilder.CreateTable(
                name: "polls",
                columns: table => new
                {
                    pollid = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    familyid = table.Column<int>(type: "integer", nullable: false),
                    creatorid = table.Column<int>(type: "integer", nullable: false),
                    question = table.Column<string>(type: "text", nullable: false),
                    polltype = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    startdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    enddate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    isactive = table.Column<bool>(type: "boolean", nullable: false),
                    createdat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updatedat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    visibility_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    target_audience = table.Column<string>(type: "jsonb", nullable: true),
                    description_visibility = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_polls", x => x.pollid);
                });

            migrationBuilder.CreateTable(
                name: "poll_participants",
                columns: table => new
                {
                    participant_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    pollid = table.Column<int>(type: "integer", nullable: false),
                    personid = table.Column<int>(type: "integer", nullable: false),
                    added_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_poll_participants", x => x.participant_id);
                    table.ForeignKey(
                        name: "FK_poll_participants_polls_pollid",
                        column: x => x.pollid,
                        principalTable: "polls",
                        principalColumn: "pollid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "polloptions",
                columns: table => new
                {
                    optionid = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    pollid = table.Column<int>(type: "integer", nullable: false),
                    optiontext = table.Column<string>(type: "text", nullable: false),
                    optionorder = table.Column<int>(type: "integer", nullable: false),
                    createdat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_polloptions", x => x.optionid);
                    table.ForeignKey(
                        name: "FK_polloptions_polls_pollid",
                        column: x => x.pollid,
                        principalTable: "polls",
                        principalColumn: "pollid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "pollvotes",
                columns: table => new
                {
                    voteid = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    pollid = table.Column<int>(type: "integer", nullable: false),
                    optionid = table.Column<int>(type: "integer", nullable: false),
                    voterid = table.Column<int>(type: "integer", nullable: false),
                    votedat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pollvotes", x => x.voteid);
                    table.ForeignKey(
                        name: "FK_pollvotes_polloptions_optionid",
                        column: x => x.optionid,
                        principalTable: "polloptions",
                        principalColumn: "optionid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_pollvotes_polls_pollid",
                        column: x => x.pollid,
                        principalTable: "polls",
                        principalColumn: "pollid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Album",
                columns: table => new
                {
                    AlbumID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FamilyID = table.Column<int>(type: "integer", nullable: false),
                    EventID = table.Column<int>(type: "integer", nullable: true),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CoverPhotoUrl = table.Column<string>(type: "text", nullable: true),
                    Visibility = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Album", x => x.AlbumID);
                });

            migrationBuilder.CreateTable(
                name: "AlbumComment",
                columns: table => new
                {
                    CommentID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AlbumID = table.Column<int>(type: "integer", nullable: false),
                    AuthorID = table.Column<int>(type: "integer", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlbumComment", x => x.CommentID);
                    table.ForeignKey(
                        name: "FK_AlbumComment_Album_AlbumID",
                        column: x => x.AlbumID,
                        principalTable: "Album",
                        principalColumn: "AlbumID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AlbumPermission",
                columns: table => new
                {
                    PermissionID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AlbumID = table.Column<int>(type: "integer", nullable: false),
                    UserID = table.Column<int>(type: "integer", nullable: true),
                    PersonID = table.Column<int>(type: "integer", nullable: true),
                    CanView = table.Column<bool>(type: "boolean", nullable: false),
                    CanComment = table.Column<bool>(type: "boolean", nullable: false),
                    CanAddPhotos = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlbumPermission", x => x.PermissionID);
                    table.ForeignKey(
                        name: "FK_AlbumPermission_Album_AlbumID",
                        column: x => x.AlbumID,
                        principalTable: "Album",
                        principalColumn: "AlbumID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Connexion",
                columns: table => new
                {
                    ConnexionID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Password = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    IDPerson = table.Column<int>(type: "integer", nullable: true),
                    FamilyID = table.Column<int>(type: "integer", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastLoginDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ProfileCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    PasswordResetCode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    PasswordResetExpiry = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Role = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    EmailVerified = table.Column<bool>(type: "boolean", nullable: false),
                    EmailVerificationCode = table.Column<string>(type: "character varying(6)", maxLength: 6, nullable: true),
                    EmailVerificationExpiry = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EmailVerificationSentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Connexion", x => x.ConnexionID);
                });

            migrationBuilder.CreateTable(
                name: "Photo",
                columns: table => new
                {
                    PhotoID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AlbumID = table.Column<int>(type: "integer", nullable: false),
                    Url = table.Column<string>(type: "text", nullable: false),
                    ThumbnailUrl = table.Column<string>(type: "text", nullable: true),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    DateTaken = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Location = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    UploadedBy = table.Column<int>(type: "integer", nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: true),
                    Width = table.Column<int>(type: "integer", nullable: true),
                    Height = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Photo", x => x.PhotoID);
                    table.ForeignKey(
                        name: "FK_Photo_Album_AlbumID",
                        column: x => x.AlbumID,
                        principalTable: "Album",
                        principalColumn: "AlbumID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Photo_Connexion_UploadedBy",
                        column: x => x.UploadedBy,
                        principalTable: "Connexion",
                        principalColumn: "ConnexionID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PhotoLike",
                columns: table => new
                {
                    LikeID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PhotoID = table.Column<int>(type: "integer", nullable: false),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhotoLike", x => x.LikeID);
                    table.ForeignKey(
                        name: "FK_PhotoLike_Connexion_UserID",
                        column: x => x.UserID,
                        principalTable: "Connexion",
                        principalColumn: "ConnexionID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PhotoLike_Photo_PhotoID",
                        column: x => x.PhotoID,
                        principalTable: "Photo",
                        principalColumn: "PhotoID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Event",
                columns: table => new
                {
                    EventID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FamilyID = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EventType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Location = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Visibility = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    IsRecurring = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Event", x => x.EventID);
                    table.ForeignKey(
                        name: "FK_Event_Connexion_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Connexion",
                        principalColumn: "ConnexionID");
                });

            migrationBuilder.CreateTable(
                name: "EventPhoto",
                columns: table => new
                {
                    EventPhotoID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EventID = table.Column<int>(type: "integer", nullable: false),
                    PhotoUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Caption = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UploadedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventPhoto", x => x.EventPhotoID);
                    table.ForeignKey(
                        name: "FK_EventPhoto_Connexion_UploadedBy",
                        column: x => x.UploadedBy,
                        principalTable: "Connexion",
                        principalColumn: "ConnexionID");
                    table.ForeignKey(
                        name: "FK_EventPhoto_Event_EventID",
                        column: x => x.EventID,
                        principalTable: "Event",
                        principalColumn: "EventID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EventParticipant",
                columns: table => new
                {
                    EventParticipantID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EventID = table.Column<int>(type: "integer", nullable: false),
                    PersonID = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    RespondedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventParticipant", x => x.EventParticipantID);
                    table.ForeignKey(
                        name: "FK_EventParticipant_Event_EventID",
                        column: x => x.EventID,
                        principalTable: "Event",
                        principalColumn: "EventID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Family",
                columns: table => new
                {
                    FamilyID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FamilyName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    InviteCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Family", x => x.FamilyID);
                });

            migrationBuilder.CreateTable(
                name: "Person",
                columns: table => new
                {
                    PersonID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LastName = table.Column<string>(type: "text", maxLength: 2147483647, nullable: false),
                    FirstName = table.Column<string>(type: "text", maxLength: 2147483647, nullable: false),
                    Birthday = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Email = table.Column<string>(type: "text", maxLength: 2147483647, nullable: true),
                    Sex = table.Column<string>(type: "character varying(1)", maxLength: 1, nullable: false),
                    Activity = table.Column<string>(type: "text", maxLength: 2147483647, nullable: true),
                    Alive = table.Column<bool>(type: "boolean", nullable: false),
                    DeathDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PhotoUrl = table.Column<string>(type: "text", maxLength: 2147483647, nullable: true),
                    Notes = table.Column<string>(type: "text", maxLength: 2147483647, nullable: true),
                    PendingFatherName = table.Column<string>(type: "text", maxLength: 2147483647, nullable: true),
                    PendingMotherName = table.Column<string>(type: "text", maxLength: 2147483647, nullable: true),
                    Status = table.Column<string>(type: "text", maxLength: 2147483647, nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    CanLogin = table.Column<bool>(type: "boolean", nullable: false),
                    ParentLinkConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    FatherID = table.Column<int>(type: "integer", nullable: true),
                    MotherID = table.Column<int>(type: "integer", nullable: true),
                    CityID = table.Column<int>(type: "integer", nullable: false),
                    FamilyID = table.Column<int>(type: "integer", nullable: true),
                    PaternalFamilyID = table.Column<int>(type: "integer", nullable: true),
                    MaternalFamilyID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Person", x => x.PersonID);
                    table.ForeignKey(
                        name: "FK_Person_City_CityID",
                        column: x => x.CityID,
                        principalTable: "City",
                        principalColumn: "CityID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Person_Connexion_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Connexion",
                        principalColumn: "ConnexionID");
                    table.ForeignKey(
                        name: "FK_Person_Family_FamilyID",
                        column: x => x.FamilyID,
                        principalTable: "Family",
                        principalColumn: "FamilyID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Person_Family_MaternalFamilyID",
                        column: x => x.MaternalFamilyID,
                        principalTable: "Family",
                        principalColumn: "FamilyID");
                    table.ForeignKey(
                        name: "FK_Person_Family_PaternalFamilyID",
                        column: x => x.PaternalFamilyID,
                        principalTable: "Family",
                        principalColumn: "FamilyID");
                    table.ForeignKey(
                        name: "FK_Person_Person_FatherID",
                        column: x => x.FatherID,
                        principalTable: "Person",
                        principalColumn: "PersonID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Person_Person_MotherID",
                        column: x => x.MotherID,
                        principalTable: "Person",
                        principalColumn: "PersonID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FamilyRelation",
                columns: table => new
                {
                    RelationID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PersonID = table.Column<int>(type: "integer", nullable: false),
                    FamilyID = table.Column<int>(type: "integer", nullable: false),
                    RelationType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    StartDate = table.Column<DateTime>(type: "date", nullable: true),
                    EndDate = table.Column<DateTime>(type: "date", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FamilyRelation", x => x.RelationID);
                    table.ForeignKey(
                        name: "FK_FamilyRelation_Family_FamilyID",
                        column: x => x.FamilyID,
                        principalTable: "Family",
                        principalColumn: "FamilyID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FamilyRelation_Person_PersonID",
                        column: x => x.PersonID,
                        principalTable: "Person",
                        principalColumn: "PersonID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PhotoPerson",
                columns: table => new
                {
                    PhotoPersonID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PhotoID = table.Column<int>(type: "integer", nullable: false),
                    PersonID = table.Column<int>(type: "integer", nullable: false),
                    PositionX = table.Column<decimal>(type: "numeric", nullable: true),
                    PositionY = table.Column<decimal>(type: "numeric", nullable: true),
                    TaggedBy = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhotoPerson", x => x.PhotoPersonID);
                    table.ForeignKey(
                        name: "FK_PhotoPerson_Connexion_TaggedBy",
                        column: x => x.TaggedBy,
                        principalTable: "Connexion",
                        principalColumn: "ConnexionID");
                    table.ForeignKey(
                        name: "FK_PhotoPerson_Person_PersonID",
                        column: x => x.PersonID,
                        principalTable: "Person",
                        principalColumn: "PersonID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PhotoPerson_Photo_PhotoID",
                        column: x => x.PhotoID,
                        principalTable: "Photo",
                        principalColumn: "PhotoID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Wedding",
                columns: table => new
                {
                    WeddingID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ManID = table.Column<int>(type: "integer", nullable: false),
                    WomanID = table.Column<int>(type: "integer", nullable: false),
                    WeddingDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DivorceDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Location = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    PatrilinealFamilyID = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Wedding", x => x.WeddingID);
                    table.ForeignKey(
                        name: "FK_Wedding_Connexion_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Connexion",
                        principalColumn: "ConnexionID");
                    table.ForeignKey(
                        name: "FK_Wedding_Family_PatrilinealFamilyID",
                        column: x => x.PatrilinealFamilyID,
                        principalTable: "Family",
                        principalColumn: "FamilyID");
                    table.ForeignKey(
                        name: "FK_Wedding_Person_ManID",
                        column: x => x.ManID,
                        principalTable: "Person",
                        principalColumn: "PersonID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Wedding_Person_WomanID",
                        column: x => x.WomanID,
                        principalTable: "Person",
                        principalColumn: "PersonID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MarriageUnion",
                columns: table => new
                {
                    UnionID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    WeddingID = table.Column<int>(type: "integer", nullable: false),
                    UnionType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    UnionDate = table.Column<DateTime>(type: "date", nullable: false),
                    Location = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    Validated = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MarriageUnion", x => x.UnionID);
                    table.ForeignKey(
                        name: "FK_MarriageUnion_Wedding_WeddingID",
                        column: x => x.WeddingID,
                        principalTable: "Wedding",
                        principalColumn: "WeddingID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "City",
                columns: new[] { "CityID", "CountryName", "Name" },
                values: new object[,]
                {
                    { 1, "France", "Paris" },
                    { 2, "France", "Lyon" },
                    { 3, "France", "Marseille" },
                    { 4, "Cameroun", "Yaoundé" },
                    { 5, "Cameroun", "Douala" }
                });

            migrationBuilder.InsertData(
                table: "Family",
                columns: new[] { "FamilyID", "CreatedBy", "CreatedDate", "Description", "FamilyName", "InviteCode" },
                values: new object[] { 1, null, new DateTime(2026, 4, 21, 19, 43, 57, 20, DateTimeKind.Utc).AddTicks(3470), "Famille de démonstration", "Famille Exemple", null });

            migrationBuilder.CreateIndex(
                name: "IX_Album_CreatedBy",
                table: "Album",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Album_EventID",
                table: "Album",
                column: "EventID");

            migrationBuilder.CreateIndex(
                name: "IX_Album_FamilyID",
                table: "Album",
                column: "FamilyID");

            migrationBuilder.CreateIndex(
                name: "IX_AlbumComment_AlbumID",
                table: "AlbumComment",
                column: "AlbumID");

            migrationBuilder.CreateIndex(
                name: "IX_AlbumComment_AuthorID",
                table: "AlbumComment",
                column: "AuthorID");

            migrationBuilder.CreateIndex(
                name: "IX_AlbumPermission_AlbumID",
                table: "AlbumPermission",
                column: "AlbumID");

            migrationBuilder.CreateIndex(
                name: "IX_AlbumPermission_PersonID",
                table: "AlbumPermission",
                column: "PersonID");

            migrationBuilder.CreateIndex(
                name: "IX_AlbumPermission_UserID",
                table: "AlbumPermission",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Connexion_Email",
                table: "Connexion",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Connexion_FamilyID",
                table: "Connexion",
                column: "FamilyID");

            migrationBuilder.CreateIndex(
                name: "IX_Connexion_IDPerson",
                table: "Connexion",
                column: "IDPerson",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Connexion_UserName",
                table: "Connexion",
                column: "UserName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Event_CreatedBy",
                table: "Event",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Event_FamilyID",
                table: "Event",
                column: "FamilyID");

            migrationBuilder.CreateIndex(
                name: "IX_EventParticipant_EventID",
                table: "EventParticipant",
                column: "EventID");

            migrationBuilder.CreateIndex(
                name: "IX_EventParticipant_PersonID",
                table: "EventParticipant",
                column: "PersonID");

            migrationBuilder.CreateIndex(
                name: "IX_EventPhoto_EventID",
                table: "EventPhoto",
                column: "EventID");

            migrationBuilder.CreateIndex(
                name: "IX_EventPhoto_UploadedBy",
                table: "EventPhoto",
                column: "UploadedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Family_CreatedBy",
                table: "Family",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyRelation_FamilyID",
                table: "FamilyRelation",
                column: "FamilyID");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyRelation_PersonID",
                table: "FamilyRelation",
                column: "PersonID");

            migrationBuilder.CreateIndex(
                name: "IX_MarriageUnion_WeddingID",
                table: "MarriageUnion",
                column: "WeddingID");

            migrationBuilder.CreateIndex(
                name: "IX_Person_CityID",
                table: "Person",
                column: "CityID");

            migrationBuilder.CreateIndex(
                name: "IX_Person_CreatedBy",
                table: "Person",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Person_FamilyID",
                table: "Person",
                column: "FamilyID");

            migrationBuilder.CreateIndex(
                name: "IX_Person_FatherID",
                table: "Person",
                column: "FatherID");

            migrationBuilder.CreateIndex(
                name: "IX_Person_MaternalFamilyID",
                table: "Person",
                column: "MaternalFamilyID");

            migrationBuilder.CreateIndex(
                name: "IX_Person_MotherID",
                table: "Person",
                column: "MotherID");

            migrationBuilder.CreateIndex(
                name: "IX_Person_PaternalFamilyID",
                table: "Person",
                column: "PaternalFamilyID");

            migrationBuilder.CreateIndex(
                name: "IX_Photo_AlbumID",
                table: "Photo",
                column: "AlbumID");

            migrationBuilder.CreateIndex(
                name: "IX_Photo_UploadedBy",
                table: "Photo",
                column: "UploadedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PhotoLike_PhotoID",
                table: "PhotoLike",
                column: "PhotoID");

            migrationBuilder.CreateIndex(
                name: "IX_PhotoLike_UserID",
                table: "PhotoLike",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_PhotoPerson_PersonID",
                table: "PhotoPerson",
                column: "PersonID");

            migrationBuilder.CreateIndex(
                name: "IX_PhotoPerson_PhotoID",
                table: "PhotoPerson",
                column: "PhotoID");

            migrationBuilder.CreateIndex(
                name: "IX_PhotoPerson_TaggedBy",
                table: "PhotoPerson",
                column: "TaggedBy");

            migrationBuilder.CreateIndex(
                name: "IX_poll_participants_pollid",
                table: "poll_participants",
                column: "pollid");

            migrationBuilder.CreateIndex(
                name: "IX_polloptions_pollid",
                table: "polloptions",
                column: "pollid");

            migrationBuilder.CreateIndex(
                name: "IX_pollvotes_optionid",
                table: "pollvotes",
                column: "optionid");

            migrationBuilder.CreateIndex(
                name: "IX_pollvotes_pollid",
                table: "pollvotes",
                column: "pollid");

            migrationBuilder.CreateIndex(
                name: "IX_Wedding_CreatedBy",
                table: "Wedding",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Wedding_ManID",
                table: "Wedding",
                column: "ManID");

            migrationBuilder.CreateIndex(
                name: "IX_Wedding_PatrilinealFamilyID",
                table: "Wedding",
                column: "PatrilinealFamilyID");

            migrationBuilder.CreateIndex(
                name: "IX_Wedding_WomanID",
                table: "Wedding",
                column: "WomanID");

            migrationBuilder.AddForeignKey(
                name: "FK_Album_Connexion_CreatedBy",
                table: "Album",
                column: "CreatedBy",
                principalTable: "Connexion",
                principalColumn: "ConnexionID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Album_Event_EventID",
                table: "Album",
                column: "EventID",
                principalTable: "Event",
                principalColumn: "EventID");

            migrationBuilder.AddForeignKey(
                name: "FK_Album_Family_FamilyID",
                table: "Album",
                column: "FamilyID",
                principalTable: "Family",
                principalColumn: "FamilyID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AlbumComment_Connexion_AuthorID",
                table: "AlbumComment",
                column: "AuthorID",
                principalTable: "Connexion",
                principalColumn: "ConnexionID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AlbumPermission_Connexion_UserID",
                table: "AlbumPermission",
                column: "UserID",
                principalTable: "Connexion",
                principalColumn: "ConnexionID");

            migrationBuilder.AddForeignKey(
                name: "FK_AlbumPermission_Person_PersonID",
                table: "AlbumPermission",
                column: "PersonID",
                principalTable: "Person",
                principalColumn: "PersonID");

            migrationBuilder.AddForeignKey(
                name: "FK_Connexion_Family_FamilyID",
                table: "Connexion",
                column: "FamilyID",
                principalTable: "Family",
                principalColumn: "FamilyID");

            migrationBuilder.AddForeignKey(
                name: "FK_Connexion_Person_IDPerson",
                table: "Connexion",
                column: "IDPerson",
                principalTable: "Person",
                principalColumn: "PersonID");

            migrationBuilder.AddForeignKey(
                name: "FK_Event_Family_FamilyID",
                table: "Event",
                column: "FamilyID",
                principalTable: "Family",
                principalColumn: "FamilyID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EventParticipant_Person_PersonID",
                table: "EventParticipant",
                column: "PersonID",
                principalTable: "Person",
                principalColumn: "PersonID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Family_Person_CreatedBy",
                table: "Family",
                column: "CreatedBy",
                principalTable: "Person",
                principalColumn: "PersonID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Person_Connexion_CreatedBy",
                table: "Person");

            migrationBuilder.DropForeignKey(
                name: "FK_Person_Family_FamilyID",
                table: "Person");

            migrationBuilder.DropForeignKey(
                name: "FK_Person_Family_MaternalFamilyID",
                table: "Person");

            migrationBuilder.DropForeignKey(
                name: "FK_Person_Family_PaternalFamilyID",
                table: "Person");

            migrationBuilder.DropTable(
                name: "AlbumComment");

            migrationBuilder.DropTable(
                name: "AlbumPermission");

            migrationBuilder.DropTable(
                name: "EventParticipant");

            migrationBuilder.DropTable(
                name: "EventPhoto");

            migrationBuilder.DropTable(
                name: "FamilyRelation");

            migrationBuilder.DropTable(
                name: "MarriageUnion");

            migrationBuilder.DropTable(
                name: "PhotoLike");

            migrationBuilder.DropTable(
                name: "PhotoPerson");

            migrationBuilder.DropTable(
                name: "poll_participants");

            migrationBuilder.DropTable(
                name: "pollvotes");

            migrationBuilder.DropTable(
                name: "Wedding");

            migrationBuilder.DropTable(
                name: "Photo");

            migrationBuilder.DropTable(
                name: "polloptions");

            migrationBuilder.DropTable(
                name: "Album");

            migrationBuilder.DropTable(
                name: "polls");

            migrationBuilder.DropTable(
                name: "Event");

            migrationBuilder.DropTable(
                name: "Connexion");

            migrationBuilder.DropTable(
                name: "Family");

            migrationBuilder.DropTable(
                name: "Person");

            migrationBuilder.DropTable(
                name: "City");
        }
    }
}
