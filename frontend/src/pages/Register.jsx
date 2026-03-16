import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../services/api";
import { getCurrentUser, setAuth } from "../utils/auth";

const ROLES = [
  { value: "user", label: "User" },
  { value: "vendor", label: "Vendor" },
  { value: "admin", label: "Admin" },
];

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getCurrentUser()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiFetch("/users/signup", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          adminSecret: role === "admin" ? secret : undefined,
          vendorSecret: role === "vendor" ? secret : undefined,
        }),
      });

      setAuth({ token: data.token, user: data.user });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.message || "Unable to sign up");
    } finally {
      setLoading(false);
    }
  };

  const needsSecret = role === "admin" || role === "vendor";

  return (
    <section className="page">
      <div className="card">
        <h1>Create account</h1>
        <form onSubmit={handleSubmit} className="form">
          <label>
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </label>

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
              autoComplete="new-password"
            />
          </label>

          <label>
            Account type
            <select value={role} onChange={(e) => setRole(e.target.value)} className="role-select">
              {ROLES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          {needsSecret && (
            <label>
              {role === "admin" ? "Admin" : "Vendor"} secret
              <input
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                required
                type="password"
              />
            </label>
          )}

          {error && <p className="alert">{error}</p>}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </button>

          <p className="small">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
