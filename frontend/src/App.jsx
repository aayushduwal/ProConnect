import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import CompleteProfile from "./pages/completeprofile.jsx";
import Landing from "./pages/landing.jsx";
import Login from "./pages/login.jsx";
import Profile from "./pages/profile.jsx";
import Signup from "./pages/signup.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}
