const Event = require("../models/Event");

exports.createEvent = async (req, res) => {
  try {
    const event = new Event({
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      location: req.body.location,
      category: req.body.category || "other",
      price: Number(req.body.price) || 0,
      image: req.file?.filename,
      imageUrl: req.body.imageUrl || "",
      imageAlt: req.body.imageAlt || "",
      imageCreditName: req.body.imageCreditName || "",
      imageCreditUrl: req.body.imageCreditUrl || "",
      mallName: req.body.mallName || "",
      mallSlug: req.body.mallSlug || "",
      sourceName: req.body.sourceName || "Internal",
      sourceUrl: req.body.sourceUrl || "",
      isExternalListing: Boolean(req.body.sourceUrl),
    });

    await event.save();

    res.json({ message: "Event Created", event });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getEvents = async (req, res) => {
  try {
    const filter = {};
    const { category } = req.query;
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (category) {
      filter.category = category;
    }

    const events = await Event.find(filter).sort({ date: 1 });
    const upcomingEvents = events.filter((event) => {
      if (!event.date) return false;
      const eventDate = new Date(event.date);
      return !Number.isNaN(eventDate.getTime()) && eventDate >= startOfToday;
    });
    res.json(upcomingEvents);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json(err);
  }
};
