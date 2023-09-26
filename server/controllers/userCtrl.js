const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshToken");
const validateMongoDbId = require("../utils/validateMongodbId");

//new user action
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    //Create a new User

    //encrypt the user entered password
    const securePassword = await bcrypt.hash(req.body.password, 10);

    //creating new user with encrypt password
    const newUser = await User.create({
      ...req.body,
      password: securePassword,
    });

    res.status(201).json(newUser);
  } else {
    //User Already Exists
    throw new Error("User Already Exists");
  }
});

//Login a user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // function for password match
  const isPasswordMatched = async (enterPassword, userPassword) => {
    return await bcrypt.compare(enterPassword, userPassword);
  };

  //check if user exists or not
  const findUser = await User.findOne({ email });

  if (findUser && (await isPasswordMatched(password, findUser.password))) {
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

const logout = asyncHandler(async(req,res)=>{

  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;

  try {
    const user = await User.findOne({ refreshToken });
    if (!user){
      res.clearCookie('refreshToken',
   {   httpOnly:true,
      secure:true})

      return res.status(204).json('Forbidden') //forbidden

    }
    await User.findOneAndUpdate({refreshToken},{
      refreshToken:""
    },{new:true})

    res.clearCookie('refreshToken',
   {   httpOnly:true,
      secure:true})

   res.status(200).json('Logout successfully!')

    

  } catch (error) {
    throw new Error(error);
  }
})

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
  logout
};
