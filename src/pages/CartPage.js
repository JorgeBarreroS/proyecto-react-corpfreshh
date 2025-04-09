import React, { useState, useEffect } from 'react';
import CartItem from '../components/CartItem';
import TotalPrice from '../components/TotalPrice';
import Navbar from '../components/Navbar';
import Swal from 'sweetalert2';
import "../styles/style.css";
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext'; // Importa el hook personalizado

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState('0.00');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useUser(); // Obtiene el usuario desde el contexto

  // Redirige al login si no hay sesión
  useEffect(() => {
    if (!user) {
      navigate('/Login');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchCart();
  }, []);

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

  const handleNequiPayment = () => {
    navigate('/pago-nequi', { state: { carrito: cart, total } });
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
            <table className="table table-striped table-hover cart-table text-center">
              <thead className="table-dark">
                <tr>
                  <th scope="col">Imagen</th>
                  <th scope="col">Nombre</th>
                  <th scope="col">Precio</th>
                  <th scope="col">Cantidad</th>
                  <th scope="col">Subtotal</th>
                  <th scope="col">Acciones</th>
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
            <div className="cart-actions d-flex justify-content-between align-items-center mt-3 flex-wrap">
              <Link to="/productos" className="btn btn-secondary btn-sm mb-2 mb-md-0">
                Seguir Comprando
              </Link>
              <TotalPrice total={total} />
              <button onClick={handleNequiPayment} className="btn btn-primary btn-sm mt-2 mt-md-0">
                Ir a pagar con Nequi
              </button>
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
