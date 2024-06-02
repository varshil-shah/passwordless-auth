const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const userRouter = require("./routes/user.routes");
const challengeRouter = require("./routes/challenge.routes");

const app = express();

app.use(cors());
app.options("*", cors());

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(morgan("dev"));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/challenges", challengeRouter);

app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: "Endpoint not found!",
  });
});

module.exports = app;
