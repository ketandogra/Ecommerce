const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require('fs')
const cloudinaryUploadingImg = require('../utils/cloudinary')

// Define multer storage configuration
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Define the destination folder for uploaded images
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, cb) {
    // Generate a unique filename for the uploaded image
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".jpeg");
  },

});

// Define multer file filter configuration
const multerFilter = function (req, file, cb) {
  // Check if the uploaded file is an image
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    // If not an image, reject the file upload with an error message
    cb({ message: "Unsupported file format" }, false);
  }
};

// Create a multer middleware with the defined storage and filter configurations
const uploadPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 2000000 }, // Limit the file size to 2MB
});

// Middleware for resizing and uploading product images to Cloudinary
const productImgResizeAndUpload = async (req, res, next) => {
  if (!req.files) return next();

  const imageUrls = [];

  try {
    // Process and upload each uploaded image to Cloudinary
    await Promise.all(
      req.files.map(async (file) => {
        const originalImagePath = file.path;

        await sharp(originalImagePath)
          .toFormat("jpeg")
          .resize({
            width: 800, // Set the maximum width
            height: 600, // Set the maximum height
            fit: sharp.fit.inside, // Fit the image inside the specified dimensions
            withoutEnlargement: true, // Prevent upscaling
          })
          .jpeg({   quality: 80, // Adjust the JPEG quality (0-100)
          chromaSubsampling: '4:4:4', // Preserve color quality 
        })
          .toFile(`public/images/blogs/${file.filename}`)

        let resizePath = path.join(__dirname,'../',`public/images/blogs/${file.filename}`)
       

        const cloudinaryImgUrl = await cloudinaryUploadingImg(resizePath, "products");
    
        // Store the Cloudinary URL in the array
        imageUrls.push(cloudinaryImgUrl);

        // Remove both the original and resized images from the server's disk storage

          fs.unlinkSync(originalImagePath)

          fs.unlinkSync(`public/images/blogs/${file.filename}`)
   
      })
    );

    // Pass the array of Cloudinary image URLs to the next middleware or route
    req.body.imageUrls = imageUrls;

    next();
  } catch (error) {
    console.error("Error in blogImgResizeAndUpload:", error);
    next(error); // Pass the error to the error-handling middleware
  }
};

// Middleware for resizing and uploading blog images to Cloudinary
const blogImgResizeAndUpload = async (req, res, next) => {
  if (!req.files) return next();

  const imageUrls = [];

  try {
    // Process and upload each uploaded image to Cloudinary
    await Promise.all(
      req.files.map(async (file) => {
        const originalImagePath = file.path;

        await sharp(originalImagePath)
          .toFormat("jpeg")
          .resize({
            width: 800, // Set the maximum width
            height: 600, // Set the maximum height
            fit: sharp.fit.inside, // Fit the image inside the specified dimensions
            withoutEnlargement: true, // Prevent upscaling
          })
          .jpeg({   quality: 80, // Adjust the JPEG quality (0-100)
          chromaSubsampling: '4:4:4', // Preserve color quality 
        })
          .toFile(`public/images/blogs/${file.filename}`)

        let resizePath = path.join(__dirname,'../',`public/images/blogs/${file.filename}`)
       

        const cloudinaryImgUrl = await cloudinaryUploadingImg(resizePath, "blogs");
    
        // Store the Cloudinary URL in the array
        imageUrls.push(cloudinaryImgUrl);

        // Remove both the original and resized images from the server's disk storage

          fs.unlinkSync(originalImagePath)

          fs.unlinkSync(`public/images/blogs/${file.filename}`)
   
      })
    );

    // Pass the array of Cloudinary image URLs to the next middleware or route
    req.body.imageUrls = imageUrls;

    next();
  } catch (error) {
    console.error("Error in blogImgResizeAndUpload:", error);
    next(error); // Pass the error to the error-handling middleware
  }
};

// Export the middleware functions for use in routes or other parts of the application
module.exports = { uploadPhoto, productImgResizeAndUpload, blogImgResizeAndUpload };
