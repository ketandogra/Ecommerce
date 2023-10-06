const express = require("express");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const {
  createUser,
  loginUser,
  loginAdmin,
  getAllUsers,
  getSingleUser,
  deleteUser,
  updateUser,
  blockUser,
  unBlockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  getWishlist,
  createAddress,
  userCart,
  getUserCart,
  emptyUserCart,
  applyCoupon,
  createOrder

} = require("../controllers/userCtrl");
const router = express.Router();

//POST requests - Create a new user
router.post("/register", createUser);
// login
router.post("/login", loginUser);

// admin login
router.post("/admin-login", loginAdmin);

//cart
router.post("/cart",authMiddleware,userCart)


// apply coupon
router.post("/apply-coupon",authMiddleware, applyCoupon);

//craete order
router.post("/cart/create-order",authMiddleware,createOrder)

// Get requests - refresh token
router.get("/refresh", handleRefreshToken);
//logout user
router.get("/logout", logout);
// get all user
router.get("/all-users", getAllUsers);

// get Cart
router.get("/cart",authMiddleware, getUserCart);

//get single user
router.get("/wishlist", authMiddleware, getWishlist);

//get single user
router.get("/:id", authMiddleware, isAdmin, getSingleUser);

//empty Cart
router.delete("/empty-cart",authMiddleware, emptyUserCart);

//Delete request - delet a user
router.delete("/:id", deleteUser);



//Create user address
router.post("/create-address", authMiddleware, createAddress);


//PUT request - update a user
router.put("/edit-user", authMiddleware, updateUser);

//Block user and Unblock
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unBlockUser);

//Update password
router.put("/password", authMiddleware, updatePassword);

//Update password
router.post("/forgot-password-token",forgotPasswordToken);

//Reset Password
router.put("/reset-password/:token",resetPassword);

module.exports = router;
