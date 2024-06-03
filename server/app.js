const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const userRouter = require("./routes/user.routes");
const challengeRouter = require("./routes/challenge.routes");

const app = express();

app.use(cors());
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).end("Welcome to PasswordLess Authentication API");
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/challenges", challengeRouter);

app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: "Endpoint not found!",
  });
});

module.exports = app;
