const Challenge = require("../models/challenge.model");
const User = require("../models/user.model");

const { generateRegistrationOptions } = require("@simplewebauthn/server");
const { isoUint8Array } = require("@simplewebauthn/server/helpers");

exports.registerChallenge = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    console.log({ user });

    const challengePayload = await generateRegistrationOptions({
      rpID: process.env.RP_ID,
      rpName: process.env.RP_NAME,
      userID: isoUint8Array.fromUTF8String(user.username),
      userName: user.username,
      userDisplayName: user.name,
    });

    const challenge = await Challenge.findOne({ userId });
    if (!challenge) {
      await Challenge.create({
        userId,
        challenge: challengePayload.challenge,
      });
    } else {
      await Challenge.findOneAndUpdate(
        { userId },
        { challenge: challengePayload.challenge }
      );
    }

    res.status(200).json({
      status: "success",
      options: challengePayload,
    });
  } catch (error) {
    console.error(error);
  }
};
