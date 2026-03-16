import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../services/api";

function formatRupee(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);
}

export default function BookingDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      setMessage(null);

      try {
        const data = await apiFetch(`/bookings/${id}`);
        setBooking(data);
      } catch (err) {
        setMessage(err?.message || "Unable to load booking");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const verificationLabel = useMemo(() => {
    if (!booking) return "Pending";
    return booking.verificationStatus === "verified" ? "Verified" : "Pending";
  }, [booking]);

  if (loading && !booking) {
    return (
      <section className="page">
        <p className="hint">Loading booking...</p>
      </section>
    );
  }

  const event = booking?.eventId;

  return (
    <section className="page">
      <div className="panel">
        <h1>Booking Details</h1>

        {message && <p className="alert">{message}</p>}

        {booking ? (
          <div className="card">
            <div className="cardHeader">
              <h3>{event?.title || "Event"}</h3>
              <span className="pill">{new Date(booking.bookingDate).toLocaleDateString()}</span>
            </div>

            <p className="meta">Location: {event?.location}</p>
            <p className="meta">Category: {event?.category}</p>
            <p className="meta">Price: {formatRupee(event?.price ?? 0)}</p>
            <p className="meta">Ticket code: {booking.ticketCode}</p>
            <p className="meta">Status: {verificationLabel}</p>
            {booking.verifiedAt && (
              <p className="meta">Verified at: {new Date(booking.verifiedAt).toLocaleString()}</p>
            )}

            <p className="body">{event?.description}</p>

            {booking.qrCode && (
              <div style={{ textAlign: "center" }}>
                <h2>QR Ticket</h2>
                <p className="hint">Show this QR code at the event entrance for verification.</p>
                <img
                  src={booking.qrCode}
                  alt="Booking QR code"
                  style={{ maxWidth: "260px", margin: "1rem auto", display: "block" }}
                />
                <a className="btn" href={booking.qrCode} download={`event-ticket-${booking._id}.png`}>
                  Download QR
                </a>
              </div>
            )}

            <p style={{ marginTop: "1rem" }}>
              <Link to="/bookings">Back to booking history</Link>
            </p>
          </div>
        ) : (
          <p className="hint">Booking not found.</p>
        )}
      </div>
    </section>
  );
}
