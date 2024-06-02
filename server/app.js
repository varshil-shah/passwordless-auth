const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const userRouter = require("./routes/user.routes");

const app = express();

app.use(cors());
app.options("*", cors());

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(morgan("dev"));

app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

module.exports = app;
