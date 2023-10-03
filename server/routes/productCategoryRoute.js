// Import required modules and controllers
const express = require("express");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategories,
} = require("../controllers/productCategoryCtrl");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// Create product category route
router.post("/", authMiddleware, isAdmin, createCategory);

// Update product category route
router.put("/:id", authMiddleware, isAdmin, updateCategory);

// Delete product category route
router.delete("/:id", authMiddleware, isAdmin, deleteCategory);

// Get a product category by ID route
router.get("/:id", getCategory);

// Get all product categories route
router.get("/", getAllCategories);

// Export the router for use in other parts of the application
module.exports = router;
