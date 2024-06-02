const { stat } = require("fs");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid JWT token!",
    });
  }

  // verification of the token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log({ decode });

  // check if the user still exists
  const currentUser = await User.findById(decode.id);
  if (!currentUser) {
    return res.status(401).json({
      status: "fail",
      message: "The user no longer exist.",
    });
  }

  res.locals.user = currentUser;
  req.user = currentUser;
  next();
};

const createSendToken = (user, statusCode, res) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  const token = signToken(user._id);

  res.cookie("jwt", token, cookieOptions);

  // Remove password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};

exports.createUser = async (req, res) => {
  try {
    console.log(req.body);

    const user = await User.create(req.body);

    setTimeout(() => {
      createSendToken(user, 201, res);
    }, 10000);
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      user,
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(401).json({
        status: "fail",
        message: "Email or password field empty!",
      });
    }

    const user = await User.findOne({ username }).select("+password");

    if (!user || !(await user.verifyPassword(password, user.password))) {
      return res.status(401).json({
        status: "fail",
        message: "No user found with given username",
      });
    }

    createSendToken(user, 200, res);
  } catch (error) {
    console.log(error);
  }
};
