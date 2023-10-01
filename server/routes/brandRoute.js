const express = require("express");
const {createBrand,updateBrand,deleteBrand,getBrand,getAllBrands} = require("../controllers/brandCtrl")
const {isAdmin,authMiddleware} = require("../middlewares/authMiddleware")


const router = express.Router()


//Create profuct Brand
router.post("/",authMiddleware,isAdmin,createBrand)

// update product Brand
router.put("/:id",authMiddleware,isAdmin,updateBrand)

// delete product Brand
router.delete("/:id",authMiddleware,isAdmin,deleteBrand)

// get a product Brand
router.get("/:id",getBrand)

// get all product Brands
router.get("/",getAllBrands)



module.exports = router;