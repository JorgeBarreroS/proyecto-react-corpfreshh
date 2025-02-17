import React, { useState } from "react";
import Swal from "sweetalert2";
import FormInput from "../components/FormInput";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
    <div className="login-container container">
      <h2 className="fw-bold text-center mb-4">Recupera tu contraseña</h2>
      <form onSubmit={handleSubmit}>
        <FormInput
          label="Correo Electrónico"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormInput
          label="Nueva Contraseña"
          type="password"
          name="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <FormInput
          label="Confirmar Nueva Contraseña"
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <div className="d-grid">
          <button type="submit" className="btn btn-primary">
            Reestablecer Contraseña
          </button>
        </div>
        <div className="text-center small-text mt-3">
            <p>
              Ir a <a href="/login">Iniciar sesión</a>
            </p>
          </div>
      </form>
    </div>
  );
};

export default ResetPassword;
