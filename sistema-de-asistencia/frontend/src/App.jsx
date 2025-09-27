import React from 'react';
import AdminLogin from './pages/auth/AdminLogin';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import StudentsList   from "./pages/students/StudentsList";
import StudentForm    from "./pages/students/StudentForm";
import StudentDetail  from "./pages/students/StudentDetail";
import HistoryList    from "./pages/students/HistoryList";
import HistoryDetail  from "./pages/students/HistoryDetail";

export default function App() {
  const isAuth = true; // por ahora, cuando Ion cierre login, reemplazar por estado real

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />

        <Route path="/students" element={isAuth ? <StudentsList /> : <Navigate to="/login" />} />
        <Route path="/students/new" element={isAuth ? <StudentForm /> : <Navigate to="/login" />} />
        <Route path="/students/:id" element={isAuth ? <StudentDetail /> : <Navigate to="/login" />} />
        <Route path="/students/:id/edit" element={isAuth ? <StudentForm /> : <Navigate to="/login" />} />

        <Route path="/students/:id/history" element={isAuth ? <HistoryList /> : <Navigate to="/login" />} />
        <Route path="/actions/:actionId" element={isAuth ? <HistoryDetail /> : <Navigate to="/login" />} />

        <Route path="*" element={<Navigate to="/students" replace />} />
      </Routes>
    </Router>
  );
}
