import { BrowserRouter as Router, Routes, Route, Navigate, } from "react-router-dom";
import Login from './pages/auth/Login';
import StudentsHome from "./pages/students/StudentsHome";
import StudentsHomeVisitor from "./pages/students/StudentsHomeVisitor";
import StudentsList from "./pages/students/StudentsList";
import StudentsListVisitor from "./pages/students/StudentsListVisitor";
import StudentForm from "./pages/students/StudentForm";
import HistoryList from "./pages/students/HistoryList";
import Home from "./pages/home/Home";
import ActionsList from "./pages/students/ActionsList";
import ActionsListVisitor from "./pages/students/ActionsListVisitor";
import PersonalLog from "./pages/personal/PersonalLog";
import Profile from "./pages/personal/Profile";
import RequireAuth from "./auth/RequireAuth";
import ActionRegister from "./pages/students/ActionRegister";
import VisitorsHome from "./pages/visitors/VisitorsHome";
import VisitorsList from "./pages/visitors/VisitorsList";
import TempHome from "./pages/home/TempHome";
import GlobalLogs from "./pages/generallog/GlobalLog";
import GlobalLogDetail from "./pages/generallog/GlobalLogDetail";

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
          <Route path="/studentsVisitorView" element={<RequireAuth><StudentsHomeVisitor /></RequireAuth>} />
          <Route path="/studentsVisitorView/profiles" element={<RequireAuth><StudentsListVisitor /></RequireAuth>} />
          <Route path="/students/profiles" element={<RequireAuth><StudentsList /></RequireAuth>} />
          <Route path="/students/profiles/new" element={<RequireAuth><StudentForm /></RequireAuth>} />
          <Route path="/students/profiles/:id" element={<RequireAuth><StudentForm /></RequireAuth>} />
          <Route path="/students/profiles/:id/edit" element={<RequireAuth><StudentForm /></RequireAuth>} />
          <Route path="/students/profiles/:id/history" element={<RequireAuth><HistoryList /></RequireAuth>} />
          <Route path="/actions/:register_id" element={<RequireAuth><ActionRegister /></RequireAuth>} />
          <Route path="/students/:student_id/newRegister" element={<RequireAuth><ActionRegister /></RequireAuth>} />
          <Route path="/students/actions" element={<RequireAuth><ActionsList /></RequireAuth>} />
          <Route path="/studentsVisitorView/actions" element={<RequireAuth><ActionsListVisitor /></RequireAuth>} />
          <Route path="/personal/log" element={<RequireAuth><PersonalLog /></RequireAuth>} />
          <Route path="/personal" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/users" element={<RequireAuth><VisitorsHome /></RequireAuth>} />
          <Route path="/users/visitors" element={<RequireAuth><VisitorsList /></RequireAuth>} />
          <Route path="/generallog" element={<RequireAuth><GlobalLogs /></RequireAuth>} />
          <Route path="/generallog/detail" element={<RequireAuth><GlobalLogDetail /></RequireAuth>} />

          <Route path="/home/visitor" element={<RequireAuth><TempHome /></RequireAuth>} />

          {/* desconocidas -> login */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Router>
    </div>
  );
}
