const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 4000;
const db = require("./config/mongoose");
const authRouter = require("./routes/authRoute");
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser");
const { notFound,errorHandler } = require("./middlewares/errorHandler");
db();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser())

app.use("/api/user", authRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});
