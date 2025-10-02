import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/auth/Login';
import StudentsHome   from "./pages/students/StudentsHome";
import StudentsList   from "./pages/students/StudentsList";
import StudentForm    from "./pages/students/StudentForm";
import StudentDetail  from "./pages/students/StudentDetail";
import HistoryList    from "./pages/students/HistoryList";
import HistoryDetail  from "./pages/students/HistoryDetail";
import Home from "./pages/home/Home"
import PersonalLogList from "./pages/personal/PersonalLogList";
import PersonalLogDetail from "./pages/personal/PersonalLogDetail";

export default function App() {
  const isAuth = true; // por ahora, cuando Ion cierre login, reemplazar por estado real
  const devView = false;
  return (
    <div className={devView ? "dev-color" : ""}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />

          <Route path="/students" element={isAuth ? <StudentsHome /> : <Navigate to="/login" />} />
          <Route path="/students/profiles" element={isAuth ? <StudentsList /> : <Navigate to="/login" />} />
          <Route path="/students/profiles/new" element={isAuth ? <StudentForm /> : <Navigate to="/login" />} />
          <Route path="/students/profiles/:id" element={isAuth ? <StudentDetail /> : <Navigate to="/login" />} />
          <Route path="/students/profiles/:id/edit" element={isAuth ? <StudentForm /> : <Navigate to="/login" />} />

          <Route path="/students/profiles/:id/history" element={isAuth ? <HistoryList /> : <Navigate to="/login" />} />
          <Route path="/actions/:actionId" element={isAuth ? <HistoryDetail /> : <Navigate to="/login" />} />

          <Route path="/personal" element={<PersonalLogList />} />
          <Route path="/personal/:actionId" element={<PersonalLogDetail />} />

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Router>
      </div>

  );
}
