const express = require("express");
const {createCoupon,getAllCoupons,updateCoupon,deleteCoupon} = require("../controllers/couponCtrl")
const {isAdmin,authMiddleware} = require("../middlewares/authMiddleware")


const router = express.Router()


//Create coupon
router.post("/",authMiddleware,isAdmin,createCoupon)

//get all coupons
router.get("/",authMiddleware,isAdmin,getAllCoupons)


//update coupon
router.put("/:id",authMiddleware,isAdmin,updateCoupon)



//delete coupon
router.delete("/:id",authMiddleware,isAdmin,deleteCoupon)



module.exports = router;