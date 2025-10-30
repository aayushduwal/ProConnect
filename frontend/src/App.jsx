import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
