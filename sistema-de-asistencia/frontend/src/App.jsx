import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/auth/Login';
import StudentsHome from "./pages/students/StudentsHome";
import StudentsList from "./pages/students/StudentsList";
import StudentForm from "./pages/students/StudentForm";
import StudentDetail from "./pages/students/StudentDetail";
import HistoryList from "./pages/students/HistoryList";
import EnterRegister from "./pages/registers/EnterRegister";
import Home from "./pages/home/Home";
import ActionsList from "./pages/students/ActionsList";
import PersonalLog from "./pages/personal/PersonalLog";
import RequireAuth from "./auth/RequireAuth";
import InTest from "./pages/home/Home";

export default function App() {
  const devView = false;

  return (
    <div className={devView ? "dev-color" : ""}>
      <Router>
        <Routes>
          {/* Al abrir, ir directo al login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* publicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/test" element={<InTest />} />

          {/* protegidas */}
          <Route path="/students" element={<RequireAuth><StudentsHome /></RequireAuth>} />
          <Route path="/students/profiles" element={<RequireAuth><StudentsList /></RequireAuth>} />
          <Route path="/students/profiles/new" element={<RequireAuth><StudentForm /></RequireAuth>} />
          <Route path="/students/profiles/:id" element={<RequireAuth><StudentDetail /></RequireAuth>} />
          <Route path="/students/profiles/:id/edit" element={<RequireAuth><StudentForm /></RequireAuth>} />
          <Route path="/students/profiles/:id/history" element={<RequireAuth><HistoryList /></RequireAuth>} />
          <Route path="/actions/enter/:actionId" element={<RequireAuth><EnterForm /></RequireAuth>} />
          <Route path="/actions/enter/new" element={<RequireAuth><EnterForm /></RequireAuth>} />
          <Route path="/students/actions" element={<RequireAuth><ActionsList /></RequireAuth>} />
          <Route path="/personal" element={<RequireAuth><PersonalLog /></RequireAuth>} />

          {/* desconocidas -> login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </div>
  );
}
