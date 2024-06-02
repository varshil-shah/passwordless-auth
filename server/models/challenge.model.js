const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  challenge: {
    type: String,
    required: true,
  },
});

const Challenge = mongoose.model("Challenge", challengeSchema);

module.exports = Challenge;
