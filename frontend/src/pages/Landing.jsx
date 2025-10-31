import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Landing() {
  const [username, setUsername] = useState("");
  const [available, setAvailable] = useState(null);

  const checkUsername = () => {
    if (!username) return setAvailable(null);
    setAvailable(username !== "aayushduwal");
  };

  return (
    <div className="min-h-screen w-full bg-white text-gray-800 flex flex-col items-center">
      {/* Navbar */}
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

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-3 py-10 bg-white w-full">
        <div className="max-w-[400px] mx-auto w-full">
          {/* Heading and description - narrower */}
          <div className="max-w-[530px] mx-auto w-full">
            <h1 className="text-2xl md:text-3xl leading-tight">
              <span className="font-serif italic">
                The Professional Network
              </span>{" "}
              <br />
              <span className="font-serif">for builders to show & tell!</span>
            </h1>
            <p className="text-gray-500 mt-3 text-sm">
              Showcase your work, launch projects, find jobs, and connect with
              incredible people.
            </p>
          </div>

          {/* Username Input(Input Wrapper) - even narrower */}
          <div className="max-w-[400px] mx-auto w-full mt-5">
            <div className="flex items-center border border-gray-200 rounded-lg shadow-sm overflow-hidden w-full bg-white focus-within:ring-2 focus-within:ring-green-500">
              {/* Left Icon */}
              <div className="flex items-center gap-2 bg-white px-3 flex-shrink-0">
                {/* Logo image */}
                <img
                  src={logo}
                  alt="ProConnect Logo"
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="text-sm text-black font-medium">
                  proconnect.io/
                </span>
              </div>
              {/* Input */}
              <input
                type="text"
                placeholder="username"
                className="flex-1 outline-none px-2 py-1.5 text-sm bg-white text-black min-w-0"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {/* Button */}
              <button
                onClick={checkUsername}
                className="bg-gray-400 text-white px-3 text-sm rounded-r-lg "
              >
                →
              </button>
            </div>

            {available === true && (
              <p className="text-green-600 mt-2 text-xs">
                It's available... this username is available! 😃
              </p>
            )}
            {available === false && (
              <p className="text-red-500 mt-2 text-xs">
                This username is already taken. 😐
              </p>
            )}

            <p className="text-gray-400 mt-2 text-xs">
              Claim your username before it's too late!
            </p>
          </div>

          {/* Avatars - full width */}
          <div className="mt-8 grid grid-cols-8 gap-2 justify-center">
            {Array.from({ length: 32 }).map((_, i) => (
              <div key={i} className="w-8 h-8 bg-gray-200 rounded-full"></div>
            ))}
          </div>
          <p className="text-gray-500 mt-3 text-xs">
            162,105+ peers and counting...
          </p>
        </div>
      </section>
    </div>
  );
}
