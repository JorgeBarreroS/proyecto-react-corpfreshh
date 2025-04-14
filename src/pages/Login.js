import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
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
    return () => {
      document.body.style.background = "";
    };
  }, []);

  // Inicio de sesión con Google
  const onSuccess = (credentialResponse) => {
    try {
      const decodedToken = JSON.parse(atob(credentialResponse.credential.split(".")[1]));
      const googleUser = {
        name: decodedToken.name,
        email: decodedToken.email,
        avatar: decodedToken.picture,
      };
      login(googleUser);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Error procesando el inicio de sesión con Google:", error);
    }
  };

  const onFailure = () => {
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error en el servidor");
      }

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Inicio de sesión exitoso",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Continuar",
        }).then(() => {
          login({
            name: data.user.email,
            email: data.user.email,
            rol: data.user.rol,
            id: data.user.id,
          });

          // Verificar el rol del usuario
          const userRole = Number(data.user.rol);

          if (userRole === 1) {
            navigate("/crud", { replace: true });
          } else if (userRole === 2) {
            navigate("/dashboard", { replace: true });
          } else {
            console.warn(`Rol desconocido (${data.rol}), redirigiendo a /dashboard`);
            navigate("/dashboard", { replace: true });
          }
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
    <GoogleOAuthProvider clientId={clientID}>
      <div className="login-page">
        <div className="login-container">
          <div className="login-header">
            <img src={logo} alt="Corp Freshh" />
            <h2>¡Bienvenido a CorpFreshh!</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <label htmlFor="email" className="form-label">Correo Electrónico</label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-check mb-2">
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
                  onSuccess={onSuccess}
                  onError={onFailure}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
