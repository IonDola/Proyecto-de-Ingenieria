// LoginForm.jsx
import { useState, Fragment } from "react";

const LoginForm = () => {
  const asGuest = "Invitado"
  const asAdmin = "Administrativo"
  const [isGuest, setUserType] = useState(false);
  const [guestText, setGestText] = useState("Ingresar Como " + asGuest)

  const switchGuestStyle = {
    backgroundColor: 'black',
    marginLeft: '200px',
  };

  const handleUser = () => {
    const newGuest = isGuest ? false : true;
    setUserType(newGuest);
    const newGuestText = "Ingresar Como " + (newGuest ? asAdmin : asGuest);
    setGestText(newGuestText);
  };

  const AdminView = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleAdmin = () => {
      console.log("Iniciar sesión con:", { username, password });
      // Simple input validation to prevent basic injection attempts
      if (username.length < 1) {
        alert("Favor indicar un nombre de usuario");
        return;
      }
      if (password.length < 1) {
        alert("Favor ingresar la contraseña");
        return;
      }
      const isInputSafe = (str) => /^[a-zA-Z0-9_@.-]+$/.test(str);

      if (!isInputSafe(username) || !isInputSafe(password)) {
        alert("Usuario o contraseña contiene caracteres no permitidos.");
        return;
      }

      fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      })
        .then(res => res.json())
        .then(data => {
          if (data.token && data.role && data.name) {
            // Save session data (localStorage example)
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            localStorage.setItem("name", data.name);
            // Redirect or update UI as needed
            alert("Inicio de sesión exitoso");
          } if (data.name) {
            alert("Contraseña de usuario no valida");
          } else {
            alert("Usuario no identificado en el sistema");
          }
        })
        .catch(() => {
          alert("Error al conectar con el servidor");
        });
    };

    return (
      <Fragment>
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nombre de Usuario" 
            />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña" 
            />
        </div>
        <div>
          <button
            onClick={handleAdmin}
            className="login-button"
          >
            Iniciar Sesión
          </button>
        </div>
      </Fragment>
    )
  };
  
  const GuestView = () => {
    const [guestKey, setGuestKey] = useState("");

    const handleGuest = () => {
      console.log("Iniciar sesión con:", { guestToken: guestKey });
    }

    return (
      <Fragment>
        <div>
          <input
            type="text"
            value={guestKey}
            onChange={(e) => setGuestKey(e.target.value)}
            placeholder="Codigo de Invitado" />
        </div>
        <div>
          <button
            onClick={handleGuest}
            className="login-button"
          >
            Iniciar Sesión
          </button>
        </div>
      </Fragment>
    )
  }

  return (
    <div className="login-form">
      {isGuest ? (
        <GuestView />
      ) : (
        <AdminView />
      )}
      <div>
        <button
          onClick={handleUser}
          className="login-button"
          style={switchGuestStyle}
          >
          {guestText}
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
