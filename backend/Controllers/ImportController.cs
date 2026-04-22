using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using FamilyTreeAPI.Data;
using FamilyTreeAPI.Models;
using OfficeOpenXml;

namespace FamilyTreeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ImportController : ControllerBase
    {
        private readonly FamilyTreeContext _context;

        public ImportController(FamilyTreeContext context)
        {
            _context = context;
        }

        // GET: api/import/template — Télécharger le modèle Excel vide
        [HttpGet("template")]
        public IActionResult DownloadTemplate()
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using var package = new ExcelPackage();
            var sheet = package.Workbook.Worksheets.Add("Membres");

            // En-têtes
            var headers = new[]
            {
                "Prénom*", "Nom*", "Sexe* (M/F)", "Date de naissance (JJ/MM/AAAA)",
                "Décédé (oui/non)", "Date de décès (JJ/MM/AAAA)",
                "Email", "Activité/Profession", "Notes",
                "Prénom père", "Nom père",
                "Prénom mère", "Nom mère"
            };

            for (int i = 0; i < headers.Length; i++)
            {
                var cell = sheet.Cells[1, i + 1];
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                cell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(103, 58, 183)); // purple
                cell.Style.Font.Color.SetColor(System.Drawing.Color.White);
            }

            // Ligne d'exemple
            sheet.Cells[2, 1].Value = "Jean";
            sheet.Cells[2, 2].Value = "Dupont";
            sheet.Cells[2, 3].Value = "M";
            sheet.Cells[2, 4].Value = "15/03/1980";
            sheet.Cells[2, 5].Value = "non";
            sheet.Cells[2, 6].Value = "";
            sheet.Cells[2, 7].Value = "jean@exemple.com";
            sheet.Cells[2, 8].Value = "Médecin";
            sheet.Cells[2, 9].Value = "Note optionnelle";
            sheet.Cells[2, 10].Value = "Pierre";
            sheet.Cells[2, 11].Value = "Dupont";
            sheet.Cells[2, 12].Value = "Marie";
            sheet.Cells[2, 13].Value = "Martin";

            sheet.Cells[sheet.Dimension.Address].AutoFitColumns();

            var bytes = package.GetAsByteArray();
            return File(bytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "modele_import_famille.xlsx");
        }

        // POST: api/import/excel — Importer depuis un fichier Excel
        [HttpPost("excel")]
        public async Task<ActionResult> ImportExcel([FromForm] IFormFile file)
        {
            var userFamilyId = int.Parse(User.FindFirst("familyId")?.Value ?? "0");
            var userConnexionId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            if (userFamilyId == 0)
                return Unauthorized(new { message = "Famille non identifiée" });

            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Aucun fichier fourni" });

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (ext != ".xlsx" && ext != ".xls")
                return BadRequest(new { message = "Format invalide. Utilisez un fichier .xlsx" });

            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            var imported = new List<string>();
            var skipped = new List<string>();
            var errors = new List<string>();

            using var stream = file.OpenReadStream();
            using var package = new ExcelPackage(stream);

            var sheet = package.Workbook.Worksheets.FirstOrDefault();
            if (sheet == null)
                return BadRequest(new { message = "Fichier Excel vide ou invalide" });

            int rowCount = sheet.Dimension?.Rows ?? 0;
            if (rowCount < 2)
                return BadRequest(new { message = "Le fichier ne contient aucune donnée (ligne 1 = en-têtes)" });

            // Passe 1 : créer toutes les personnes sans parents
            var createdPersons = new Dictionary<int, Person>(); // rowIndex → Person

            for (int row = 2; row <= rowCount; row++)
            {
                var firstName = sheet.Cells[row, 1].Text.Trim();
                var lastName = sheet.Cells[row, 2].Text.Trim();
                var sexRaw = sheet.Cells[row, 3].Text.Trim().ToUpper();

                if (string.IsNullOrEmpty(firstName) || string.IsNullOrEmpty(lastName))
                {
                    skipped.Add($"Ligne {row} : prénom ou nom manquant");
                    continue;
                }

                var sex = sexRaw == "F" ? "F" : "M";

                DateTime? birthday = null;
                var birthdayRaw = sheet.Cells[row, 4].Text.Trim();
                if (!string.IsNullOrEmpty(birthdayRaw))
                {
                    if (DateTime.TryParseExact(birthdayRaw, new[] { "dd/MM/yyyy", "d/M/yyyy", "yyyy-MM-dd" },
                        System.Globalization.CultureInfo.InvariantCulture,
                        System.Globalization.DateTimeStyles.None, out var bd))
                    {
                        birthday = DateTime.SpecifyKind(bd, DateTimeKind.Utc);
                    }
                    else
                    {
                        errors.Add($"Ligne {row} ({firstName} {lastName}) : date de naissance invalide '{birthdayRaw}' — ignorée");
                    }
                }

                var deceasedRaw = sheet.Cells[row, 5].Text.Trim().ToLower();
                var alive = deceasedRaw != "oui" && deceasedRaw != "yes" && deceasedRaw != "1";

                DateTime? deathDate = null;
                if (!alive)
                {
                    var deathRaw = sheet.Cells[row, 6].Text.Trim();
                    if (!string.IsNullOrEmpty(deathRaw))
                    {
                        if (DateTime.TryParseExact(deathRaw, new[] { "dd/MM/yyyy", "d/M/yyyy", "yyyy-MM-dd" },
                            System.Globalization.CultureInfo.InvariantCulture,
                            System.Globalization.DateTimeStyles.None, out var dd))
                        {
                            deathDate = DateTime.SpecifyKind(dd, DateTimeKind.Utc);
                        }
                    }
                }

                var email = sheet.Cells[row, 7].Text.Trim();
                var activity = sheet.Cells[row, 8].Text.Trim();
                var notes = sheet.Cells[row, 9].Text.Trim();

                // Vérifier doublon (même prénom + nom + famille)
                var exists = await _context.Persons.AnyAsync(p =>
                    p.FamilyID == userFamilyId &&
                    p.FirstName.ToLower() == firstName.ToLower() &&
                    p.LastName.ToLower() == lastName.ToLower());

                if (exists)
                {
                    skipped.Add($"Ligne {row} : {firstName} {lastName} existe déjà");
                    continue;
                }

                var person = new Person
                {
                    FirstName = firstName,
                    LastName = lastName,
                    Sex = sex,
                    Birthday = birthday,
                    Alive = alive,
                    DeathDate = deathDate,
                    Email = string.IsNullOrEmpty(email) ? null : email,
                    Activity = string.IsNullOrEmpty(activity) ? null : activity,
                    Notes = string.IsNullOrEmpty(notes) ? null : notes,
                    FamilyID = userFamilyId,
                    CityID = 1,
                    CreatedBy = userConnexionId,
                    Status = alive ? "confirmed" : "deceased",
                    CanLogin = alive
                };

                _context.Persons.Add(person);
                createdPersons[row] = person;
            }

            await _context.SaveChangesAsync();

            // Passe 2 : lier les parents
            for (int row = 2; row <= rowCount; row++)
            {
                if (!createdPersons.TryGetValue(row, out var person)) continue;

                var fatherFirst = sheet.Cells[row, 10].Text.Trim();
                var fatherLast = sheet.Cells[row, 11].Text.Trim();
                var motherFirst = sheet.Cells[row, 12].Text.Trim();
                var motherLast = sheet.Cells[row, 13].Text.Trim();

                bool changed = false;

                if (!string.IsNullOrEmpty(fatherFirst) && !string.IsNullOrEmpty(fatherLast))
                {
                    var father = await FindOrCreatePlaceholderAsync(fatherFirst, fatherLast, "M", userFamilyId);
                    person.FatherID = father.PersonID;
                    changed = true;
                }

                if (!string.IsNullOrEmpty(motherFirst) && !string.IsNullOrEmpty(motherLast))
                {
                    var mother = await FindOrCreatePlaceholderAsync(motherFirst, motherLast, "F", userFamilyId);
                    person.MotherID = mother.PersonID;
                    changed = true;
                }

                if (changed)
                    imported.Add($"{person.FirstName} {person.LastName}");
                else
                    imported.Add($"{person.FirstName} {person.LastName}");
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                imported = imported.Count,
                skipped = skipped.Count,
                errors = errors.Count,
                details = new
                {
                    imported,
                    skipped,
                    errors
                }
            });
        }

        private async Task<Person> FindOrCreatePlaceholderAsync(
            string firstName, string lastName, string sex, int familyId)
        {
            var existing = await _context.Persons.FirstOrDefaultAsync(p =>
                p.FamilyID == familyId &&
                p.FirstName.ToLower() == firstName.ToLower() &&
                p.LastName.ToLower() == lastName.ToLower() &&
                p.Sex == sex);

            if (existing != null) return existing;

            var placeholder = new Person
            {
                FirstName = firstName,
                LastName = lastName,
                Sex = sex,
                FamilyID = familyId,
                CityID = 1,
                Status = "placeholder",
                Alive = true,
                CanLogin = false,
                CreatedBy = null
            };

            _context.Persons.Add(placeholder);
            await _context.SaveChangesAsync();
            return placeholder;
        }
    }
}
