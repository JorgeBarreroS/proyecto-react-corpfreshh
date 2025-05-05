import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const DetallePedido = () => {
    const { id } = useParams();
    const [pedido, setPedido] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPedido = async () => {
            try {
                const response = await fetch(`http://localhost/corpfresh-php/pedidos/detalle_pedido.php?pedido_id=${id}`);
                const data = await response.json();
                if (response.ok) {
                    // Asegurarnos que total es un número
                    const pedidoConTotalNumerico = {
                        ...data,
                        total: parseFloat(data.total) || 0
                    };
                    setPedido(pedidoConTotalNumerico);
                } else {
                    throw new Error(data.error || 'Error al cargar el pedido');
                }
            } catch (error) {
                console.error('Error:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPedido();
    }, [id]);

    // Función para formatear precios en pesos colombianos
    const formatPrecio = (precio) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(precio);
    };

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

    if (error || !pedido) {
        return (
            <div>
                <Navbar />
                <div className="container mt-5">
                    <div className="alert alert-danger">
                        {error || 'No se pudo cargar la información del pedido'}
                    </div>
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
                <div className="card mt-4">
                    <div className="card-body">
                        <h5 className="card-title">Información del Pedido</h5>
                        <p><strong>Fecha:</strong> {new Date(pedido.fecha_pedido).toLocaleDateString('es-CO', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</p>
                        <p><strong>Total:</strong> {formatPrecio(pedido.total)}</p>
                        <p><strong>Estado:</strong> {pedido.estado}</p>
                        <p><strong>Método de Pago:</strong> {pedido.metodo_pago}</p>
                        
                        <h5 className="mt-4">Productos</h5>
                        <ul className="list-group">
                            {pedido.items.map(item => (
                                <li key={item.id} className="list-group-item">
                                    {item.nombre_producto} - {formatPrecio(parseFloat(item.precio_unitario) || 0)} x {item.cantidad}
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