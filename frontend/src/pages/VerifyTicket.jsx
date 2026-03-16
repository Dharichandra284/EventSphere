import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiFetch } from "../services/api";

export default function VerifyTicket() {
  const [searchParams] = useSearchParams();
  const [bookingId, setBookingId] = useState(searchParams.get("bookingId") || "");
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [result, setResult] = useState(null);

  const handleVerify = async (nextBookingId = bookingId, nextCode = code) => {
    setLoading(true);
    setMessage(null);
    setResult(null);

    try {
      const data = await apiFetch("/bookings/verify", {
        method: "POST",
        body: JSON.stringify({
          bookingId: nextBookingId,
          code: nextCode,
        }),
      });

      setMessage(data.message || "Ticket verified successfully");
      setResult(data.booking || null);
    } catch (err) {
      setMessage(err?.message || "Unable to verify ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const nextBookingId = searchParams.get("bookingId") || "";
    const nextCode = searchParams.get("code") || "";

    setBookingId(nextBookingId);
    setCode(nextCode);

    if (nextBookingId && nextCode) {
      void handleVerify(nextBookingId, nextCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <section className="page">
      <div className="card">
        <h1>Verify Ticket</h1>
        <p className="hint">Scan the booking QR or paste the booking details below to verify check-in.</p>

        <div className="form">
          <label>
            Booking ID
            <input value={bookingId} onChange={(e) => setBookingId(e.target.value)} />
          </label>
          <label>
            Ticket Code
            <input value={code} onChange={(e) => setCode(e.target.value)} />
          </label>
          <button
            className="btn"
            onClick={() => handleVerify()}
            disabled={loading || !bookingId || !code}
          >
            {loading ? "Verifying..." : "Verify ticket"}
          </button>
        </div>

        {message && <p className={result ? "hint" : "alert"}>{message}</p>}

        {result && (
          <div className="card" style={{ marginTop: "1rem" }}>
            <div className="cardHeader">
              <h3>{result.eventId?.title || "Event"}</h3>
              <span className="pill">
                {result.verificationStatus === "verified" ? "Verified" : "Pending"}
              </span>
            </div>
            <p className="meta">Attendee: {result.userId?.name || "Unknown attendee"}</p>
            <p className="meta">Email: {result.userId?.email || "No email"}</p>
            <p className="meta">Location: {result.eventId?.location || "No location"}</p>
            <p className="meta">
              Event date:{" "}
              {result.eventId?.date ? new Date(result.eventId.date).toLocaleDateString() : "Unknown"}
            </p>
            <p className="meta">
              Verified at:{" "}
              {result.verifiedAt ? new Date(result.verifiedAt).toLocaleString() : "Not verified yet"}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
