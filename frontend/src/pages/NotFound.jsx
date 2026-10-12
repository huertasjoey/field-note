import { Link } from "react-router-dom";

function NotFound({ message = "The page you're looking for doesn't exist or has moved." }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-accent">404</p>
      <h1 className="mt-3 font-serif text-4xl font-bold">Page not found</h1>
      <p className="mt-4 text-muted">{message}</p>
      <Link
        to="/"
        className="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand"
      >
        Back to homepage
      </Link>
    </div>
  );
}

export default NotFound;
