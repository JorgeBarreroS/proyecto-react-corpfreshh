import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../services/AuthContext';
import '../styles/mis-pedidos.css';

const MisPedidos = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { authState } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authState?.email) {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `http://localhost/corpfresh-php/pedidos/mis_pedidos.php?usuario=${encodeURIComponent(authState.email)}`,
                    {
                        credentials: 'include'
                    }
                );

                const data = await response.json();
                
                if (!response.ok || !data.success) {
                    throw new Error(data.error || 'Error al cargar los pedidos');
                }

                setOrders(data.data || []);
            } catch (error) {
                console.error('Error al obtener pedidos:', error);
                Swal.fire({
                    title: 'Error',
                    text: error.message || 'No se pudieron cargar los pedidos',
                    icon: 'error'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [authState, navigate]);

    const generateInvoice = async (orderId) => {
        try {
            const response = await fetch(
                `http://localhost/corpfresh-php/facturas/generar_factura.php?pedido_id=${orderId}`,
                {
                    credentials: 'include'
                }
            );

            if (!response.ok) {
                throw new Error('Error al generar la factura');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `factura-${orderId}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al generar factura:', error);
            Swal.fire({
                title: 'Error',
                text: error.message || 'No se pudo generar la factura',
                icon: 'error'
            });
        }
    };

    const calculateSubtotal = (order) => {
        return (order.total - (order.costo_envio || 0) - (order.impuestos || 0)).toFixed(2);
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="container mt-5 text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-3">Cargando tus pedidos...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className="mis-pedidos-container">
                <div className="container">
                    <h1 className="mis-pedidos-title">Mis Pedidos</h1>
                    
                    {orders.length === 0 ? (
                        <div className="no-orders">
                            <i className="fas fa-box-open"></i>
                            <h3>Aún no tienes pedidos</h3>
                            <p>Cuando realices un pedido, aparecerá aquí.</p>
                            <button 
                                className="btn btn-primary mt-3"
                                onClick={() => navigate('/tienda')}
                            >
                                Ir a la tienda
                            </button>
                        </div>
                    ) : (
                        <div className="orders-list">
                            {orders.map(order => (
                                <div key={order.id} className="order-card">
                                    <div className="order-header">
                                        <div>
                                            <h4>Pedido #{order.id}</h4>
                                            <small className="text-muted">
                                                Fecha: {new Date(order.fecha_pedido).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </small>
                                        </div>
                                        <div>
                                            <span className={`badge ${order.estado === 'completado' ? 'bg-success' : 'bg-warning'}`}>
                                                {order.estado.charAt(0).toUpperCase() + order.estado.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="order-details">
                                        <div>
                                            <p><strong>Subtotal:</strong> ${calculateSubtotal(order)}</p>
                                            <p><strong>Envío:</strong> ${order.costo_envio?.toFixed(2) || '0.00'}</p>
                                            <p><strong>Impuestos:</strong> ${order.impuestos?.toFixed(2) || '0.00'}</p>
                                            <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                                            <p><strong>Método de pago:</strong> {order.metodo_pago}</p>
                                            <p><strong>Dirección:</strong> {order.direccion_entrega}</p>
                                            <p><strong>Productos:</strong> {order.total_productos}</p>
                                        </div>
                                        
                                        <div className="order-actions">
                                            <button 
                                                className="btn btn-outline-primary"
                                                onClick={() => navigate(`/mis-pedidos/${order.id}`)}
                                            >
                                                Ver detalles
                                            </button>
                                            <button 
                                                className="btn btn-outline-secondary"
                                                onClick={() => generateInvoice(order.id)}
                                                disabled={order.estado !== 'completado'}
                                                title={order.estado !== 'completado' ? 'Factura disponible solo para pedidos completados' : ''}
                                            >
                                                <i className="fas fa-file-invoice"></i> Factura
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default MisPedidos;