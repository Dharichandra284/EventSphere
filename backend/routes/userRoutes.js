const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const { signup, login, me } = require("../controllers/userController");

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", auth, me);

module.exports = router;
