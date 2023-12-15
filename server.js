require("dotenv").config();
require("express-async-errors");
const express = require("express");

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const rateLimiter = require("express-rate-limit");
const cors = require("cors");

const connectDB = require("./src/db/connect");
const errorHandlerMiddleware = require("./src/middleware/error-handler");
const notFound = require("./src/middleware/not-found");

const authRoutes = require("./src/routes/authRoutes");
const taskRoutes = require("./src/routes/taskRoutes");
const userRoutes = require("./src/routes/userRoutes");
const app = express();

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(cors());

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser(process.env.JWT_SECRET));
// app.use(express.static("./public"));

app.get("/", (req, res) => {
  res.send("Todo app for users");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/users", userRoutes);

app.use(notFound);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3500;

const start = async () => {
  try {
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
