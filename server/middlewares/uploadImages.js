const multer = require("multer");
const sharp = require("sharp");
const path = require("path");

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
  limits: { fileSize: 5000000 }, // Limit the file size to 5MB
});

// Middleware for resizing and formatting uploaded product images
const productImgResize = async (req, res, next) => {
  if (!req.files) return next();

  // Process and resize each uploaded image
  await Promise.all(
    req.files.map(async (file) => {
      await sharp(file.path)
        .resize(400, 400)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/images/products/${file.filename}`);
    })
  );

  // Continue to the next middleware or route handler
  next();
};

// Middleware for resizing and formatting uploaded blog images
const blogImgResize = async (req, res, next) => {
  if (!req.files) return next();

  // Process and resize each uploaded image
  await Promise.all(
    req.files.map(async (file) => {
      await sharp(file.path)
        .resize(300, 300)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/images/blogs/${file.filename}`);
    })
  );

  // Continue to the next middleware or route handler
  next();
};

// Export the middleware functions for use in routes or other parts of the application
module.exports = { uploadPhoto, productImgResize, blogImgResize };
