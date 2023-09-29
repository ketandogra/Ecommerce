const mongoose = require("mongoose");
const crypto = require("crypto-js");
const bcrypt = require("bcrypt");

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    cart: {
      type: Array,
      default: [],
    },
    address: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    passwordChangedAt:{
      type:Date
    },
    passwordResetToken: {
      type:String
    },
    passwordResetExpire:{
      type:Date
    },

    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function(next){
  if (!this.isModified("password")) {
    next();
  }
  const salt = bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  next();
});

userSchema.methods.isPasswordMatched = async function(enterPassword){
  return await bcrypt.compare(enterPassword,this.password)
}

userSchema.methods.createPasswordResetToken = async function() {
  // Step 1: Generate a random token as a hexadecimal string
  const resetToken = crypto.lib.WordArray.random(32).toString();

  // Step 2: Hash the token using the SHA-256 algorithm
  const hashedToken = crypto.SHA256(resetToken).toString(crypto.enc.Hex);

  // Step 3: Set an expiration time for the token (e.g., 10 minutes from now)
  this.passwordResetToken = hashedToken;
  this.passwordResetExpire = Date.now() + 30 * 60 * 1000; // 10 minutes



  // Return the generated reset token

  return resetToken;
};




//Export the model
module.exports = mongoose.model("User", userSchema);
