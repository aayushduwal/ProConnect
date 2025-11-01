import { useState } from "react";
import logo from "../assets/logo.png";
import Header from "../components/Header";

export default function Landing() {
  const [username, setUsername] = useState("");
  const [available, setAvailable] = useState(null);

  const checkUsername = () => {
    if (!username) return setAvailable(null);
    setAvailable(username !== "aayushduwal");
  };

  return (
    <div className="min-h-screen w-full bg-white text-gray-800 flex flex-col items-center">
      {/* Header */}
      <Header />
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
