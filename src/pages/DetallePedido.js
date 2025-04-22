import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const DetallePedido = () => {
    const { id } = useParams();
    const [pedido, setPedido] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Aquí iría la llamada a la API para obtener los detalles del pedido
        const fetchPedido = async () => {
            try {
                const response = await fetch(`http://localhost/corpfresh-php/pedidos/detalle_pedido.php?pedido_id=${id}`);
                const data = await response.json();
                if (response.ok) {
                    setPedido(data);
                } else {
                    throw new Error(data.error || 'Error al cargar el pedido');
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPedido();
    }, [id]);

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="container mt-5 text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-3">Cargando detalles del pedido...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (!pedido) {
        return (
            <div>
                <Navbar />
                <div className="container mt-5">
                    <div className="alert alert-danger">No se pudo cargar la información del pedido</div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className="container my-5">
                <h1>Detalles del Pedido #{pedido.id}</h1>
                {/* Aquí mostrarías los detalles del pedido */}
                <div className="card mt-4">
                    <div className="card-body">
                        <h5 className="card-title">Información del Pedido</h5>
                        <p><strong>Fecha:</strong> {new Date(pedido.fecha_pedido).toLocaleDateString()}</p>
                        <p><strong>Total:</strong> ${pedido.total.toFixed(2)}</p>
                        <p><strong>Estado:</strong> {pedido.estado}</p>
                        <p><strong>Método de Pago:</strong> {pedido.metodo_pago}</p>
                        
                        <h5 className="mt-4">Productos</h5>
                        <ul className="list-group">
                            {pedido.items.map(item => (
                                <li key={item.id} className="list-group-item">
                                    {item.nombre_producto} - ${item.precio_unitario.toFixed(2)} x {item.cantidad}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default DetallePedido;