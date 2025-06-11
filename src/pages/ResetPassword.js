import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nuevo, setNuevo] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [etapa, setEtapa] = useState(1);
  const navigate = useNavigate();

  const enviarCodigo = async () => {
    try {
      const res = await fetch('https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/app/sendCode.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email })
      });

      const text = await res.text();
      const data = JSON.parse(text);
      if (data.success) {
        Swal.fire("Código enviado", data.message, "success");
        setEtapa(2);
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (err) {
      console.error('Error al enviar código:', err);
      Swal.fire("Error", "No se pudo enviar el código", "error");
    }
  };

  const verificarCodigo = async () => {
    try {
      const res = await fetch("https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/app/verifyCode.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo_usuario: email, codigo }),
      });

      const text = await res.text();
      const data = JSON.parse(text);
      if (data.success) {
        setEtapa(3);
      } else {
        Swal.fire("Código inválido", data.message, "error");
      }
    } catch (err) {
      console.error('Error al verificar código:', err);
      Swal.fire("Error", "No se pudo verificar el código", "error");
    }
  };

  const cambiarContrasena = async () => {
    if (nuevo !== confirmar) {
      Swal.fire("Error", "Las contraseñas no coinciden", "error");
      return;
    }

    try {
      const res = await fetch("https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/app/updatePassword.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo_usuario: email, nueva_contrasena: nuevo, codigo }),
      });

      const text = await res.text();
      const data = JSON.parse(text);
      if (data.success) {
        Swal.fire("Éxito", "Contraseña actualizada", "success").then(() => {
          navigate("/login");
        });
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      Swal.fire("Error", "No se pudo actualizar la contraseña", "error");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg p-4 rounded" style={{ maxWidth: "400px", width: "100%" }}>
        <div className="text-center mb-4">
          <h4 className="fw-bold">Recuperar Contraseña</h4>
        </div>

        {etapa === 1 && (
          <>
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              value={email}
              placeholder="Ingresa tu correo"
              onChange={(e) => setEmail(e.target.value)}
              className="form-control mb-3"
            />
            <button onClick={enviarCodigo} className="btn btn-primary w-100">Enviar código</button>
          </>
        )}

        {etapa === 2 && (
          <>
            <label className="form-label">Código de verificación</label>
            <input
              type="text"
              value={codigo}
              placeholder="Ingresa el código"
              onChange={(e) => setCodigo(e.target.value)}
              className="form-control mb-3"
            />
            <button onClick={verificarCodigo} className="btn btn-success w-100">Verificar código</button>
          </>
        )}

        {etapa === 3 && (
          <>
            <label className="form-label">Nueva contraseña</label>
            <input
              type="password"
              placeholder="Nueva contraseña"
              className="form-control mb-2"
              value={nuevo}
              onChange={(e) => setNuevo(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              className="form-control mb-3"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
            />
            <button onClick={cambiarContrasena} className="btn btn-success w-100">Cambiar contraseña</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;