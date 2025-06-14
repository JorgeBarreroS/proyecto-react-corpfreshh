import React, { useState } from "react";
import Swal from "sweetalert2";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    mensaje: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { nombre, email, mensaje } = formData;

    if (!nombre || !email || !mensaje) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, completa todos los campos antes de enviar.",
        confirmButtonText: "OK",
      });
    } else {
      try {
        const response = await fetch("https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/app/guardarContacto.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (result.status === "success") {
          Swal.fire({
            icon: "success",
            title: "¡Mensaje enviado!",
            text: "Gracias por contactarnos. Te responderemos lo antes posible.",
            confirmButtonText: "OK",
          });
          setFormData({ nombre: "", email: "", mensaje: "" });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: result.message || "Hubo un problema al enviar el mensaje.",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error de red",
          text: "No se pudo enviar el mensaje. Verifica tu conexión o inténtalo más tarde.",
        });
      }
    }
  };

  return (
    <div className="col-md-6">
      <h5 className="mb-3">O envíanos un mensaje:</h5>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">Nombre:</label>
          <input
            type="text"
            className="form-control"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ingresa tu nombre"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Correo electrónico:</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Ingresa tu correo electrónico"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="mensaje" className="form-label">Mensaje:</label>
          <textarea
            className="form-control"
            id="mensaje"
            name="mensaje"
            rows="4"
            value={formData.mensaje}
            onChange={handleChange}
            placeholder="Escribe tu mensaje"
          ></textarea>
        </div>
        <button type="submit" className="btn btn-success">Enviar mensaje</button>
      </form>
    </div>
  );
};

export default ContactForm;
