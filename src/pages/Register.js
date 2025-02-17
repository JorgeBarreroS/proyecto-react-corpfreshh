import React, { useState } from "react";
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    console.log("Datos enviados:", formData); // <-- Agregar este console.log
  
    for (let key in formData) {
      if (!formData[key]) {
        Swal.fire({ icon: "error", title: "Error", text: "Por favor, llena todos los campos" });
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

    try {
      const response = await fetch("http://localhost/corpfresh-php/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

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
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema con la conexión",
      });
    }
  };

  return (
    <div className="container">
      <div className="register-container container">
        <h2 className="fw-bold text-center mb-3">¡Hola!, regístrate para continuar</h2>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              {[{ label: "Nombre", name: "nombre" },
                { label: "Apellido", name: "apellido" },
                { label: "Teléfono", name: "telefono", type: "tel" },
                { label: "Correo Electrónico", name: "email", type: "email" },
                { label: "Dirección 1", name: "direccion1" }].map(({ label, name, type = "text" }) => (
                <div className="mb-3" key={name}>
                  <label htmlFor={name} className="form-label">{label}</label>
                  <input
                    type={type}
                    className="form-control"
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                  />
                </div>
              ))}
            </div>
            <div className="col-md-6">
              {[{ label: "Dirección 2", name: "direccion2" },
                { label: "Ciudad", name: "ciudad" },
                { label: "País", name: "pais" },
                { label: "Contraseña", name: "password", type: "password" },
                { label: "Confirmar Contraseña", name: "confirmPassword", type: "password" }].map(({ label, name, type = "text" }) => (
                <div className="mb-3" key={name}>
                  <label htmlFor={name} className="form-label">{label}</label>
                  <input
                    type={type}
                    className="form-control"
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="d-grid">
            <button type="submit" className="btn btn-primary">Registrarme</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
