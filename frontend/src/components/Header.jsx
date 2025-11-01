import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Header() {
  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-[540px] mx-auto flex justify-between items-center px-3 py-3">
        {/* Left side: Logo + Site Name */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="ProConnect Logo"
            className="h-6 w-6 rounded-lg object-cover"
          />
          <span className="text-black font-bold text-lg flex items-center">
            ProConnect
          </span>
        </Link>

        {/* Right side: Links + Buttons */}
        <div className="flex items-center gap-4 text-xs">
          <a
            href="#scroll"
            className="text-black hover:text-black flex items-center h-6 leading-none"
          >
            Scroll
          </a>
          <a
            href="#jobs"
            className="text-black hover:text-black flex items-center h-6 leading-none"
          >
            Jobs
          </a>
          <a
            href="#launchpad"
            className="text-black hover:text-black flex items-center h-6 leading-none"
          >
            Launchpad
          </a>
          <Link
            to="/login"
            className="px-2 py-1 border rounded-lg text-black hover:text-black flex items-center h-6 leading-none"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="px-2 py-1 bg-green-600 text-white rounded-lg hover:text-white flex items-center h-6 leading-none"
          >
            Create Profile
          </Link>
        </div>
      </div>
    </nav>
  );
}
