import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

const PagoNequi = () => {
  const location = useLocation();
  const { carrito, total } = location.state || { carrito: [], total: '0.00' };

  const redirigirANequi = () => {
    window.location.href = 'https://www.nequi.com.co/'; // Redirección directa a Nequi
  };

  return (
    <div>
      <Navbar />
      <div className="container mt-3">
        <h1 className="text-center mb-4">Estás a punto de ser redirigido a Nequi</h1>
        <div className="card p-4 shadow">
          <h2 className="text-center">Detalles de tu compra</h2>
          <ul className="list-group list-group-flush mt-3">
            {carrito.map((item) => (
              <li key={item.id_producto} className="list-group-item d-flex justify-content-between">
                <span>{item.nombre} (x{item.cantidad})</span>
                <span>${(item.precio * item.cantidad).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <h3 className="text-center mt-4">Total a pagar: ${total}</h3>
          <div className="text-center mt-4">
            <button className="btn btn-success" onClick={redirigirANequi}>
              Proceder a pagar con Nequi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagoNequi;
