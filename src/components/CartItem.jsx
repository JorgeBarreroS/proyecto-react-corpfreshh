import React, { useState } from 'react';

const CartItem = ({ producto, updateQuantity, removeItem }) => {
  const [cantidad, setCantidad] = useState(producto.cantidad);

  const handleQuantityChange = (e) => {
    const newCantidad = e.target.value;
    setCantidad(newCantidad);
    updateQuantity(producto.id_producto, newCantidad);
  };

  // Convierte el precio a número
  const precio = parseFloat(producto.precio.replace(',', '').replace('$', ''));

  // Formatear precio
  const precioFormateado = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(precio);

  // Formatear subtotal
  const subtotalFormateado = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(precio * cantidad);

  return (
    <tr>
      <td>
        {/* Asegúrate de que la imagen tenga un tamaño uniforme */}
        <img
          src={`http://localhost/corpfresh-php/${producto.imagen}`} // Asegúrate de que el campo imagen esté correctamente definido
          alt={producto.nombre}
          width="80"
          height="80" // Establece el mismo valor para el alto
          className="img-fluid"
          style={{ objectFit: 'cover' }} // Mantiene la proporción de la imagen y recorta si es necesario
        />
      </td>
      <td>{producto.nombre}</td>
      <td>{precioFormateado}</td>
      <td>
        <input 
          type="number" 
          className="form-control text-center" 
          value={cantidad} 
          onChange={handleQuantityChange} 
          min="1"
          style={{ width: '80px' }}
        />
      </td>
      <td className="subtotal">{subtotalFormateado}</td>
      <td>
        <button className="btn btn-danger btn-sm" onClick={() => removeItem(producto.id_producto)}>
          Eliminar
        </button>
      </td>
    </tr>
  );
};

export default CartItem;
