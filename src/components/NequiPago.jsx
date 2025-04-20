import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const NequiPago = ({ carrito }) => {
  const [sesionActiva, setSesionActiva] = useState(false);

  useEffect(() => {
    // Verificar si hay una sesión activa en el almacenamiento local
    const sesion = localStorage.getItem('nequiSesionActiva');
    if (sesion) {
      setSesionActiva(true);
    }
  }, []);

  const pedirInicioSesion = () => {
    Swal.fire({
      title: 'Inicia sesión en Nequi',
      text: 'Debes iniciar sesión para proceder con el pago.',
      icon: 'info',
      confirmButtonText: 'Iniciar sesión',
    }).then(() => {
      // Simulando el inicio de sesión
      localStorage.setItem('nequiSesionActiva', true);
      setSesionActiva(true);
    });
  };

  const redirigirAPago = () => {
    if (carrito.length === 0) {
      Swal.fire({
        title: 'Carrito vacío',
        text: 'Agrega productos antes de proceder con el pago.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
      });
    } else {
      window.location.href = 'https://recarga.nequi.com.co/bdigital/login.jsp';
    }
  };

  return (
    <div className="carrito">
      <h1 className="text-xl font-bold mb-4">Tu Carrito</h1>
      <ul className="mb-4">
        {carrito.map((producto, index) => (
          <li key={index} className="mb-2">
            {producto.nombre} - ${producto.precio}
          </li>
        ))}
      </ul>
      {!sesionActiva ? (
        <button
          className="btn-nequi"
          onClick={pedirInicioSesion}
        >
          Iniciar sesión con Nequi
        </button>
      ) : (
        <button
          className="btn-nequi"
          onClick={redirigirAPago}
        >
          Pagar con Nequi
        </button>
      )}
    </div>
  );
};

export default NequiPago;

