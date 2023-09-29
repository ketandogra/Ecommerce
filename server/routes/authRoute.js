const express = require("express");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const {
  createUser,
  loginUser,
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
  resetPassword

} = require("../controllers/userCtrl");
const router = express.Router();

//POST requests - Create a new user
router.post("/register", createUser);
// login
router.post("/login", loginUser);

// Get requests - refresh token
router.get("/refresh", handleRefreshToken);
//logout user
router.get("/logout", logout);
// get all user
router.get("/all-users", getAllUsers);
//get single user
router.get("/:id", authMiddleware, isAdmin, getSingleUser);

//Delete request - delet a user
router.delete("/:id", deleteUser);

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
