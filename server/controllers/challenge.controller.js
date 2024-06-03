const Challenge = require("../models/challenge.model");
const User = require("../models/user.model");

const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");
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

exports.registerVerification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { credential } = req.body;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    const challenge = await Challenge.findOne({ userId });
    if (!challenge) {
      return res.status(404).json({
        status: "fail",
        message: "Challenge not found",
      });
    }

    const verificationResult = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: challenge.challenge,
      expectedOrigin: process.env.ORIGIN,
      expectedRPID: process.env.RP_ID,
    });

    if (!verificationResult.verified) {
      return res.status(401).json({
        status: "fail",
        message: "Verification failed",
      });
    }

    console.log({ regisInfo: verificationResult.registrationInfo });

    const credentialPublicKeyBuffer = Buffer.from(
      verificationResult.registrationInfo.credentialPublicKey
    );

    await User.findOneAndUpdate(
      { _id: userId },
      {
        passkey: {
          ...verificationResult.registrationInfo,
          credentialPublicKey: credentialPublicKeyBuffer,
        },
      }
    );

    res.status(200).json({
      status: "success",
      verified: verificationResult.verified,
      message: "Verification successful",
    });
  } catch (error) {
    console.error(error);
  }
};

exports.loginChallenge = async (req, res) => {
  try {
    const username = req.body.username;
    console.log(username);

    if (!username) {
      return res.status(400).json({
        status: "fail",
        message: "User ID is required",
      });
    }

    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    const options = await generateAuthenticationOptions({
      rpID: process.env.RP_ID,
    });

    await Challenge.findOneAndUpdate(
      { userId: user._id },
      { challenge: options.challenge }
    );

    res.status(200).json({
      status: "success",
      options,
    });
  } catch (error) {
    console.error(error);
  }
};

exports.loginVerification = async (req, res) => {
  try {
    const { username, credential } = req.body;
    if (!username || !credential) {
      return res.status(400).json({
        status: "fail",
        message: "Username and credential are required",
      });
    }

    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    const challenge = await Challenge.findOne({ userId: user._id });
    if (!challenge) {
      return res.status(404).json({
        status: "fail",
        message: "Challenge not found",
      });
    }

    const userObject = user.toObject();

    console.log({
      buffer: new Uint8Array(userObject.passkey.credentialPublicKey),
      original: userObject.passkey.credentialPublicKey,
    });

    const result = await verifyAuthenticationResponse({
      expectedOrigin: process.env.ORIGIN,
      expectedRPID: process.env.RP_ID,
      response: credential,
      expectedChallenge: challenge.challenge,
      authenticator: {
        ...userObject.passkey,
        credentialPublicKey: new Uint8Array(
          userObject.passkey.credentialPublicKey.buffer
        ),
      },
    });

    console.log({ result });

    if (!result.verified) {
      return res.status(401).json({
        status: "fail",
        message: "Verification failed",
      });
    }

    res.status(200).json({
      status: "success",
      verified: result.verified,
      message: "Verification successful",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};
