const router = require("express").Router();
const userController = require("../controllers/user.controller");
const challengeController = require("../controllers/challenge.controller");

router.post("/login-challenge", challengeController.loginChallenge);
router.post("/login-verification", challengeController.loginVerification);

router.use(userController.protect);

router.post("/register-challenge", challengeController.registerChallenge);
router.post("/register-verification", challengeController.registerVerification);

module.exports = router;
