const express = require("express");
const {createBlog,updateBlog,getBlog,getAllBlogs,deleteBlog,likeBlog,dislikeBlog} = require("../controllers/blogCtrl")
const {isAdmin,authMiddleware} = require("../middlewares/authMiddleware")


const router = express.Router()


//Create new blog
router.post("/",authMiddleware,isAdmin,createBlog)

//like blog
router.put("/like",authMiddleware,likeBlog)

//dislike blog
router.put("/dislike",authMiddleware,dislikeBlog)

//Update blog
router.put("/:id",authMiddleware,isAdmin,updateBlog)

//get a blog
router.get("/:id",authMiddleware,getBlog)

//get all blogs
router.get("/",authMiddleware,getAllBlogs)


//delete blog
router.delete("/:id",authMiddleware,isAdmin,deleteBlog)





module.exports = router;