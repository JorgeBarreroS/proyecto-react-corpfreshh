import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import "../styles/sytles2.css";
import { useUser } from "../components/UserContext";


import GoogleLogin from "react-google-login";
import { gapi} from "gapi-script";

const clientID = "590045182886-8jfebo35qqi7mpc4dtldu48m3skpu6ne.apps.googleusercontent.com";


const Login = () => {
  const { user, setUser } = useUser(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/perfil");
    }
  }, [user, navigate]);
  
  useEffect(()=> {
    const start = () => {
      gapi.auth2.init({
        client_id: clientID,
      });
    };
    gapi.load("client:auth2", start);
  }, []);
  
  const onSuccess = (response) => {
    setUser(response.profileObj);
    navigate("/perfil");
  };
  
  const onFailure = () => {
    console.log("something went wrong");
  };



  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Función para validar el email con una expresión regular
  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar el correo electrónico
    if (!email) {
      Swal.fire({
        icon: 'error',
        title: 'Correo electrónico vacío',
        text: 'Por favor, ingresa tu correo electrónico.',
        background: '#f7f7f7',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    if (!validateEmail(email)) {
      Swal.fire({
        icon: 'error',
        title: 'Correo electrónico inválido',
        text: 'Por favor, ingresa un correo electrónico válido.',
        background: '#f7f7f7',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    // Validar la contraseña
    if (!password) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseña vacía',
        text: 'Por favor, ingresa tu contraseña.',
        background: '#f7f7f7',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    try {
      const response = await fetch("http://localhost/corpfresh-php/authenticate.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get("Content-Type");

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error del servidor: ${errorText}`);
      }

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Inicio de sesión exitoso',
            background: '#f7f7f7',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Continuar'
          }).then(() => {
            navigate("/dashboard");
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Inicio no válido',
            text: data.message || 'Usuario o contraseña incorrectos',
            background: '#f7f7f7',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Volver a intentar',
          });
        }
      } else {
        throw new Error("Respuesta inesperada del servidor.");
      }
    } catch (error) {
      console.error("Error detallado:", error);

      // Si el error es 500, muestra el mensaje específico del servidor
      if (error.message.includes('500')) {
        Swal.fire({
          icon: 'error',
          title: 'Error en el servidor',
          text: 'Hubo un error al procesar tu solicitud. Revisa los logs del servidor.',
          background: '#f7f7f7',
          confirmButtonColor: '#3085d6',
        });
      } else if (error.message.includes('400')) {
        Swal.fire({
          icon: 'error',
          title: 'Error de solicitud',
          text: 'La solicitud no se ha procesado correctamente. Verifica la entrada.',
          background: '#f7f7f7',
          confirmButtonColor: '#3085d6',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error de Conexión',
          text: error.message || 'Hubo un problema con la conexión o el servidor',
          background: '#f7f7f7',
          confirmButtonColor: '#3085d6',
        });
      }
    }
  };

  return (
    <div className="container">
  <div className="login-container container ">
    <div className="login-header">
      <img src="../imagenes/corp-freshh.jfif" alt="Corp Freshh" />
      <h2> ¡Bienvenido a CorpFreshh!</h2>
    </div>

    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="email" className="form-label">Correo Electrónico</label>
        <input
          type="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="password" className="form-label">Contraseña</label>
        <input
          type={showPassword ? "text" : "password"}
          className="form-control"
          id="txtPass"
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
            onSuccess= {onSuccess}
            onFailure={onFailure}
            cookiePolicy={'single_host_policy'}
          />

        </div>
      </div>
    </div>

  </div>
</div>
  );
};

export default Login;
