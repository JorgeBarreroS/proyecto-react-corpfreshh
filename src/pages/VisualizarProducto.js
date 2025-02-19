import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/visualizarProducto.css';
import { addToCart } from '../services/carritoService';

const VisualizarProducto = () => {
    const { id } = useParams();
    const [producto, setProducto] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [nuevaPuntuacion, setNuevaPuntuacion] = useState(5);
    const [paginaActual, setPaginaActual] = useState(1);
    const comentariosPorPagina = 5;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducto = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost/corpfresh-php/visualizarProducto.php?id=${id}`);
                if (!response.ok) {
                    throw new Error(`Error al cargar el producto: ${response.status}`);
                }
                const data = await response.json();
                if (data.error) {
                    setError(data.error);
                    setProducto(null);
                } else {
                    setProducto(data);
                }
            } catch (err) {
                setError("No se pudo cargar el producto.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducto();
    }, [id]);

    const handleAddToCart = async (e) => {
        e.preventDefault();
        if (cantidad < 1) {
            Swal.fire('Error', 'La cantidad debe ser al menos 1', 'error');
            return;
        }
        const productData = {
            id_producto: producto.id_producto,
            nombre: producto.nombre_producto,
            precio: producto.precio_producto,
            imagen: producto.imagen_producto,
            cantidad,
        };
        try {
            const response = await addToCart(productData);
            if (response.error) {
                Swal.fire('Error', response.error, 'error');
            } else {
                Swal.fire({
                    title: 'Producto agregado',
                    text: 'El producto se ha añadido al carrito.',
                    icon: 'success',
                    confirmButtonText: 'Ver el carrito',
                    showCancelButton: true,
                    preConfirm: () => navigate('/carrito'),
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Hubo un problema con la solicitud. Intenta nuevamente.', 'error');
        }
    };

    const promedioEstrellas = comentarios.length ? (comentarios.reduce((acc, c) => acc + Number(c.puntuacion), 0) / comentarios.length).toFixed(1) : "0";

    const comentariosPaginados = comentarios.slice((paginaActual - 1) * comentariosPorPagina, paginaActual * comentariosPorPagina);

    if (loading) return <div className="text-center mt-5">Cargando...</div>;
    if (error) return <div className="alert alert-danger">Error: {error}</div>;
    if (!producto) return <div className="alert alert-warning">No se encontró el producto.</div>;

    return (
        <div>
            <Navbar />
            <div className="container mt-5">
                <div className="row">
                    <div className="col-md-6">
                        <img src={`http://localhost/corpfresh-php/${producto.imagen_producto}`} className="img-fluid w-75" alt={producto.nombre_producto} />
                    </div>
                    <div className="col-md-6">
                        <h2>{producto.nombre_producto}</h2>
                        <p className="h3 mb-4">${producto.precio_producto}</p>
                        <p><strong>Descripción:</strong> {producto.descripcion_producto}</p>
                        <p><strong>Color:</strong> {producto.color_producto}</p>
                        <p><strong>Marca:</strong> {producto.nombre_marca}</p>
                        <p><strong>Talla:</strong> {producto.talla}</p>
                        <p><strong>Calificación promedio:</strong> {promedioEstrellas} ⭐</p>
                        <form onSubmit={handleAddToCart}>
                            <div className="mb-3">
                                <label className="form-label">Cantidad:</label>
                                <input type="number" className="form-control" value={cantidad} onChange={(e) => setCantidad(e.target.value)} min="1" required />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg">Añadir al carrito</button>
                        </form>
                    </div>
                </div>
                <hr />
                <h3>Comentarios y Reseñas</h3>
                <div className="mb-3">
                    <textarea className="form-control mt-2" placeholder="Escribe un comentario" value={nuevoComentario} onChange={(e) => setNuevoComentario(e.target.value)} />
                    <select className="form-select mt-2" value={nuevaPuntuacion} onChange={(e) => setNuevaPuntuacion(e.target.value)}>
                        {[1, 2, 3, 4, 5].map(num => (
                            <option key={num} value={num}>{'⭐'.repeat(num)}</option>
                        ))}
                    </select>
                    <button className="btn btn-success mt-2" onClick={() => {
                        if (nuevoComentario.trim() !== '') {
                            setComentarios([...comentarios, { id: Date.now(), texto: nuevoComentario, puntuacion: nuevaPuntuacion }]);
                            setNuevoComentario('');
                            setNuevaPuntuacion(5);
                        }
                    }}>Agregar Comentario</button>
                </div>
                <ul className="list-group mt-3">
                    {comentariosPaginados.map(comentario => (
                        <li key={comentario.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <p className="mb-0">{comentario.texto}</p>
                                <p className="mb-0 text-warning">{'⭐'.repeat(comentario.puntuacion)}</p>
                            </div>
                            <button className="btn btn-danger btn-sm" onClick={() => setComentarios(comentarios.filter(c => c.id !== comentario.id))}>Eliminar</button>
                        </li>
                    ))}
                </ul>
                <div className="mt-3">
                    <button className="btn btn-secondary me-2" disabled={paginaActual === 1} onClick={() => setPaginaActual(paginaActual - 1)}>Anterior</button>
                    <button className="btn btn-secondary" disabled={paginaActual * comentariosPorPagina >= comentarios.length} onClick={() => setPaginaActual(paginaActual + 1)}>Siguiente</button>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default VisualizarProducto;
