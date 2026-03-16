import { useEffect, useState } from "react";
import { apiFetch, apiUpload } from "../services/api";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await apiFetch("/events/all");
      setEvents(data);
    } catch (err) {
      setMessage(err?.message || "Unable to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const form = new FormData();
      form.append("title", title);
      form.append("date", date);
      form.append("location", location);
      form.append("description", description);
      if (image) form.append("image", image);

      await apiUpload("/events/create", form);
      setMessage("Event created successfully");
      setTitle("");
      setDate("");
      setLocation("");
      setDescription("");
      setImage(null);
      await fetchEvents();
    } catch (err) {
      setMessage(err?.message || "Unable to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page">
      <div className="grid">
        <div className="panel">
          <h2>Create Event</h2>
          {message && <p className="alert">{message}</p>}
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>

            <label>
              Date
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </label>

            <label>
              Location
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </label>

            <label>
              Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </label>

            <label>
              Cover Image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </label>

            <button className="btn" disabled={loading}>
              {loading ? "Creating…" : "Create Event"}
            </button>
          </form>
        </div>

        <div className="panel">
          <h2>All Events</h2>
          {loading && <p className="hint">Loading…</p>}
          {events.length === 0 ? (
            <p className="hint">No events created yet.</p>
          ) : (
            <div className="cards">
              {events.map((event) => (
                <div className="card" key={event._id}>
                  <div className="cardHeader">
                    <h3>{event.title}</h3>
                    <span className="pill">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <p className="meta">{event.location}</p>
                  <p className="body">{event.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
