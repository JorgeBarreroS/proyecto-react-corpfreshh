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
    
    <div className="register-container">
        <h2 className="fw-bold">Registro</h2>
        <form className="form-container">
            
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Nombre</label>
                    <input type="text" className="form-control" placeholder="Tu nombre" />
                </div>
                <div className="form-group">
                    <label className="form-label">Dirección 2</label>
                    <input type="text" className="form-control" placeholder="Dirección 2" />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Apellido</label>
                    <input type="text" className="form-control" placeholder="Tu apellido" />
                </div>
                <div className="form-group">
                    <label className="form-label">Ciudad</label>
                    <input type="text" className="form-control" placeholder="Ciudad" />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input type="text" className="form-control" placeholder="Teléfono" />
                </div>
                <div className="form-group">
                    <label className="form-label">País</label>
                    <input type="text" className="form-control" placeholder="País" />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Correo Electrónico</label>
                    <input type="email" className="form-control" placeholder="Correo" />
                </div>
                <div className="form-group">
                    <label className="form-label">Contraseña</label>
                    <input type="password" className="form-control" placeholder="Contraseña" />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Dirección 1</label>
                    <input type="text" className="form-control" placeholder="Dirección 1" />
                </div>
                <div className="form-group">
                    <label className="form-label">Confirmar Contraseña</label>
                    <input type="password" className="form-control" placeholder="Confirmar" />
                </div>
            </div>

            <button className="btn-primary">Registrarme</button>
        </form>
    </div>
  );
};

export default Register;
