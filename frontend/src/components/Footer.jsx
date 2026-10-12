import { Link } from "react-router-dom";

const nav = [
  { label: "Stories", to: "/#recent" },
  { label: "Culture", to: "/?category=Culture#recent" },
  { label: "Places", to: "/?category=Places#recent" },
  { label: "Ideas", to: "/?category=Ideas#recent" },
  { label: "About", to: "/about" },
];

function Footer() {
  return (
    <footer className="border-t border-line bg-white/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <span aria-hidden="true" className="text-accent">●</span>
            <span className="font-serif">Fieldnote</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            Stories, culture, places and ideas worth slowing down for. Written by curious people, for curious people.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Explore</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {nav.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="transition-colors hover:text-brand">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Stay in touch</h2>
          <p className="mt-3 text-sm text-muted">A short letter, once in a while. No spam.</p>
          <Link
            to="/#newsletter"
            className="mt-3 inline-block rounded-full border border-ink px-5 py-2 text-sm font-medium transition-colors hover:bg-ink hover:text-white"
          >
            Subscribe
          </Link>
          <p className="mt-4 text-sm">
            <Link to="/admin" className="text-muted underline-offset-2 hover:text-brand hover:underline">
              Manage articles
            </Link>
          </p>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} Fieldnote. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
