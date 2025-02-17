import React from "react";
import Swal from "sweetalert2";
import imagen1 from "../imagenes/whatsapp.png"; 

const WhatsAppSection = () => {
  const handleWhatsAppClick = (event) => {
    event.preventDefault();
    Swal.fire({
      icon: "info",
      title: "Redirigiendo a WhatsApp",
      text: "Serás redirigido a WhatsApp para enviar tu mensaje.",
      showCancelButton: true,
      confirmButtonText: "Continuar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "https://wa.me/3208706701";
      }
    });
  };

  return (
    <div className="col-md-6 d-flex flex-column align-items-center">
      <img src={imagen1} alt="WhatsApp" width="100" />
      <h4 className="mt-3">¿Necesitas ayuda rápida?</h4>
      <p>Contacta con nosotros a través de WhatsApp:</p>
      <button className="btn btn-primary" onClick={handleWhatsAppClick}>
        Enviar mensaje por WhatsApp
      </button>
    </div>
  );
};

export default WhatsAppSection;
