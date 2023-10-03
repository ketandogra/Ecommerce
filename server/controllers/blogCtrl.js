const Blog = require("../models/blogModel");
const user = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const cloudinaryUploadingImg = require("../utils/cloudinary");
const fs = require("fs");

//Create Blog
const createBlog = asyncHandler(async (req, res) => {
  try {
    const newBlog = await Blog.create(req.body);
    res.status(201).json({
      status: "Blog created succesfully",
      blog: newBlog,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//Update Blog
const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json({
      status: "Blog updated succesfully",
      blog: updatedBlog,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//Get Blog
const getBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await Blog.findById(id);
    await Blog.findByIdAndUpdate(
      id,
      { $inc: { numViews: 1 } },
      {
        new: true,
      }
    );
    res.status(200).json(blog);
  } catch (error) {
    throw new Error(error);
  }
});

//Get all Blogs
const getAllBlogs = asyncHandler(async (req, res) => {
  try {
    const allBlogs = await Blog.find();

    res.status(200).json(allBlogs);
  } catch (error) {
    throw new Error(error);
  }
});

//Get Blog
const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBlog = await Blog.findByIdAndDelete(id);

    res.status(200).json({
      status: "Blog deleted!",
      blog: deletedBlog,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//like a blog
const likeBlog = asyncHandler(async (req, res) => {
  const blogId = req.body.blogId;

  // Validate the 'blogId' here using the validateMongoDbId function
  validateMongoDbId(blogId);

  try {
    // Find the blog which you want to be liked
    let blog = await Blog.findById(blogId);

    // Find the login user
    const loginUserId = req.user?._id;
    // Find if the user has already disliked the blog
    const alreadyDisliked = blog?.dislikes?.includes(loginUserId);
    if (alreadyDisliked) {
      blog = await Blog.findByIdAndUpdate(
        blogId,
        { $pull: { dislikes: loginUserId }, $push: { likes: loginUserId } },
        { new: true }
      );
    } else {
      // Find if the user has already liked the blog
      const alreadyLiked = blog?.likes?.includes(loginUserId);
      if (alreadyLiked) {
        blog = await Blog.findByIdAndUpdate(
          blogId,
          { $pull: { likes: loginUserId } },
          { new: true }
        );
      } else {
        blog = await Blog.findByIdAndUpdate(
          blogId,
          { $push: { likes: loginUserId } },
          { new: true }
        );
      }
    }

    res.status(200).json(blog);
  } catch (error) {
    // Handle specific errors, e.g., Mongoose errors
    throw new Error(error);
  }
});

//dislike a blog
const dislikeBlog = asyncHandler(async (req, res) => {
  const blogId = req.body.blogId;

  // Validate the 'blogId' here using the validateMongoDbId function
  validateMongoDbId(blogId);

  try {
    // Find the blog which you want to be liked
    let blog = await Blog.findById(blogId);

    // Find the login user
    const loginUserId = req.user?._id;

    // Find if the user has disliked the blog
    const alreadyLiked = blog?.likes?.includes(loginUserId);
    if (alreadyLiked) {
      blog = await Blog.findByIdAndUpdate(
        blogId,
        { $pull: { likes: loginUserId }, $push: { dislikes: loginUserId } },
        { new: true }
      );
    } else {
      const alreadyDisliked = blog?.dislikes?.includes(loginUserId);
      if (alreadyDisliked) {
        blog = await Blog.findByIdAndUpdate(
          blogId,
          { $pull: { dislikes: loginUserId } },
          { new: true }
        );
      } else {
        blog = await Blog.findByIdAndUpdate(
          blogId,
          { $push: { dislikes: loginUserId } },
          { new: true }
        );
      }
    }

    res.status(200).json(blog);
  } catch (error) {
    // Handle specific errors, e.g., Mongoose errors
    throw new Error(error);
  }
});

// Controller to update blog with image URLs
const updateBlogWithImageURLs  = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { imageUrls } = req.body; // Array of Cloudinary image URLs passed from middleware

  // Ensure id is a valid MongoDB ObjectId
  validateMongoDbId(id);

  try {
    // Find the blog by its ID and update it with the image URLs
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        images: imageUrls, // Update the 'images' field with the array of image URLs
      },
      {
        new: true, // Return the updated blog
      }
    );

    // Handle case where the blog is not found
    if (!updatedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Send the updated blog as a JSON response
    res.json(updatedBlog);
  } catch (error) {
    console.error("Error in updateBlogWithImageURLs:", error);
    next(error); // Pass the error to the error-handling middleware
  }
});

module.exports = {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlogs,
  deleteBlog,
  likeBlog,
  dislikeBlog,
  updateBlogWithImageURLs ,
};
