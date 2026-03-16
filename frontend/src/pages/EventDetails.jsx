import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { apiFetch } from "../services/api";
import {
  formatEventDate,
  formatRupee,
  getCategoryLabel,
  getEventBranding,
} from "../utils/eventPresentation";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [step, setStep] = useState("review");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchEvent = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await apiFetch(`/events/${id}`);
      setEvent(data);
    } catch (err) {
      setMessage(err?.message || "Unable to load event");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleBook = async () => {
    setMessage(null);
    setLoading(true);

    try {
      const data = await apiFetch("/bookings/book", {
        method: "POST",
        body: JSON.stringify({ eventId: id }),
      });

      const bookingId = data.booking?._id;

      if (bookingId) {
        navigate(`/booking/${bookingId}`);
      } else {
        setMessage("Booking completed, but could not find booking link.");
      }
    } catch (err) {
      setMessage(err?.message || "Unable to book event");
    } finally {
      setLoading(false);
    }
  };

  const formattedPrice = useMemo(() => {
    if (!event) return "";
    return formatRupee(event.price ?? 0);
  }, [event]);

  const branding = useMemo(() => getEventBranding(event || {}), [event]);

  if (loading && !event) {
    return (
      <section className="page">
        <div className="panel">
          <p className="hint">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="panel eventPanel">
        <div className="eventDetailHero">
          <div
            className="eventMallMark eventMallMark--large"
            style={{ background: branding.gradient }}
            aria-hidden="true"
          >
            {branding.initials}
          </div>
          <div>
            <p className="eyebrow">{event?.sourceName || "Event listing"}</p>
            <h1>{event?.title || "Event details"}</h1>
            <p className="hint">
              {event?.mallName || event?.location}
              {event?.sourceUrl ? " • Verified public listing available" : ""}
            </p>
          </div>
        </div>

        {message && <p className="alert">{message}</p>}

        <div className="eventCard eventCard--detail">
          {event?.imageUrl && (
            <div className="eventImageWrap eventImageWrap--detail">
              <img className="eventImage eventImage--detail" src={event.imageUrl} alt={event.imageAlt || event.title} />
              <span className="eventVenueBadge">{event.mallName || event.location}</span>
            </div>
          )}

          <div className="eventMetaRow">
            <span className="pill">{formatEventDate(event?.date)}</span>
            <span className="pill subtle">{getCategoryLabel(event?.category)}</span>
            <span className="pill subtle">{formattedPrice}</span>
          </div>
          <p className="meta">{event?.location}</p>
          <p className="body">{event?.description}</p>

          {event?.sourceUrl && (
            <a className="sourceLink" href={event.sourceUrl} target="_blank" rel="noreferrer">
              View original listing
            </a>
          )}

          {event?.imageCreditUrl && (
            <a className="imageCredit" href={event.imageCreditUrl} target="_blank" rel="noreferrer">
              Photo: {event.imageCreditName || "Pexels"}
            </a>
          )}

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button className="btn" onClick={() => setStep("confirm")} disabled={loading}>
              Book now
            </button>
            <Link className="btn secondary" to="/">
              Back to events
            </Link>
          </div>
        </div>

        {step === "confirm" && (
          <div className="card" style={{ marginTop: "1rem" }}>
            <h2>Confirm booking</h2>
            <p>
              You are about to book <strong>{event?.title}</strong> for {formattedPrice}.
            </p>
            <p className="hint">This will generate a QR ticket for event entry and verification.</p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button className="btn" onClick={handleBook} disabled={loading}>
                {loading ? "Booking..." : "Confirm booking"}
              </button>
              <button className="btn secondary" onClick={() => setStep("review")}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
