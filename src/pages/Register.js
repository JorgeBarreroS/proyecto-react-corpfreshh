import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "../styles/sytles2.css";

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    direccion1: "",
    direccion2: "",
    ciudad: "",
    pais: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    document.body.style.background = "linear-gradient(135deg, #3c72a1, #5298d6)";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const requiredFields = ["nombre", "apellido", "telefono", "email", "password", "confirmPassword"];
    for (let field of requiredFields) {
      if (!formData[field]) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Por favor, completa los campos obligatorios",
        });
        return;
      }
    }

    if (!formData.email.includes("@")) {
      Swal.fire({
        icon: "warning",
        title: "Correo inválido",
        text: "Incluye un signo '@' en la dirección de correo electrónico.",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Las contraseñas no coinciden",
      });
      return;
    }

    const dataToSend = {
      nombre_usuario: formData.nombre,
      apellido_usuario: formData.apellido,
      telefono_usuario: formData.telefono,
      correo_usuario: formData.email,
      direccion1_usuario: formData.direccion1 || "",
      direccion2_usuario: formData.direccion2 || "",
      ciudad_usuario: formData.ciudad || "",
      pais_usuario: formData.pais || "",
      contraseña: formData.password,
      id_rol: "2"
    };

    try {
      const response = await fetch("http://localhost/corpfresh-php/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const responseText = await response.text();
      console.log("Respuesta del servidor:", responseText);

      try {
        const data = JSON.parse(responseText);
        if (data.success) {
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Registro exitoso. Inicia sesión",
          }).then(() => {
            window.location.href = "/login";
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: data.message,
          });
        }
      } catch (jsonError) {
        console.error("Error al procesar la respuesta JSON:", jsonError);
        Swal.fire({
          icon: "error",
          title: "Error del servidor",
          text: "Respuesta no válida del servidor. Verifica la consola para más detalles.",
          footer: "Por favor, contacta al administrador"
        });
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "Hubo un problema con la conexión al servidor"
      });
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2 className="fw-bold text-center">Registro</h2>
        <form className="form-container" onSubmit={handleSubmit}>

          {/* DATOS PERSONALES */}
          <h5 className="text-center mb-3">Datos Personales</h5>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input type="text" name="nombre" className="form-control" placeholder="Tu nombre" value={formData.nombre} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Apellido *</label>
              <input type="text" name="apellido" className="form-control" placeholder="Tu apellido" value={formData.apellido} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Teléfono *</label>
              <input type="text" name="telefono" className="form-control" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Correo Electrónico *</label>
              <input type="email" name="email" className="form-control" placeholder="Correo electrónico" value={formData.email} onChange={handleChange} />
            </div>
          </div>

          {/* CUENTA */}
          <h5 className="text-center my-3">Credenciales de Acceso</h5>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Contraseña *</label>
              <input type="password" name="password" className="form-control" placeholder="Contraseña" value={formData.password} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar Contraseña *</label>
              <input type="password" name="confirmPassword" className="form-control" placeholder="Confirmar contraseña" value={formData.confirmPassword} onChange={handleChange} />
            </div>
          </div>

          {/* DIRECCIÓN */}
          <h5 className="text-center my-3">Dirección (Opcional)</h5>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Dirección 1</label>
              <input type="text" name="direccion1" className="form-control" placeholder="Calle principal, número, etc." value={formData.direccion1} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Dirección 2</label>
              <input type="text" name="direccion2" className="form-control" placeholder="Apartamento, piso, referencia" value={formData.direccion2} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Ciudad</label>
              <input type="text" name="ciudad" className="form-control" placeholder="Ciudad" value={formData.ciudad} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">País</label>
              <input type="text" name="pais" className="form-control" placeholder="País" value={formData.pais} onChange={handleChange} />
            </div>
          </div>

          <div className="d-grid mt-3">
            <button type="submit" className="btn btn-primary">Registrarme</button>
          </div>
          <p className="mt-2 text-center"><small>* Campos obligatorios</small></p>
        </form>
      </div>
    </div>
  );
};

export default Register;
