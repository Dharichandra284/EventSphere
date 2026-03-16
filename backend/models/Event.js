const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    sourceId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    title: String,
    description: String,
    date: String,
    location: String,
    category: {
      type: String,
      enum: ["sports", "music", "dance", "food", "other"],
      default: "other",
    },
    price: {
      type: Number,
      default: 0,
    },
    image: String,
    imageUrl: String,
    imageAlt: String,
    imageCreditName: String,
    imageCreditUrl: String,
    mallName: String,
    mallSlug: String,
    sourceName: String,
    sourceUrl: String,
    isExternalListing: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Event",eventSchema);
