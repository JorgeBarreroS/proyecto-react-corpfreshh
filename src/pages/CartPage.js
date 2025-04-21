import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../services/AuthContext';
import '../styles/carrito.css';

const Carrito = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const { authState } = useAuth();
    const navigate = useNavigate();

    // Obtener datos del carrito desde la base de datos
    const fetchCarrito = async () => {
        try {
            if (!authState || !authState.email) {
                setProductos([]);
                setLoading(false);
                return;
            }

            console.log("Fetching carrito for user:", authState.email);

            const response = await fetch(`http://localhost/corpfresh-php/carrito/carrito.php?usuario=${authState.email}`);
            
            // Mostrar el estado de la respuesta
            console.log("Response status:", response.status);
            console.log("Response headers:", response.headers);
            
            // Intentar obtener la respuesta como texto primero para poder ver el error
            const textResponse = await response.text();
            console.log("Raw response:", textResponse);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${textResponse}`);
            }
            
            // Intentar parsear como JSON
            let data;
            try {
                data = JSON.parse(textResponse);
            } catch (parseError) {
                console.error("Failed to parse JSON:", parseError);
                throw new Error(`La respuesta no es JSON válido: ${textResponse.substring(0, 100)}...`);
            }
            
            if (data.error) {
                setProductos([]);
            } else {
                setProductos(data);
                calcularTotal(data);
            }
        } catch (err) {
            setError(err.message);
            console.error("Error al cargar carrito:", err);
        } finally {
            setLoading(false);
        }
    };

    // Calcular el total de los productos en el carrito
    const calcularTotal = (items) => {
        const sum = items.reduce((acc, item) => acc + (parseFloat(item.precio) * item.cantidad), 0);
        setTotal(sum);
    };

    useEffect(() => {
        fetchCarrito();
    }, [authState]);

    // Actualizar cantidad de un producto
    const actualizarCantidad = async (id_carrito, nuevaCantidad) => {
        if (nuevaCantidad < 1) {
            Swal.fire('Error', 'La cantidad debe ser al menos 1', 'error');
            return;
        }

        try {
            const response = await fetch('http://localhost/corpfresh-php/carrito/carrito.php', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id_carrito, 
                    cantidad: nuevaCantidad 
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Error al actualizar carrito");
            }
            
            const data = await response.json();
            if (data.success) {
                const nuevosProductos = productos.map(prod => 
                    prod.id_carrito === id_carrito ? {...prod, cantidad: nuevaCantidad} : prod
                );
                setProductos(nuevosProductos);
                calcularTotal(nuevosProductos);
            } else {
                Swal.fire('Error', data.error || 'No se pudo actualizar el carrito', 'error');
            }
        } catch (err) {
            console.error("Error al actualizar carrito:", err);
            Swal.fire('Error', err.message || 'Hubo un problema al actualizar el carrito', 'error');
        }
    };

    // Eliminar producto del carrito
    const eliminarProducto = async (id_carrito) => {
        // Pedir confirmación
        const resultado = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Este producto será eliminado del carrito",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!resultado.isConfirmed) return;

        try {
            const response = await fetch('http://localhost/corpfresh-php/carrito/carrito.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_carrito })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Error al eliminar producto");
            }
            
            const data = await response.json();
            if (data.success) {
                // Actualizar estado local
                const nuevosProductos = productos.filter(prod => prod.id_carrito !== id_carrito);
                setProductos(nuevosProductos);
                calcularTotal(nuevosProductos);
                Swal.fire('Eliminado', 'El producto ha sido eliminado del carrito', 'success');
            } else {
                Swal.fire('Error', data.error || 'No se pudo eliminar el producto', 'error');
            }
        } catch (err) {
            console.error("Error al eliminar producto:", err);
            Swal.fire('Error', err.message || 'Hubo un problema al eliminar el producto', 'error');
        }
    };

    // Vaciar todo el carrito
    const vaciarCarrito = async () => {
        // Pedir confirmación
        const resultado = await Swal.fire({
            title: '¿Vaciar carrito?',
            text: "Se eliminarán todos los productos del carrito",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, vaciar',
            cancelButtonText: 'Cancelar'
        });

        if (!resultado.isConfirmed) return;

        try {
            const response = await fetch('http://localhost/corpfresh-php/carrito/carrito.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    usuario: authState.email,
                    vaciar: true
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Error al vaciar carrito");
            }
            
            const data = await response.json();
            if (data.success) {
                setProductos([]);
                setTotal(0);
                Swal.fire('Carrito vaciado', 'Se han eliminado todos los productos', 'success');
            } else {
                Swal.fire('Error', data.error || 'No se pudo vaciar el carrito', 'error');
            }
        } catch (err) {
            console.error("Error al vaciar carrito:", err);
            Swal.fire('Error', err.message || 'Hubo un problema al vaciar el carrito', 'error');
        }
    };

    // Proceder al pago
    const procederPago = () => {
        if (!authState || !authState.email) {
            Swal.fire({
                title: 'Inicia sesión',
                text: 'Debes iniciar sesión para continuar con la compra',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Ir a login',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/login', { state: { returnUrl: '/carrito' } });
                }
            });
            return;
        }

        if (productos.length === 0) {
            Swal.fire('Carrito vacío', 'Agrega productos antes de continuar', 'info');
            return;
        }

        // Navegar a la página de pago
        navigate('/checkout');
    };

    if (loading) return (
        <div>
            <Navbar />
            <div className="container mt-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3">Cargando carrito...</p>
            </div>
            <Footer />
        </div>
    );

    if (error) return (
        <div>
            <Navbar />
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    Error: {error}
                </div>
            </div>
            <Footer />
        </div>
    );

    return (
        <div>
            <Navbar />
            <div className="cart-container">
                <div className="container">
                    <h1 className="cart-title">Mi Carrito de Compras</h1>
                    
                    {!authState || !authState.email ? (
                        <div className="cart-empty-message">
                            <i className="fas fa-shopping-cart cart-icon"></i>
                            <h3>Inicia sesión para ver tu carrito</h3>
                            <p>Para ver tus productos y realizar compras, debes iniciar sesión primero.</p>
                            <div className="mt-4">
                                <Link to="/login" className="btn btn-primary me-2">Iniciar Sesión</Link>
                                <Link to="/tienda" className="btn btn-outline-primary">Seguir Comprando</Link>
                            </div>
                        </div>
                    ) : productos.length === 0 ? (
                        <div className="cart-empty-message">
                            <i className="fas fa-shopping-cart cart-icon"></i>
                            <h3>Tu carrito está vacío</h3>
                            <p>¡Encuentra productos increíbles en nuestra tienda!</p>
                            <Link to="/tienda" className="btn btn-primary mt-3">Explorar Tienda</Link>
                        </div>
                    ) : (
                        <div className="cart-content">
                            <div className="row">
                                <div className="col-lg-8">
                                    <div className="cart-items-container">
                                        {productos.map(producto => (
                                            <div className="cart-item" key={producto.id_carrito}>
                                                <div className="cart-item-image">
                                                    <img src={`http://localhost/corpfresh-php/${producto.imagen}`} alt={producto.nombre} />
                                                </div>
                                                <div className="cart-item-details">
                                                    <Link to={`/producto/${producto.id_producto}`} className="cart-item-name">
                                                        {producto.nombre}
                                                    </Link>
                                                    <div className="cart-item-info">
                                                        <span className="cart-item-price">${producto.precio}</span>
                                                        {producto.talla && <span className="cart-item-size">Talla: {producto.talla}</span>}
                                                        {producto.color && <span className="cart-item-color">Color: {producto.color}</span>}
                                                    </div>
                                                </div>
                                                <div className="cart-item-quantity">
                                                    <button 
                                                        className="quantity-btn" 
                                                        onClick={() => actualizarCantidad(producto.id_carrito, producto.cantidad - 1)}
                                                        disabled={producto.cantidad <= 1}
                                                    >
                                                        -
                                                    </button>
                                                    <input 
                                                        type="number" 
                                                        className="quantity-value" 
                                                        value={producto.cantidad}
                                                        min="1"
                                                        onChange={(e) => {
                                                            const newValue = parseInt(e.target.value);
                                                            if (!isNaN(newValue) && newValue >= 1) {
                                                                actualizarCantidad(producto.id_carrito, newValue);
                                                            }
                                                        }}
                                                    />
                                                    <button 
                                                        className="quantity-btn"
                                                        onClick={() => actualizarCantidad(producto.id_carrito, producto.cantidad + 1)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <div className="cart-item-subtotal">
                                                    ${(producto.precio * producto.cantidad).toFixed(2)}
                                                </div>
                                                <button 
                                                    className="cart-item-remove" 
                                                    onClick={() => eliminarProducto(producto.id_carrito)}
                                                    title="Eliminar producto"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="cart-actions">
                                        <Link to="/tienda" className="btn btn-outline-primary">
                                            <i className="fas fa-arrow-left me-2"></i>
                                            Seguir comprando
                                        </Link>
                                        <button onClick={vaciarCarrito} className="btn btn-outline-danger">
                                            <i className="fas fa-trash me-2"></i>
                                            Vaciar carrito
                                        </button>
                                    </div>
                                </div>
                                <div className="col-lg-4">
                                    <div className="cart-summary">
                                        <h3 className="summary-title">Resumen del Pedido</h3>
                                        <div className="summary-items">
                                            <div className="summary-item">
                                                <span>Subtotal</span>
                                                <span>${total.toFixed(2)}</span>
                                            </div>
                                            <div className="summary-item">
                                                <span>Envío</span>
                                                <span>Calculado en el checkout</span>
                                            </div>
                                            <div className="summary-item">
                                                <span>Impuestos</span>
                                                <span>Calculado en el checkout</span>
                                            </div>
                                        </div>
                                        <div className="coupon-container">
                                            <div className="input-group">
                                                <input type="text" className="form-control" placeholder="Código de cupón" />
                                                <button className="btn btn-outline-secondary" type="button">Aplicar</button>
                                            </div>
                                        </div>
                                        <div className="summary-total">
                                            <span>Total</span>
                                            <span className="total-amount">${total.toFixed(2)}</span>
                                        </div>
                                        <button 
                                            className="btn btn-primary w-100 checkout-btn"
                                            onClick={procederPago}
                                        >
                                            Proceder al pago
                                            <i className="fas fa-arrow-right ms-2"></i>
                                        </button>
                                        <div className="accepted-payment-methods">
                                            <span>Aceptamos:</span>
                                            <div className="payment-icons">
                                                <i className="fab fa-cc-visa"></i>
                                                <i className="fab fa-cc-mastercard"></i>
                                                <i className="fab fa-cc-amex"></i>
                                                <i className="fab fa-cc-paypal"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Carrito;