import React, { useState } from "react";
import Swal from "sweetalert2";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nuevo, setNuevo] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [etapa, setEtapa] = useState(1);

  const enviarCodigo = async () => {
    try {
      const res = await fetch('http://localhost/corpfresh-php/sendCode.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email })
        
      });

      const text = await res.text();
console.log("Respuesta cruda:", text);
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
      const res = await fetch("http://localhost/corpfresh-php/verifyCode.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo_usuario: email, codigo }),
      });

      const text = await res.text();
console.log("Respuesta cruda:", text);
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
      const res = await fetch("http://localhost/corpfresh-php/updatePassword.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo_usuario: email, nueva_contrasena: nuevo, codigo }),
      });

      const text = await res.text();
console.log("Respuesta cruda:", text);
const data = JSON.parse(text);
      if (data.success) {
        Swal.fire("Éxito", "Contraseña actualizada", "success").then(() => {
          window.location.href = "/login";
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
    <div className="container mt-5">
      {etapa === 1 && (
        <>
          <h3>Ingresa tu correo</h3>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control mb-2" />
          <button onClick={enviarCodigo} className="btn btn-primary">Enviar código</button>
        </>
      )}

      {etapa === 2 && (
        <>
          <h3>Ingresa el código recibido</h3>
          <input type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} className="form-control mb-2" />
          <button onClick={verificarCodigo} className="btn btn-success">Verificar</button>
        </>
      )}

      {etapa === 3 && (
        <>
          <h3>Nueva contraseña</h3>
          <input type="password" placeholder="Nueva contraseña" className="form-control mb-2" value={nuevo} onChange={(e) => setNuevo(e.target.value)} />
          <input type="password" placeholder="Confirmar" className="form-control mb-2" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
          <button onClick={cambiarContrasena} className="btn btn-success">Cambiar contraseña</button>
        </>
      )}
    </div>
  );
};

export default ResetPassword;
