using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace FamilyTreeAPI.Services
{
    public class CloudinaryService
    {
        private readonly Cloudinary _cloudinary;
        private readonly bool _isConfigured;

        public CloudinaryService(IConfiguration configuration)
        {
            var cloudName = configuration["Cloudinary:CloudName"]
                ?? Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD_NAME")
                ?? Environment.GetEnvironmentVariable("Cloud_name");
            var apiKey = configuration["Cloudinary:ApiKey"]
                ?? Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY")
                ?? Environment.GetEnvironmentVariable("API_key");
            var apiSecret = configuration["Cloudinary:ApiSecret"]
                ?? Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET")
                ?? Environment.GetEnvironmentVariable("API_secret");

            _isConfigured = !string.IsNullOrEmpty(cloudName) && !string.IsNullOrEmpty(apiKey) && !string.IsNullOrEmpty(apiSecret);

            if (_isConfigured)
            {
                var account = new Account(cloudName, apiKey, apiSecret);
                _cloudinary = new Cloudinary(account);
                _cloudinary.Api.Secure = true;
            }
            else
            {
                // Fallback : Cloudinary non configuré (dev local sans credentials)
                _cloudinary = new Cloudinary();
            }
        }

        public bool IsConfigured => _isConfigured;

        public async Task<string?> UploadPhotoAsync(IFormFile file, string folder = "family-tree")
        {
            if (!_isConfigured) return null;
            if (file == null || file.Length == 0) return null;

            using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = folder,
                Transformation = new Transformation()
                    .Width(800).Height(800)
                    .Crop("limit")
                    .Quality("auto")
                    .FetchFormat("auto")
            };

            var result = await _cloudinary.UploadAsync(uploadParams);

            if (result.StatusCode == System.Net.HttpStatusCode.OK)
            {
                return result.SecureUrl.ToString();
            }

            return null;
        }

        public async Task DeletePhotoAsync(string publicId)
        {
            if (!_isConfigured) return;
            var deleteParams = new DeletionParams(publicId);
            await _cloudinary.DestroyAsync(deleteParams);
        }
    }
}
