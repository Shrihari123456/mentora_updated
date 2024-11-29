// App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginScreen from "./components/LoginScreen";
import { getAuth } from "./utils/auth";
import MentorDashboard from "./components/mentor/Dashboard";
import MentorProfile from "./components/mentor/Profile";
import ViewAllStudents from "./components/mentor/ViewAllStudents";
import ViewMentees from "./components/mentor/ViewMentees";
import AssignMentees from "./components/mentor/AssignMentee";

const App: React.FC = () => {
  const isLoggedIn = getAuth();

  return (
    <Router>
      <Routes>
        {isLoggedIn ? (
          <>
            <Route path="/mentor/dashboard" element={<MentorDashboard />} />
            <Route
              path="/student/dashboard"
              element={<h1>Welcome, Student!</h1>}
            />
            <Route path="/mentor/profile" element={<MentorProfile />} />
            <Route path="/mentor/students" element={<ViewAllStudents />} />
            <Route path="/mentor/mentees" element={<ViewMentees />} />
            <Route path="/mentor/assign-mentee" element={<AssignMentees />} />
          </>
        ) : (
          <Route path="/login" element={<LoginScreen />} />
        )}
        <Route path="*" element={<LoginScreen />} />
      </Routes>
    </Router>
  );
};

export default App;
