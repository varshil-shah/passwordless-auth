const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a username"],
    unique: true,
  },
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  passkey: {
    credentialID: String,
    credentialPublicKey: Buffer,
    counter: Number,
    transports: [String],
  },
});

userSchema.methods.verifyPassword = async function (password, hashPassword) {
  return await bcrypt.compare(password, hashPassword);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
