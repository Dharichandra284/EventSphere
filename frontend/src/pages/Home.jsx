import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import {
  formatEventDate,
  formatRupee,
  getCategoryLabel,
  getEventBranding,
} from "../utils/eventPresentation";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "music", label: "Music" },
  { key: "sports", label: "Sports" },
  { key: "dance", label: "Dance" },
  { key: "food", label: "Food" },
  { key: "other", label: "Lifestyle" },
];

export default function Home() {
  const [events, setEvents] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [category, setCategory] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      setBusy(true);
      setMessage(null);

      try {
        const data = await apiFetch(`/events/all${category !== "all" ? `?category=${category}` : ""}`);
        setEvents(data);
      } catch (err) {
        setMessage(err?.message || "Unable to load events");
      } finally {
        setBusy(false);
      }
    };

    fetchEvents();
  }, [category]);

  const upcomingEvents = useMemo(() => events || [], [events]);
  const featuredEvent = upcomingEvents[0] || null;

  return (
    <section className="page">
      <div className="panel eventPanel">
        <div className="eventHero">
          <div>
            <p className="eyebrow">Upcoming mall events</p>
            <h1>Discover verified events near you</h1>
            <p className="hint">
              Browse more verified event listings pulled from public ticketing pages and upcoming venue schedules.
            </p>
          </div>
          {featuredEvent && (
            <div className="featureCard">
              <span className="pill">Next up</span>
              <h2>{featuredEvent.title}</h2>
              <p className="meta">{formatEventDate(featuredEvent.date)}</p>
              <p className="meta">{featuredEvent.mallName || featuredEvent.location}</p>
              <button className="btn" onClick={() => navigate(`/events/${featuredEvent._id}`)}>
                Explore featured event
              </button>
            </div>
          )}
        </div>

        <div className="tabs">
          {CATEGORIES.map((item) => (
            <button
              key={item.key}
              className={`tab ${category === item.key ? "active" : ""}`}
              onClick={() => setCategory(item.key)}
              disabled={busy}
            >
              {item.label}
            </button>
          ))}
        </div>

        {busy && <p className="hint">Loading events...</p>}
        {message && <p className="alert">{message}</p>}

        {upcomingEvents.length === 0 && !busy ? (
          <p className="hint">No upcoming events found. Check back later.</p>
        ) : (
          <div className="eventGrid">
            {upcomingEvents.map((event) => {
              const branding = getEventBranding(event);

              return (
                <div className="eventCard" key={event._id}>
                  <div className="eventImageWrap">
                    {event.imageUrl ? (
                      <img
                        className="eventImage"
                        src={event.imageUrl}
                        alt={event.imageAlt || event.title}
                      />
                    ) : (
                      <div
                        className="eventMallMark eventImageFallback"
                        style={{ background: branding.gradient }}
                        aria-hidden="true"
                      >
                        {branding.initials}
                      </div>
                    )}
                    <span className="pill eventDatePill">{formatEventDate(event.date)}</span>
                    <span className="eventVenueBadge">{branding.venue}</span>
                  </div>

                  <div className="eventCard__top">
                    <div className="eventCard__title">
                      <p className="eyebrow">{event.sourceName || "Listing"}</p>
                      <h3>{event.title}</h3>
                      <p className="meta">{branding.venue}</p>
                    </div>
                  </div>

                  <div className="eventMetaRow">
                    <span className="pill subtle">{getCategoryLabel(event.category)}</span>
                    <span className="pill subtle">{formatRupee(event.price ?? 0)}</span>
                  </div>

                  <p className="body">{event.description}</p>

                  <div className="eventSource">
                    <span className="hint">Source: {event.sourceName || "Internal listing"}</span>
                    {event.sourceUrl && (
                      <a
                        className="sourceLink"
                        href={event.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open listing
                      </a>
                    )}
                  </div>

                  {event.imageCreditUrl && (
                    <a
                      className="imageCredit"
                      href={event.imageCreditUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Photo: {event.imageCreditName || "Pexels"}
                    </a>
                  )}

                  <button
                    className="btn"
                    onClick={() => navigate(`/events/${event._id}`)}
                    disabled={busy}
                  >
                    Book for {formatRupee(event.price ?? 0)}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
