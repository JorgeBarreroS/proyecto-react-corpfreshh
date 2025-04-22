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
        if (!authState || !authState.email) {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await fetch(`http://localhost/corpfresh-php/pedidos/mis_pedidos.php?usuario=${authState.email}`);
                const data = await response.json();
                
                if (response.ok) {
                    setOrders(data);
                } else {
                    throw new Error(data.error || 'Error al cargar los pedidos');
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire('Error', 'No se pudieron cargar los pedidos', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [authState, navigate]);

    const generateInvoice = async (orderId) => {
        try {
            const response = await fetch(`http://localhost/corpfresh-php/facturas/generar_factura.php?pedido_id=${orderId}`);
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
            console.error('Error:', error);
            Swal.fire('Error', 'No se pudo generar la factura', 'error');
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
                                                Fecha: {new Date(order.fecha_pedido).toLocaleDateString()}
                                            </small>
                                        </div>
                                        <div>
                                            <span className={`badge ${order.estado === 'completado' ? 'bg-success' : 'bg-warning'}`}>
                                                {order.estado}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="order-details">
                                        <div>
                                            <p><strong>Total:</strong> ${parseFloat(order.total).toFixed(2)}</p>
                                            <p><strong>Método de pago:</strong> {order.metodo_pago}</p>
                                            <p><strong>Dirección:</strong> {order.direccion_entrega}</p>
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