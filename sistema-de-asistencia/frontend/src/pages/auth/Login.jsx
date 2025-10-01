import React, { useState } from "react";
import loginImage from "../../assets/images/school_shield.png"; // Ajusta la ruta a tu PNG
import LoginForm from "../../components/LoginForm.jsx";

const Login = () => {
  return (
    <div className="login-container">
      {/* Lado izquierdo: Imagen y título */}
      <div className="login-title">
        <div>
          <h1>Sistema de Asistencia en Gestión Estudiantil</h1>
        </div>
        <img src={loginImage} alt="Escudo e la Escuela" className="mb-6 w-3/4" />
      </div>

      {/* Lado derecho: Formulario */}
      <div>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
