import React from 'react';

const TotalPrice = ({ total }) => {
  // Convierte el total a número, eliminando cualquier formato previo
  const totalPrice = parseFloat(total.toString().replace(/[^\d.]/g, ''));

  // Formatear a pesos colombianos con todos los dígitos
  const formattedTotal = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true
  }).format(totalPrice);

  return (
    <div>
      <span className="total-price">Total: {formattedTotal}</span>
    </div>
  );
};

export default TotalPrice;