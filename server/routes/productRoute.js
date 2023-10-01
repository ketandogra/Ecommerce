const express = require("express");
const {createProduct,getProduct,getAllProduct,updateProduct,deleteProduct,addToWishlist, rating} = require("../controllers/productCtrl")
const router = express.Router()

const {isAdmin,authMiddleware} = require("../middlewares/authMiddleware")


// craete a new product route
router.post('/',authMiddleware,isAdmin,createProduct)

// get a product route
router.get('/:id',getProduct)


// get a product route
router.get('/',getAllProduct)

//add product into whislist
router.put('/add-wishlist',authMiddleware,addToWishlist)

//rating
router.put('/rating',authMiddleware,rating)


// update product route
router.put('/:id',authMiddleware,isAdmin,updateProduct)


// delete product route
router.delete('/:id',authMiddleware,isAdmin,deleteProduct)





module.exports = router;

