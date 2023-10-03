// Import the required packages and modules
const express = require("express");
const { createProduct, getProduct, getAllProduct, updateProduct, deleteProduct, addToWishlist, rating, updateProductWithImageURLs } = require("../controllers/productCtrl");
const router = express.Router();

// Import authentication and authorization middleware
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");

// Import image upload and resizing middleware
const { uploadPhoto, productImgResizeAndUpload } = require("../middlewares/uploadImages");

// Create a new product route
router.post('/', authMiddleware, isAdmin, createProduct);

// Get a product route by ID
router.get('/:id', getProduct);

// Get all products route
router.get('/', getAllProduct);

// Add a product to the wishlist
router.put('/add-wishlist', authMiddleware, addToWishlist);

// Rating route
router.put('/rating', authMiddleware, rating);

// Update a product route by ID
router.put('/:id', authMiddleware, isAdmin, updateProduct);

// Upload product images route by ID
router.put('/upload/:id', authMiddleware, isAdmin, uploadPhoto.array('images', 10), productImgResizeAndUpload, updateProductWithImageURLs);

// Delete a product route by ID
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);

// Export the router for use in other modules
module.exports = router;
