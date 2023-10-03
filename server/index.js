// Import required packages and modules
const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 4000;
const db = require("./config/mongoose");
const authRouter = require("./routes/authRoute");
const productRouter = require("./routes/productRoute");
const blogRouter = require("./routes/blogRoute");
const productCategoryRouter = require("./routes/productCategoryRoute");
const blogCategoryRouter = require("./routes/blogCategoryRoute");
const brandRouter = require("./routes/brandRoute");
const couponRouter = require("./routes/couponRoute");
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const morgan = require("morgan")

// Initialize the database connection
db();

// Set up logging with Morgan
app.use(morgan('dev'))

// Parse incoming request bodies as JSON and URL-encoded data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Parse cookies
app.use(cookieParser())

// Define routes for various API endpoints
app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/blog", blogRouter);
app.use("/api/category", productCategoryRouter);
app.use("/api/blog-category", blogCategoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/coupon", couponRouter);

// Middleware for handling 404 errors
app.use(notFound);

// Middleware for handling errors and sending error responses
app.use(errorHandler);

// Start the server and listen on the specified PORT
app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});
