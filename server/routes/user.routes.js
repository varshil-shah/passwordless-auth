const router = require("express").Router();
const userController = require("../controllers/user.controller");

router.post("/register", userController.createUser);
router.post("/login", userController.loginUser);

router.use(userController.protect);

router.get("/", userController.getUser);

module.exports = router;
