import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-zinc-950/80 border-b border-white/5">
      <div className="max-w-screen-2xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="text-white text-xl font-semibold hover:opacity-90 transition"
          >
            Playoff Pick&apos;ems
          </Link>

          {/* Nav Actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-gray-300 hover:text-white transition-colors px-4 py-2"
            >
              Log In
            </Link>

            <Link
              to="/register"
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2 rounded-full transition-all hover:shadow-lg hover:shadow-emerald-500/50"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
