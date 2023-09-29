const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const crypto = require("crypto-js");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshToken");
const validateMongoDbId = require("../utils/validateMongodbId");
const sendEmail = require("./emailCtrl");

//new user action
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    //Create a new User

    const newUser = new User({
      ...req.body
    })

    await newUser.save()

    res.status(201).json(newUser);
  } else {
    //User Already Exists
    throw new Error("User Already Exists");
  }
});

//Login a user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;



  //check if user exists or not
  const findUser = await User.findOne({ email });

  if (findUser && await findUser.isPasswordMatched(password) ) {
    const refreshToken = generateRefreshToken(findUser?._id);
    const updateUser = await User.findByIdAndUpdate(
      findUser?._id,
      { refreshToken: refreshToken },
      { new: true }
    );
    // sent refresh token into cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid email or password!");
  }
});

//handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;

  try {
    const user = await User.findOne({ refreshToken });
    if (!user) throw new Error("No Refresh token present in db or not matched");
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err || user.id !== decoded.id) {
        throw new Error("There is something wrong with refresh token");
      }

      const accessToken = generateToken(user._id);
      res.status(200).json({ accessToken });
    });
  } catch (error) {
    throw new Error(error);
  }
});

// logout user

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;

  try {
    const user = await User.findOne({ refreshToken });
    if (!user) {
      res.clearCookie("refreshToken", { httpOnly: true, secure: true });

      return res.status(204).json("Forbidden"); //forbidden
    }
    await User.findOneAndUpdate(
      { refreshToken },
      {
        refreshToken: "",
      },
      { new: true }
    );

    res.clearCookie("refreshToken", { httpOnly: true, secure: true });

    res.status(200).json("Logout successfully!");
  } catch (error) {
    throw new Error(error);
  }
});

// Get all users

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find({});

    res.status(200).json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});

//fetch a single user
const getSingleUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const user = await User.findById(id);
    const { password, ...userInfo } = user._doc;
    res.status(200).json(userInfo);
  } catch (error) {
    throw new Error(error);
  }
});

//delete a user
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    res.status(200).json(deletedUser);
  } catch (error) {
    throw new Error(error);
  }
});

//update a user
const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        $set: req.body,
      },
      {
        new: true,
      }
    );
    const { password, ...userInfo } = updatedUser._doc;
    res.status(200).json(userInfo);
  } catch (error) {
    throw new Error(error);
  }
});

//Block User
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true }
    );

    const { password, ...userInfo } = user._doc;

    res.status(200).json({
      message: "User Blocked Successfullly!",
      user: userInfo,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//Unblock User
const unBlockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { new: true }
    );
    const { password, ...userInfo } = user._doc;
    res.status(200).json({
      message: "User unblocked successfullly!",
      user: userInfo,
    });
  } catch (err) {
    throw new Error(erroror);
  }
});

//Update Password
const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const {password} = req.body;
  validateMongoDbId(_id);
  try {
    const user = await User.findById(_id);

    if (password) {
      user.password = password;
      
      const updatedPassword = await user.save();
      res.status(200).json(updatedPassword);
    } else {
      res.json(user);
    }
  } catch (error) {
    throw new Error(error);
  }
});

//forgot password
const forgotPasswordToken = asyncHandler(async(req,res)=>{
  const {email} = req.body;
  const user = await User.findOne({email})
  if(!user) throw new Error ('User not found with this email')

  try{
    const token = await user.createPasswordResetToken()
    await user.save()
    const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:8000/api/user/reset-password/${token}'> Click here</a>`


    const data = {
      to:email,
      text: "Hi User",
      subject: "Forgot Password Link",
      html: resetURL

    }
    sendEmail(data)

    res.json(token)

  }catch(error){
    throw new Error(error);
  }


})

// Reset Password

const resetPassword = asyncHandler(async(req,res)=>{
  const {password} = req.body;
  const {token} = req.params;
  const hashedToken = crypto.SHA256(token).toString(crypto.enc.Hex);
  try{

    const user = await User.findOne({passwordResetToken:hashedToken, passwordResetExpire: {$gt: Date.now()}})

    if(!user) throw new Error("Token Expired, Please try again later");

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();
    res.status(200).json({
      message:"Password reset successfully",
      user
    })

  }catch(error){

  }
})


module.exports = {
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
};
