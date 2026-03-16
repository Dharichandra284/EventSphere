import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../services/api";
import { formatEventDate, formatRupee, getCategoryLabel } from "../utils/eventPresentation";

function canRemoveBooking(booking) {
  if (booking.verificationStatus === "verified") {
    return true;
  }

  if (!booking.eventId?.date) {
    return true;
  }

  const eventDate = new Date(booking.eventId.date);
  if (Number.isNaN(eventDate.getTime())) {
    return false;
  }

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return eventDate < startOfToday;
}

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setMessage(null);

      try {
        const data = await apiFetch("/bookings/mine");
        setBookings(data);
      } catch (err) {
        setMessage(err?.message || "Unable to load booking history");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const orderedBookings = useMemo(
    () =>
      [...bookings].sort(
        (a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime(),
      ),
    [bookings],
  );

  const handleRemove = async (bookingId) => {
    setActionId(bookingId);
    setMessage(null);

    try {
      const response = await apiFetch(`/bookings/${bookingId}`, { method: "DELETE" });
      setBookings((current) => current.filter((booking) => booking._id !== bookingId));
      setMessage(response?.message || "Booking removed from history");
    } catch (err) {
      setMessage(err?.message || "Unable to remove booking");
    } finally {
      setActionId(null);
    }
  };

  return (
    <section className="page">
      <div className="panel eventPanel">
        <h1>Booking History</h1>
        <p className="hint">
          Completed events can be removed from your history, while active bookings stay available for ticket access.
        </p>

        {loading && <p className="hint">Loading booking history...</p>}
        {message && <p className={message.includes("removed") ? "success" : "alert"}>{message}</p>}

        {!loading && orderedBookings.length === 0 ? (
          <div className="card">
            <h3>No bookings yet</h3>
            <p className="hint">Book an event from the events page and your ticket will appear here.</p>
            <Link className="btn" to="/">
              Browse events
            </Link>
          </div>
        ) : (
          <div className="eventGrid">
            {orderedBookings.map((booking) => {
              const removable = canRemoveBooking(booking);

              return (
                <div className="eventCard" key={booking._id}>
                  <div className="cardHeader">
                    <h3>{booking.eventId?.title || "Event"}</h3>
                    <span className="pill">
                      {booking.verificationStatus === "verified" ? "Verified" : "Active"}
                    </span>
                  </div>

                  <div className="eventMetaRow">
                    <span className="pill subtle">{formatEventDate(booking.eventId?.date)}</span>
                    <span className="pill subtle">
                      {getCategoryLabel(booking.eventId?.category)}
                    </span>
                    <span className="pill subtle">{formatRupee(booking.eventId?.price ?? 0)}</span>
                  </div>

                  <p className="meta">Booked on {formatEventDate(booking.bookingDate)}</p>
                  <p className="meta">{booking.eventId?.location}</p>
                  <p className="body">{booking.eventId?.description}</p>

                  <div className="bookingActions">
                    <Link className="btn" to={`/booking/${booking._id}`}>
                      View ticket
                    </Link>
                    <button
                      className="btn secondary"
                      onClick={() => handleRemove(booking._id)}
                      disabled={!removable || actionId === booking._id}
                      title={
                        removable
                          ? "Remove this completed booking from history"
                          : "You can remove it after the event is completed"
                      }
                    >
                      {actionId === booking._id ? "Removing..." : "Remove booking"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
