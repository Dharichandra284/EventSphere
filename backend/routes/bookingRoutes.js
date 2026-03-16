const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const {
  bookEvent,
  getMyBookings,
  getBookingById,
  verifyBooking,
  deleteBooking,
} = require("../controllers/bookingController");

router.post("/book", auth, bookEvent);
router.post("/verify", auth, verifyBooking);
router.get("/mine", auth, getMyBookings);
router.delete("/:id", auth, deleteBooking);
router.get("/:id", auth, getBookingById);

module.exports = router;
