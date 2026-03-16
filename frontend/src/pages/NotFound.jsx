import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="page centered">
      <div className="card">
        <h1>404</h1>
        <p>Page not found.</p>
        <Link className="btn" to="/">
          Go Home
        </Link>
      </div>
    </section>
  );
}
