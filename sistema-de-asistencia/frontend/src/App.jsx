import React from 'react';
import Login from './pages/auth/Login';
import Home from './pages/home/Home'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return  (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </Router>
    </div>
  )

}

export default App;
