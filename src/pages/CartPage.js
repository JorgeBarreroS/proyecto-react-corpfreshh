import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CartItem from '../components/CartItem';
import TotalPrice from '../components/TotalPrice';
import NequiPago from '../components/NequiPago'; // Importación del componente de pago

const Carrito = ({ cart, loading, updateQuantity, removeItem, total }) => {
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
              <Link to="/checkout" className="btn btn-primary btn-sm mt-2 mt-md-0">
                Ir a pagar
              </Link>
              {/* Botón de pago con Nequi */}
              <NequiPago carrito={cart} />
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

export default Carrito;
