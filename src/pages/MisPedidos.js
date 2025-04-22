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

                // Normalizar estados a minúsculas
                const normalizedOrders = (data.data || []).map(order => ({
                    ...order,
                    estado: order.estado.toLowerCase()
                }));
                
                setOrders(normalizedOrders);
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
            Swal.fire({
                title: 'Generando factura',
                html: 'Por favor espere...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const response = await fetch(
                `http://localhost/corpfresh-php/facturas/generar_factura.php?pedido_id=${orderId}`,
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/pdf'
                    }
                }
            );

            const contentType = response.headers.get('content-type');
            if (!response.ok || !contentType.includes('application/pdf')) {
                const errorText = await response.text();
                throw new Error(errorText || 'La respuesta no es un PDF válido');
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `factura_${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

            Swal.close();
            Swal.fire({
                title: '¡Factura descargada!',
                text: 'La factura se ha generado correctamente',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

        } catch (error) {
            console.error('Error al generar factura:', error);
            Swal.fire({
                title: 'Error',
                text: error.message.includes('Failed to fetch') 
                    ? 'No se pudo conectar al servidor' 
                    : error.message || 'Error al generar la factura',
                icon: 'error'
            });
        }
    };

    const calculateSubtotal = (order) => {
        return (order.total - (order.costo_envio || 0) - (order.impuestos || 0)).toFixed(2);
    };

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    const getStatusBadgeClass = (status) => {
        switch(status) {
            case 'completado':
                return 'bg-success';
            case 'cancelado':
                return 'bg-danger';
            case 'pendiente':
                return 'bg-secondary';
            case 'procesando':
                return 'bg-info';
            case 'enviado':
                return 'bg-primary';
            default:
                return 'bg-warning';
        }
    };

    const canGenerateInvoice = (status) => {
        return status === 'completado'; // Solo permitir factura para pedidos completados
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="container mt-5 text-center">
                    <div className="spinner-border text-primary" role="status">
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
                                                <i className="far fa-calendar-alt me-1"></i>
                                                {formatDate(order.fecha_pedido)}
                                            </small>
                                        </div>
                                        <div>
                                            <span className={`badge rounded-pill ${getStatusBadgeClass(order.estado)}`}>
                                                {order.estado.charAt(0).toUpperCase() + order.estado.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="order-details">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="order-summary">
                                                    <h5 className="mb-3"><i className="fas fa-receipt me-2"></i>Resumen</h5>
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <span>Subtotal:</span>
                                                        <span>${calculateSubtotal(order)}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <span>Envío:</span>
                                                        <span>${order.costo_envio?.toFixed(2) || '0.00'}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <span>Impuestos:</span>
                                                        <span>${order.impuestos?.toFixed(2) || '0.00'}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between fw-bold mt-2 pt-2 border-top">
                                                        <span>Total:</span>
                                                        <span>${order.total.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="order-info">
                                                    <h5 className="mb-3"><i className="fas fa-info-circle me-2"></i>Información</h5>
                                                    <p className="mb-2">
                                                        <i className="far fa-credit-card me-2"></i>
                                                        <strong>Método de pago:</strong> {order.metodo_pago}
                                                    </p>
                                                    <p className="mb-2">
                                                        <i className="fas fa-map-marker-alt me-2"></i>
                                                        <strong>Dirección:</strong> {order.direccion_entrega}
                                                    </p>
                                                    <p className="mb-2">
                                                        <i className="fas fa-boxes me-2"></i>
                                                        <strong>Productos:</strong> {order.total_productos}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="order-actions d-flex justify-content-end mt-3 pt-3 border-top">
                                            <button 
                                                className="btn btn-outline-primary me-2"
                                                onClick={() => navigate(`/mis-pedidos/${order.id}`)}
                                            >
                                                <i className="fas fa-eye me-1"></i> Ver detalles
                                            </button>
                                            <button 
                                                className={`btn ${canGenerateInvoice(order.estado) ? 'btn-outline-success' : 'btn-outline-secondary'}`}
                                                onClick={() => generateInvoice(order.id)}
                                                disabled={!canGenerateInvoice(order.estado)}
                                                title={!canGenerateInvoice(order.estado) ? `Factura disponible solo para pedidos completados (Estado actual: ${order.estado})` : 'Descargar factura'}
                                            >
                                                <i className="fas fa-file-invoice-dollar me-1"></i> Factura
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