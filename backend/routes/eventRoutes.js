const express = require("express");
const router = express.Router();

const upload = require("../config/multer");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminmiddleware");

const { createEvent, getEvents, getEvent } = require("../controllers/eventController");

router.post("/create", auth, admin, upload.single("image"), createEvent);

router.get("/all", getEvents);
router.get("/:id", auth, getEvent);

module.exports = router;
