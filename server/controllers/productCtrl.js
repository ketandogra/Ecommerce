const { query } = require("express");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const cloudinaryUploading = require('../utils/cloudinary')
const validateMongoDbId = require("../utils/validateMongodbId");
const cloudinaryUploadingImg = require("../utils/cloudinary");

//Create new product
const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    throw new Error(error);
  }
});

// Get single product
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const findProduct = await Product.findById(id);
    res.status(200).json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});

// Get All Products
const getAllProduct = asyncHandler(async (req, res) => {
  try {
    const queryObj = { ...req.query };

    // query filtering
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((ele) => delete queryObj[ele]);

    //query string
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    let query = Product.find(JSON.parse(queryString));

    //Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    //pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) {
        throw new Error("This Page does not exists");
      }
    }

    const product = await query;

    res.status(200).json(product);
  } catch (error) {
    throw new Error(error);
  }
});

// Update  Product
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (error) {
    throw new Error(error);
  }
});

// Delete  Product
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await Product.findOneAndDelete(id);
    res.status(200).json(deletedProduct);
  } catch (error) {
    throw new Error(error);
  }
});

// add product into whishlist
const addToWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;

  try {
    // Validate _id and prodId here if needed

    let user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyAdded = user.wishlist.includes(prodId);

    if (alreadyAdded) {
      user = await User.findByIdAndUpdate(
        _id,
        { $pull: { wishlist: prodId } },
        { new: true }
      );
    } else {
      user = await User.findByIdAndUpdate(
        _id,
        { $push: { wishlist: prodId } },
        { new: true }
      );
    }

    res.status(200).json({
      message: "product added to whislist",
      user,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Rating
const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, prodId, comment } = req.body;

  try {
    // Find the product by its ID
    let product = await Product.findById(prodId);

    // Check if the user has already rated the product
    const alreadyRated = product.ratings.find(
      (userId) => userId.postedBy.toString() === _id.toString()
    );

    if (alreadyRated) {
      // Corrected the update query to update the existing rating
      const updateRating = await Product.updateOne(
        {
          "ratings._id": alreadyRated._id, // Match by rating's _id
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
        },
        { new: true }
      );
    } else {
      // If the user hasn't rated the product, add a new rating
      const rateProduct = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: { star: star, comment: comment, postedBy: _id },
          },
        },
        { new: true }
      );
    }

    // Calculate the total rating for the product
    const getAllratings = await Product.findById(prodId);
    let totalRatingNumber = getAllratings.ratings.length;
    let sumRating = getAllratings.ratings
      .map((item) => item.star)
      .reduce((totalRating, rating) => totalRating + rating, 0);
    let averageRating = Math.round(sumRating / totalRatingNumber);

    // Update the product with the calculated average rating
    product = await Product.findByIdAndUpdate(
      prodId,
      { totalRating: averageRating },
      { new: true }
    );

    //Return update product
    res.json(product);
  } catch (error) {
    // Handle errors by throwing an error (you may want to handle errors differently)
    throw new Error(error);
  }
});

// Controller to upload product images
const uploadProductImages = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Ensure id is a valid MongoDB ObjectId
  validateMongoDbId(id);

  try {
    const urls = [];
    const files = req.files;

    // Loop through uploaded files and upload them to Cloudinary
    for (let file of files) {
      const { path } = file;
      // Upload the image to Cloudinary and store the URL
      const newPath = await cloudinaryUploadingImg(path, "images");
      if (newPath) {
        urls.push(newPath);
      }
    }

    // Update the product's images with the new URLs
    const findProduct = await Product.findByIdAndUpdate(
      id,
      {
        images: urls.map((file) => file),
      },
      {
        new: true, // Return the updated product
      }
    );

    // Handle case where the product is not found
    if (!findProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Send the updated product as a JSON response
    res.json(findProduct);
  } catch (error) {
    console.error("Error in uploadProductImages:", error);
    throw new Error(error);
  }
});

module.exports = {
  createProduct,
  getProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
  uploadProductImages ,
};
