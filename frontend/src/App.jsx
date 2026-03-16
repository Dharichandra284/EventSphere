import { useEffect, useMemo, useState } from "react";
import { Link, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser, logout } from "./utils/auth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EventDetails from "./pages/EventDetails";
import BookingDetails from "./pages/BookingDetails";
import BookingHistory from "./pages/BookingHistory";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import VerifyTicket from "./pages/VerifyTicket";
import "./App.css";

function App() {
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const handle = () => setUser(getCurrentUser());
    window.addEventListener("authChanged", handle);
    return () => window.removeEventListener("authChanged", handle);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const navContent = useMemo(() => {
    if (!user) {
      return (
        <>
          <Link className="navLink" to="/login">
            Login
          </Link>
          <Link className="navLink" to="/signup">
            Sign Up
          </Link>
        </>
      );
    }

    return (
      <>
        <Link className="navLink" to="/">
          Events
        </Link>
        <span className="navItem">Hello, {user.name}</span>
        <Link className="navLink" to="/bookings">
          Booking History
        </Link>
        {["admin", "vendor"].includes(user.role) && (
          <Link className="navLink" to="/verify-ticket">
            Verify Ticket
          </Link>
        )}
        {user.role === "admin" && (
          <Link className="navLink" to="/admin">
            Admin
          </Link>
        )}
        <button className="navButton" onClick={handleLogout}>
          Logout
        </button>
      </>
    );
  }, [user]);

  return (
    <div className="app">
      <header className="appHeader">
        <div className="brand">
          <span className="brand__dot" />
          <span className="brand__name">EventSphere</span>
        </div>
        <nav className="nav">{navContent}</nav>
      </header>

      <main className="main">
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute user={user}>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/events/:id"
            element={
              <PrivateRoute user={user}>
                <EventDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/booking/:id"
            element={
              <PrivateRoute user={user}>
                <BookingDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <PrivateRoute user={user}>
                <BookingHistory />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route
            path="/verify-ticket"
            element={
              <StaffRoute user={user}>
                <VerifyTicket />
              </StaffRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute user={user}>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="footer">
        <span>© {new Date().getFullYear()} EventSphere</span>
      </footer>
    </div>
  );
}

function PrivateRoute({ children, user }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children, user }) {
  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;
  return children;
}

function StaffRoute({ children, user }) {
  if (!user) return <Navigate to="/login" replace />;
  if (!["admin", "vendor"].includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default App;
