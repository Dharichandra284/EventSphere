import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../services/api";
import { getCurrentUser, setAuth } from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getCurrentUser()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiFetch("/users/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setAuth({ token: data.token, user: data.user });

      if (data.user?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err?.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page">
      <div className="card">
        <h1>Login</h1>
        <form onSubmit={onSubmit} className="form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          {error && (
            <div className="alert">
              <p>{error}</p>
            </div>
          )}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Logging in…" : "Login"}
          </button>


          <p className="small">
            Don’t have an account? <Link to="/signup">Sign up</Link>
          </p>

          <p className="small">
            Need admin access? Create an admin account during signup.
          </p>
        </form>
      </div>
    </section>
  );
}
