const router = require("express").Router();
const userController = require("../controllers/user.controller");
const challengeController = require("../controllers/challenge.controller");

router.use(userController.protect);

router.post("/register-challenge", challengeController.registerChallenge);

module.exports = router;
