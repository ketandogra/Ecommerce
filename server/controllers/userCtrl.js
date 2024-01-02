const User = require("../models/userModel");
const Address = require("../models/addressModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const asyncHandler = require("express-async-handler");
const crypto = require("crypto-js");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshToken");
const validateMongoDbId = require("../utils/validateMongodbId");
const sendEmail = require("./emailCtrl");
const uniqid = require('uniqid')

//new user action
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    //Create a new User

    const newUser = new User({
      ...req.body,
    });

    await newUser.save();

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

  if (findUser && (await findUser.isPasswordMatched(password))) {
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

//Admin login
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //check if Admin exists or not
  const findAdmin = await User.findOne({ email });
  if (findAdmin.role !== "admin") throw new Error("Not Authorized");

  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = generateRefreshToken(findAdmin?._id);
    const updateAdmin = await User.findByIdAndUpdate(
      findAdmin?._id,
      { refreshToken: refreshToken },
      { new: true }
    );
    // sent refresh token into cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstname,
      lastname: findAdmin?.lastname,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      token: generateToken(findAdmin?._id),
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

// Create a new address for a user
const createAddress = async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  const newAddress = req.body;

  try {
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const address = await Address.create(newAddress);
    console.log(address);
    // Add the new address to the user's addresses array
    user.address.push(address._id);

    // Save the updated user document
    await user.save();

    res.status(201).json(user); // Return the updated addresses array
  } catch (error) {
    throw new Error(error);
  }
};

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
  const { password } = req.body;
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
const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found with this email");

  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:8000/api/user/reset-password/${token}'> Click here</a>`;

    const data = {
      to: email,
      text: "Hi User",
      subject: "Forgot Password Link",
      html: resetURL,
    };
    sendEmail(data);

    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

// Reset Password

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.SHA256(token).toString(crypto.enc.Hex);
  try {
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpire: { $gt: Date.now() },
    });

    if (!user) throw new Error("Token Expired, Please try again later");

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();
    res.status(200).json({
      message: "Password reset successfully",
      user,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//Get Wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  try {
    const findUser = await User.findById(_id).populate("wishlist");
    res.json(findUser);
  } catch (error) {
    throw new Error(error);
  }
});

// User Cart Create
const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    let products = [];
    const findUser = await User.findById(_id);

    //check user already have products in cart
    const alreadExistCart = await Cart.findOne({ orderBy: findUser._id });
    if (alreadExistCart) {
      alreadExistCart.remove();
    }

    for (let i = 0; i < cart.length; i++) {
      let obj = {};
      obj.product = cart[i]._id;
      obj.count = cart[i].count;
      obj.color = cart[i].color;
      let getPrice = await Product.findById(cart[i]._id).select("price").exec();
      obj.price = getPrice.price;
      products.push(obj);
    }

    let cartTotal = 0;
    for (let product of products) {
      cartTotal += product.price * product.count;
    }

    let newCart = new Cart({
      products,
      cartTotal,
      orderBy: findUser?._id,
    });

    await newCart.save();

    res.json(newCart);
  } catch (error) {
    throw new Error(error);
  }
});

// Get cart
const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.findOne({ orderBy: _id }).populate(
      "products.product",
      "_id title price images"
    );

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

// Empty Cart Functionality
const emptyUserCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  validateMongoDbId(userId);
  try {
    const cart = await Cart.findOneAndRemove({ orderBy: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({ message: "Cart emptied successfully", cart });
  } catch (error) {
    // Respond with an error message.
    throw new Error(error);
  }
});

// Coupon Apply
const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;

  try {
    // Check if the coupon exists in the database
    const validCoupon = await Coupon.findOne({ name: coupon });

    if (!validCoupon) {
      return res.status(404).json({ message: "Invalid Coupon" });
    }

    // Find the user's cart
    const user = await User.findOne({ _id });
    const cart = await Cart.findOne({ orderBy: user._id });

    // Calculate the total after applying the coupon discount
    const totalAfterDiscount = (
      cart.cartTotal - (cart.cartTotal * validCoupon.discount) / 100
    ).toFixed(2);

    // Update the cart with the new totalAfterDiscount
    const updatedCart = await Cart.findOneAndUpdate(
      { orderBy: user._id },
      { totalAfterDiscount },
      { new: true }
    );

    // Respond with a success message and the updated cart information
    res
      .status(200)
      .json({ message: "Coupon applied successfully", cartTotalAfterDiscount:updatedCart.totalAfterDiscount});
  } catch (error) {
    // Handle unexpected errors and respond with an error message
    throw new Error(error)
  }
});

// create Order
const createOrder = asyncHandler(async(req,res)=>{

  const {COD,couponApplied} = req.body
  const {_id} = req.user
  validateMongoDbId(_id)

  try{
    if(!COD) throw new Error("Create cash order failed")
    const user = await User.findById(_id)
    let userCart = await Cart.findOne({orderBy:user._id})

    let finalAmount = 0
    if(couponApplied && userCart.totalAfterDiscount){
      finalAmount = userCart.totalAfterDiscount 
    }else{
      finalAmount = userCart.cartTotal
    }

    await new Order({

      products:userCart.products,
      paymentIntent:{
        id:uniqid(),
        method:"COD",
        amount: finalAmount,
        status:"Cash on Delivery",
        created: Date.now(),
        currency:"INR",
      },
      orderBy:user._id,
      orderSatus:"Cash on Delivery"

    }).save()

    //update sold and product inventory
    let update = userCart.products.map((item)=>{
      return{
        updateOne:{
          filter:{_id:item.product._id},
          update:{$inc:{quantity: -item.count, sold: +item.count}}
        }
      }
    })

    const updatedProduct = await Product.bulkWrite(update,{})

    res.json({message:'Order Create successfully',updatedProduct})

  }catch(error){
    throw new Error(error)
  }
})

const getOrders = asyncHandler(async(req,res)=>{
  const {_id} = req.user;
  validateMongoDbId(_id)
  try{
    const userOrders = await Order.findOne({orderBy:_id}).populate('products.product');
    res.status(200).json(userOrders)

  }catch(error){
    throw new Error(error)

  }
})

const updateOrderStatus = asyncHandler((async(req,res)=>{
  const {status} = req.body
  const {id} = req.params
  validateMongoDbId(id)


  try{
    const updateOrderStatus = await Order.findByIdAndUpdate(id,{orderStatus:status,
      paymentIntent:{
        status: status
      }},{new:true})
      res.json(updateOrderStatus)

  }catch(error){
    throw new Error(error)

  }

}))






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
  resetPassword,
  loginAdmin,
  getWishlist,
  createAddress,
  userCart,
  getUserCart,
  emptyUserCart,
  applyCoupon,
  createOrder,
  getOrders,
  updateOrderStatus
};
