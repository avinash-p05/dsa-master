import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="card empty">
      <p>That page doesn&apos;t exist.</p>
      <Link className="btn" to="/">
        Back to the roadmap
      </Link>
    </div>
  );
}
