import { BrowserRouter as Router, Routes, Route, Navigate, } from "react-router-dom";
import Login from './pages/auth/Login';
import StudentsHome from "./pages/students/StudentsHome";
import StudentsList from "./pages/students/StudentsList";
import StudentForm from "./pages/students/StudentForm";
import HistoryList from "./pages/students/HistoryList";
import Home from "./pages/home/Home";
import ActionsList from "./pages/students/ActionsList";
import PersonalLog from "./pages/personal/PersonalLog";
import RequireAuth from "./auth/RequireAuth";
import ActionRegister from "./pages/students/ActionRegister";

export default function App() {
  const devView = localStorage.getItem("role") === "Dev";

  return (
    <div className={devView ? "dev-color" : ""}>
      <Router>
        <Routes>
          {/* Al abrir, ir directo al login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* publicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/test" element={<ActionRegister />} />
          <Route path="/test/:student_id/newRegister" element={<ActionRegister />} />
          <Route path="/test/:student_id/:register_id" element={<ActionRegister />} />

          {/* protegidas */}
          <Route path="/students" element={<RequireAuth><StudentsHome /></RequireAuth>} />
          <Route path="/students/profiles" element={<RequireAuth><StudentsList /></RequireAuth>} />
          <Route path="/students/profiles/new" element={<RequireAuth><StudentForm /></RequireAuth>} />
          <Route path="/students/profiles/:id" element={<RequireAuth><StudentForm /></RequireAuth>} />
          <Route path="/students/profiles/:id/edit" element={<RequireAuth><StudentForm /></RequireAuth>} />
          <Route path="/students/profiles/:id/history" element={<RequireAuth><HistoryList /></RequireAuth>} />
          <Route path="/actions/:register_id" element={<RequireAuth><ActionRegister /></RequireAuth>} />
          <Route path="/students/:student_id/newRegister" element={<RequireAuth><ActionRegister /></RequireAuth>} />
          <Route path="/students/actions" element={<RequireAuth><ActionsList /></RequireAuth>} />
          <Route path="/personal" element={<RequireAuth><PersonalLog /></RequireAuth>} />

          {/* desconocidas -> login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </div>
  );
}
