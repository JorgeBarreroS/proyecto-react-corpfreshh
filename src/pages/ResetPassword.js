import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import FormInput from "../components/FormInput";
import "../styles/sytles3.css";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  useEffect(() => {
      document.body.style.background = "linear-gradient(135deg, #3c72a1, #5298d6)";
      return () => {
          document.body.style.background = "";
      };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !newPassword || !confirmPassword) {
      Swal.fire("Error", "Por favor, llena todos los campos", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire("Error", "Las contraseñas no coinciden", "error");
      return;
    }

    try {
      const response = await fetch("http://localhost/corpfresh-php/resetPassword.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword, confirmPassword }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire("¡Éxito!", data.message, "success").then(() => {
          window.location.href = "/login";
        });
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Hubo un problema con la conexión", "error");
    }
  };

  return (
    <div className="register-page">
        <div className="login-container">
      <h2 className="fw-bold text-center mb-4">Recupera tu contraseña</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Correo Electrónico</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingrese su correo"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Nueva Contraseña</label>
          <input
            type="password"
            className="form-control"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Ingrese su nueva contraseña"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Confirmar Nueva Contraseña</label>
          <input
            type="password"
            className="form-control"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirme su contraseña"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Restablecer Contraseña
        </button>

        <div className="text-center small-text mt-3">
          <p>Ir a <a href="/login">Iniciar sesión</a></p>
        </div>
      </form>
    </div>
</div>
  );
};

export default ResetPassword;
