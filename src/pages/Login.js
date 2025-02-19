import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import GoogleLogin from "react-google-login";
import { gapi } from "gapi-script";
import "../styles/Login.css";
import logo from "../imagenes/corp-freshh.jfif"; 

const clientID = "590045182886-8jfebo35qqi7mpc4dtldu48m3skpu6ne.apps.googleusercontent.com";

const Login = () => {
  const { login } = useAuth(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.background = "linear-gradient(135deg, #1e3c72, #2a5298)";
    return () => {
        document.body.style.background = ""; // Resetear cuando salga del login
    };
}, []);

  useEffect(() => {
    const start = async () => {
      try {
        await gapi.load("client:auth2", () => {
          gapi.auth2.init({ client_id: clientID });
        });
      } catch (error) {
        console.error("Error al inicializar Google API:", error);
      }
    };
    start();
  }, []);

  const onSuccess = (response) => {
    if (response?.profileObj) {
      const googleUser = {
        name: response.profileObj.name,
        email: response.profileObj.email,
        avatar: response.profileObj.imageUrl,
      };
      login(googleUser);
      navigate("/dashboard", { replace: true });
    }
  };

  const onFailure = (error) => {
    console.error("Error en inicio de sesión con Google:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo iniciar sesión con Google.",
      confirmButtonColor: "#3085d6",
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      Swal.fire({
        icon: "error",
        title: "Campos vacíos",
        text: "Por favor, ingresa tus credenciales.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost/corpfresh-php/authenticate.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error(`Error: ${await response.text()}`);

      const data = await response.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Inicio de sesión exitoso",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Continuar",
        }).then(() => {
          login({ name: data.name, email });
          navigate("/dashboard", { replace: true });
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Inicio no válido",
          text: data.message || "Usuario o contraseña incorrectos",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Volver a intentar",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor.",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <img src={logo} alt="Corp Freshh" />
          <h2>¡Bienvenido a CorpFreshh!</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              checked={showPassword}
              onChange={togglePasswordVisibility}
            />
            <label className="form-check-label small-text">Mostrar contraseña</label>
          </div>
          <div className="d-grid">
            <button type="submit" className="btn btn-primary">Iniciar Sesión</button>
          </div>
        </form>
        <div className="text-center mt-3 small-text">
          <p>No tienes cuenta? <a href="/register">Regístrate</a></p>
          <p>¿Olvidaste tu contraseña? <a href="/reset-password">Recuperar Contraseña</a></p>
          <p><a href="/">Página Principal</a></p>
        </div>
        <div className="social-login text-center">
          <p className="small-text">O inicia sesión con:</p>
          <div className="row">
            <div className="mb-3">
              <GoogleLogin 
                clientId={clientID}
                onSuccess={onSuccess}
                onFailure={onFailure}
                cookiePolicy={"single_host_policy"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


