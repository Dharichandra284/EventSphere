const Booking = require("../models/Booking");
const QRCode = require("qrcode");
const crypto = require("crypto");

function buildTicketUrl(bookingId, ticketCode) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verifyUrl = new URL("/verify-ticket", frontendUrl);
  verifyUrl.searchParams.set("bookingId", bookingId.toString());
  verifyUrl.searchParams.set("code", ticketCode);
  return verifyUrl.toString();
}

async function ensureTicketData(booking) {
  if (booking.ticketCode && booking.qrCode) {
    return booking;
  }

  booking.ticketCode = booking.ticketCode || crypto.randomBytes(12).toString("hex");
  booking.qrCode = await QRCode.toDataURL(buildTicketUrl(booking._id, booking.ticketCode));
  await booking.save();
  return booking;
}

function canRemoveBooking(booking) {
  if (!booking?.eventId?.date) {
    return true;
  }

  const eventDate = new Date(booking.eventId.date);
  if (Number.isNaN(eventDate.getTime())) {
    return booking.verificationStatus === "verified";
  }

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return eventDate < startOfToday || booking.verificationStatus === "verified";
}

exports.bookEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Missing user" });
    }

    const booking = new Booking({
      userId,
      eventId,
      ticketCode: crypto.randomBytes(12).toString("hex"),
    });

    const qrCode = await QRCode.toDataURL(buildTicketUrl(booking._id, booking.ticketCode));
    booking.qrCode = qrCode;

    await booking.save();

    res.json({
      message: "Event Booked",
      booking: {
        _id: booking._id,
        qrCode,
        ticketCode: booking.ticketCode,
        eventId: booking.eventId,
        bookingDate: booking.bookingDate,
        verificationStatus: booking.verificationStatus,
      },
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Missing user" });
    }

    const bookings = await Booking.find({ userId }).populate("eventId").sort({ bookingDate: -1 });
    const normalizedBookings = await Promise.all(bookings.map((booking) => ensureTicketData(booking)));
    res.json(normalizedBookings);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const bookingId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "Missing user" });
    }

    const booking = await Booking.findById(bookingId).populate("eventId verifiedBy", "title date location name email role");
    if (!booking || booking.userId.toString() !== userId) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await ensureTicketData(booking);
    res.json(booking);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.verifyBooking = async (req, res) => {
  try {
    const { bookingId, code } = req.body;

    if (!req.user || !["admin", "vendor"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only staff can verify tickets" });
    }

    if (!bookingId || !code) {
      return res.status(400).json({ message: "Booking ID and ticket code are required" });
    }

    const booking = await Booking.findById(bookingId).populate(
      "eventId userId verifiedBy",
      "title date location name email role",
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await ensureTicketData(booking);

    if (booking.ticketCode !== code) {
      return res.status(400).json({ message: "Invalid ticket code" });
    }

    if (booking.verificationStatus === "verified") {
      return res.json({
        message: "Ticket already verified",
        booking,
      });
    }

    booking.verificationStatus = "verified";
    booking.verifiedAt = new Date();
    booking.verifiedBy = req.user.id;
    await booking.save();
    await booking.populate("verifiedBy", "name email role");

    res.json({
      message: "Ticket verified successfully",
      booking,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const userId = req.user?.id;
    const bookingId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "Missing user" });
    }

    const booking = await Booking.findById(bookingId).populate("eventId", "date");
    if (!booking || booking.userId.toString() !== userId) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!canRemoveBooking(booking)) {
      return res.status(400).json({
        message: "You can remove a booking only after the event is completed.",
      });
    }

    await Booking.findByIdAndDelete(bookingId);
    res.json({ message: "Booking removed from history" });
  } catch (err) {
    res.status(500).json(err);
  }
};
