import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../services/AuthContext';
import '../styles/checkout.css';

const Checkout = () => {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [shipping, setShipping] = useState(0);
    const [taxes, setTaxes] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const { authState } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authState || !authState.email) {
            navigate('/login');
            return;
        }

        const fetchCart = async () => {
            try {
                const response = await fetch(`http://localhost/corpfresh-php/carrito/carrito.php?usuario=${encodeURIComponent(authState.email)}`);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Error al cargar el carrito');
                }

                const data = await response.json();
                setCartItems(data);
                calculateTotals(data);
            } catch (error) {
                console.error('Error:', error);
                Swal.fire('Error', 'No se pudo cargar el carrito', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [authState, navigate]);

    const calculateTotals = (items) => {
        const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.precio) * parseInt(item.cantidad)), 0);
        const shippingCost = subtotal > 100 ? 0 : 10;
        const taxRate = 0.08;
        const taxes = subtotal * taxRate;

        const calculatedTotal = subtotal + shippingCost + taxes;
        
        console.log('Cálculo de totales:', {
            subtotal,
            shippingCost,
            taxes,
            calculatedTotal
        });

        setTotal(calculatedTotal);
        setShipping(shippingCost);
        setTaxes(taxes);
    };

    const handlePayment = async (method) => {
        if (!address || !phone) {
            Swal.fire('Error', 'Por favor completa todos los campos requeridos', 'error');
            return;
        }

        setPaymentMethod(method);
        
        try {
            // Validar y formatear los datos correctamente
            const paymentData = {
                correo_usuario: authState.email,
                items: cartItems.map(item => ({
                    id_producto: parseInt(item.id_producto),
                    nombre: String(item.nombre),
                    precio: parseFloat(item.precio),
                    cantidad: parseInt(item.cantidad),
                    color: item.color || null,
                    talla: item.talla || null
                })),
                total: parseFloat(total.toFixed(2)),
                metodo_pago: method,
                direccion: String(address),
                telefono: String(phone),
                envio: parseFloat(shipping.toFixed(2)),
                impuestos: parseFloat(taxes.toFixed(2))
            };

            console.log('Datos a enviar al servidor:', JSON.stringify(paymentData, null, 2));

            // URL CORREGIDA: usar http (no https) y ruta correcta
            const response = await fetch('http://localhost/corpfresh-php/checkout/process_payment.php', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });

            const responseText = await response.text();
            console.log('Respuesta del servidor:', responseText);

            // Verificar si la respuesta es HTML (error del servidor)
            if (responseText.trim().startsWith('<')) {
                throw new Error('El servidor respondió con una página de error HTML');
            }

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Error parseando JSON:', e);
                throw new Error(`El servidor respondió con formato inválido: ${responseText.substring(0, 100)}...`);
            }

            if (!response.ok || !data.success) {
                throw new Error(data.error || `Error ${response.status} al procesar el pago`);
            }

            // Vaciar el carrito después del pago exitoso
            const deleteResponse = await fetch('http://localhost/corpfresh-php/carrito/carrito.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    usuario: authState.email,
                    vaciar: true
                })
            });

            if (!deleteResponse.ok) {
                throw new Error('No se pudo vaciar el carrito');
            }

            Swal.fire({
                title: '¡Pago exitoso!',
                text: `Tu pedido #${data.data.orderId} ha sido procesado.`,
                icon: 'success',
                confirmButtonText: 'Ver mis pedidos'
            }).then(() => {
                navigate('/mis-pedidos');
            });
        } catch (error) {
            console.error('Error en el pago:', error);
            Swal.fire({
                title: 'Error en el pago',
                html: `Ocurrió un error al procesar tu pago:<br><br>
                      <small>${error.message}</small><br><br>
                      Por favor verifica los datos e intenta nuevamente.`,
                icon: 'error'
            });
        }
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="container mt-5 text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-3">Cargando información de pago...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className="checkout-container">
                <div className="container">
                    <h1 className="checkout-title">Finalizar Compra</h1>
                    
                    <div className="row">
                        <div className="col-lg-8">
                            <div className="checkout-form">
                                <h3>Información de Envío</h3>
                                <div className="mb-3">
                                    <label className="form-label">Dirección de entrega</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Teléfono de contacto</label>
                                    <input 
                                        type="tel" 
                                        className="form-control" 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                </div>
                                
                                <h3 className="mt-4">Método de Pago</h3>
                                <div className="payment-methods">
                                    <div 
                                        className={`payment-method ${paymentMethod === 'casa' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('casa')}
                                    >
                                        <i className="fas fa-home"></i>
                                        <span>Pago en Casa</span>
                                    </div>
                                    <div 
                                        className={`payment-method ${paymentMethod === 'nequi' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('nequi')}
                                    >
                                        <i className="fas fa-mobile-alt"></i>
                                        <span>Pago con Nequi</span>
                                    </div>
                                </div>
                                
                                {paymentMethod === 'nequi' && (
                                    <div className="nequi-info mt-3">
                                        <p>Por favor realiza el pago a nuestro número de Nequi: <strong>320 8706701</strong></p>
                                        <p>Envía el comprobante de pago al WhatsApp: <strong>320 8706701</strong></p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="col-lg-4">
                            <div className="order-summary">
                                <h3>Resumen del Pedido</h3>
                                <div className="summary-items">
                                    {cartItems.map(item => (
                                        <div key={item.id_carrito} className="summary-item">
                                            <span>{item.nombre} x {item.cantidad}</span>
                                            <span>${(parseFloat(item.precio) * parseInt(item.cantidad)).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="summary-totals">
                                    <div className="summary-total">
                                        <span>Subtotal</span>
                                        <span>${(total - shipping - taxes).toFixed(2)}</span>
                                    </div>
                                    <div className="summary-total">
                                        <span>Envío</span>
                                        <span>${shipping.toFixed(2)}</span>
                                    </div>
                                    <div className="summary-total">
                                        <span>Impuestos</span>
                                        <span>${taxes.toFixed(2)}</span>
                                    </div>
                                    <div className="summary-total grand-total">
                                        <span>Total</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                </div>
                                
                                <button 
                                    className="btn btn-primary w-100 mt-3"
                                    onClick={() => handlePayment(paymentMethod)}
                                    disabled={!paymentMethod}
                                >
                                    Confirmar Pedido
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Checkout;