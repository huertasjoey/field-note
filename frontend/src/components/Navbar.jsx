import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Plus } from "lucide-react";

const links = [
  { label: "Stories", to: "/#recent" },
  { label: "Culture", to: "/?category=Culture#recent" },
  { label: "Places", to: "/?category=Places#recent" },
  { label: "Ideas", to: "/?category=Ideas#recent" },
  { label: "About", to: "/about" },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
      <span aria-hidden="true" className="text-rose-300">●</span>
      <span className="font-serif">Fieldnote</span>
    </Link>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const [lastPath, setLastPath] = useState(pathname);

  // Close the mobile menu after navigating (adjusting state during render, no effect needed)
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  const linkClass = ({ isActive }) =>
    `rounded-full px-3 py-1.5 text-sm transition-colors hover:bg-white/15 ${isActive ? "bg-white/15" : ""}`;

  return (
    <header className="sticky top-0 z-40 bg-brand text-white shadow-sm">
      <nav aria-label="Main" className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) =>
            l.label === "About" ? (
              <NavLink key={l.label} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            ) : (
              <Link key={l.label} to={l.to} className="rounded-full px-3 py-1.5 text-sm transition-colors hover:bg-white/15">
                {l.label}
              </Link>
            ),
          )}
          <Link
            to="/admin/articles/new"
            className="ml-3 inline-flex items-center gap-1 rounded-full border border-white/70 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-white/15"
          >
            <Plus size={14} aria-hidden="true" /> Write a Blog
          </Link>
          <Link
            to="/#newsletter"
            className="ml-1 rounded-full bg-white px-5 py-1.5 text-sm font-medium text-brand transition-colors hover:bg-rose-100"
          >
            Subscribe
          </Link>
        </div>

        <button
          type="button"
          className="rounded-full p-2 hover:bg-white/15 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-white/20 px-4 pb-4 pt-2 md:hidden">
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="block rounded-lg px-3 py-2.5 hover:bg-white/15">
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                to="/admin/articles/new"
                className="flex items-center justify-center gap-1 rounded-full border border-white/70 px-5 py-2.5 font-medium hover:bg-white/15"
              >
                <Plus size={16} aria-hidden="true" /> Write a Blog
              </Link>
            </li>
            <li>
              <Link
                to="/#newsletter"
                className="block rounded-full bg-white px-5 py-2.5 text-center font-medium text-brand hover:bg-rose-100"
              >
                Subscribe
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

export default Navbar;
