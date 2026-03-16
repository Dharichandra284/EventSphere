const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const eventRoutes = require("./routes/eventRoutes");
const userRoutes = require("./routes/userRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

app.use(cors());
app.use(express.json());

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://harshaharish284:Harish1006@ac-f10ng7k-shard-00-00.xdnrbvq.mongodb.net:27017,ac-f10ng7k-shard-00-01.xdnrbvq.mongodb.net:27017,ac-f10ng7k-shard-00-02.xdnrbvq.mongodb.net:27017/EventManagement?ssl=true&replicaSet=atlas-owzsgs-shard-0&authSource=admin&appName=Cluster0";

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected");

    const Event = require("./models/Event");
    const sampleEvents = require("./data/sampleEvents.json");

    await Promise.all(
      sampleEvents.map((event) =>
        Event.updateOne(
          { sourceId: event.sourceId },
          { $set: event },
          { upsert: true },
        ),
      ),
    );

    console.log(`Synced ${sampleEvents.length} curated events`);
  })
  .catch((err) => console.log("MongoDB error:", err));

app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);

app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(__dirname, "../frontend/public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
