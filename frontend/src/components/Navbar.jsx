import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Plus, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

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
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }
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
          {user && links.map((l) =>
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
          {isAdmin && (
            <>
              <Link to="/admin" className="ml-2 rounded-full px-3 py-1.5 text-sm transition-colors hover:bg-white/15">
                Manage
              </Link>
              <Link
                to="/admin/articles/new"
                className="ml-1 inline-flex items-center gap-1 rounded-full border border-white/70 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-white/15"
              >
                <Plus size={14} aria-hidden="true" /> Upload Blog
              </Link>
            </>
          )}
          {user ? (
            <>
              <span className="ml-2 max-w-32 truncate text-sm text-white/90" title={user.email}>
                {user.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-1 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition-colors hover:bg-white/15"
              >
                <LogOut size={14} aria-hidden="true" /> Log out
              </button>
            </>
          ) : (
            <Link to="/login" className="ml-2 rounded-full px-3 py-1.5 text-sm transition-colors hover:bg-white/15">
              Log in
            </Link>
          )}
          {user && (
          <Link
            to="/#newsletter"
            className="ml-1 rounded-full bg-white px-5 py-1.5 text-sm font-medium text-brand transition-colors hover:bg-rose-100"
          >
            Subscribe
          </Link>
          )}
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
            {user && links.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="block rounded-lg px-3 py-2.5 hover:bg-white/15">
                  {l.label}
                </Link>
              </li>
            ))}
            {isAdmin && (
              <>
                <li>
                  <Link to="/admin" className="block rounded-lg px-3 py-2.5 hover:bg-white/15">
                    Manage articles
                  </Link>
                </li>
                <li className="pt-2">
                  <Link
                    to="/admin/articles/new"
                    className="flex items-center justify-center gap-1 rounded-full border border-white/70 px-5 py-2.5 font-medium hover:bg-white/15"
                  >
                    <Plus size={16} aria-hidden="true" /> Upload Blog
                  </Link>
                </li>
              </>
            )}
            <li className={isAdmin ? "" : "pt-2"}>
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-1 rounded-lg px-3 py-2.5 hover:bg-white/15"
                >
                  <LogOut size={16} aria-hidden="true" /> Log out ({user.name})
                </button>
              ) : (
                <Link to="/login" className="block rounded-lg px-3 py-2.5 text-center hover:bg-white/15">
                  Log in
                </Link>
              )}
            </li>
            {user && (
              <li>
                <Link
                  to="/#newsletter"
                  className="block rounded-full bg-white px-5 py-2.5 text-center font-medium text-brand hover:bg-rose-100"
                >
                  Subscribe
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}

export default Navbar;
