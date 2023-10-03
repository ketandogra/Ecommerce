// Import the required Cloudinary library and configure it with environment variables
const cloudinary = require("cloudinary").v2;

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_API_KEY, 
  api_secret: process.env.CLOUD_API_SECRET 
});

// Function to upload an image to Cloudinary
const cloudinaryUploadingImg = async (fileToUpload, folder) => {
    return new Promise((resolve) => {
        // Use Cloudinary's uploader to upload the image
        cloudinary.uploader.upload(
          fileToUpload,
          {
            folder: folder, // Specify the folder where the image should be stored
            resource_type: "auto" // Automatically detect the resource type
          },
          (error, result) => {
            if (error) {
              // Handle any errors that occurred during the upload
              console.error("Cloudinary upload error:", error);
              resolve(null); // Resolve with null to indicate failure
            } else {
              // Resolve with the URL of the uploaded image
              resolve({
                url: result.secure_url
              });
            }
          }
        );
    });
}

module.exports = cloudinaryUploadingImg;