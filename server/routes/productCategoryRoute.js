const express = require("express");
const {createCategory,updateCategory,deleteCategory,getCategory,getAllCategories} = require("../controllers/productCategoryCtrl")
const {isAdmin,authMiddleware} = require("../middlewares/authMiddleware")


const router = express.Router()


//Create profuct category
router.post("/",authMiddleware,isAdmin,createCategory)

// update product category
router.put("/:id",authMiddleware,isAdmin,updateCategory)

// delete product category
router.delete("/:id",authMiddleware,isAdmin,deleteCategory)

// get a product category
router.get("/:id",getCategory)

// get all product categories
router.get("/",getAllCategories)



module.exports = router;