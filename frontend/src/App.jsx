import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import CompleteProfile from "./pages/CompleteProfile";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Profile from "./pages/Profile.jsx";
import Signup from "./pages/Signup";

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
