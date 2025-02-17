import React, { useState, useEffect } from 'react';
import CartItem from '../components/CartItem';
import TotalPrice from '../components/TotalPrice';
import Navbar from '../components/Navbar';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState('0.00');
  const [loading, setLoading] = useState(true);

  // Cargar el carrito desde la sesión o API
  useEffect(() => {
    fetchCart();
  }, []);

  // Función para cargar el carrito
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost/corpfresh-php/carrito/carrito.php', {
        method: 'GET',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Datos recibidos del servidor:', data);
  
      // More flexible cart loading
      if (data && data.cart) {
        setCart(data.cart || []);
        setTotal(data.total || '0.00');
      } else {
        setCart([]);
        setTotal('0.00');
      }
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
      Swal.fire('Error', 'No se pudo cargar el carrito: ' + error.message, 'error');
      setCart([]);
      setTotal('0.00');
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar la cantidad de un producto
  const updateQuantity = async (id, cantidad) => {
    try {
      const response = await fetch('http://localhost/corpfresh-php/carrito/carrito.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          accion: 'actualizar',
          id_producto: id,
          cantidad: parseInt(cantidad, 10)
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setTotal(data.total || '0.00');
        setCart(data.cart || []);
        Swal.fire('Actualizado', 'La cantidad ha sido actualizada.', 'success');
      } else {
        throw new Error(data.message || 'Error al actualizar la cantidad');
      }
    } catch (error) {
      console.error('Error al actualizar la cantidad:', error);
      Swal.fire('Error', error.message || 'No se pudo actualizar la cantidad', 'error');
    }
  };

  // Función para eliminar un producto del carrito
  const removeItem = async (id) => {
    try {
      const response = await fetch('http://localhost/corpfresh-php/carrito/carrito.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          accion: 'eliminar',
          id_producto: id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setCart(data.cart || []);
        setTotal(data.total || '0.00');
        Swal.fire('Eliminado', 'El producto ha sido eliminado del carrito.', 'success');
      } else {
        throw new Error(data.message || 'Error al eliminar el producto');
      }
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      Swal.fire('Error', error.message || 'No se pudo eliminar el producto', 'error');
    }
  };

  return (
    <div>
      <Navbar />
    <div className="container mt-3">
      <h1 className="text-center mb-4">Carrito de Compras</h1>
      {loading ? (
        <div className="text-center">Cargando...</div>
      ) : Array.isArray(cart) && cart.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped table-hover cart-table">
            <thead className="table-dark">
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((producto) => (
                <CartItem
                  key={producto.id_producto}
                  producto={producto}
                  updateQuantity={updateQuantity}
                  removeItem={removeItem}
                />
              ))}
            </tbody>
          </table>
          <div className="cart-actions d-flex justify-content-between align-items-center mt-3">
            <Link to="/productos" className="btn btn-secondary btn-lg">
              Seguir Comprando
            </Link>
            <TotalPrice total={total} />
            <Link to="/checkout" className="btn btn-primary btn-lg">
              Ir a pagar
            </Link>
          </div>
        </div>
      ) : (
        <div className="alert alert-warning text-center">
          El carrito está vacío.{' '}
          <Link to="/productos" className="alert-link">
            Ver productos
          </Link>
        </div>
      )}
    </div>
    </div>
  );
};

export default CartPage;