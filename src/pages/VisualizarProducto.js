import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/visualizarProducto.css';
import { useAuth } from '../services/AuthContext';
import { addToCart } from '../services/carritoService';

const VisualizarProducto = () => {
    const { id } = useParams();
    const { authState } = useAuth();
    const navigate = useNavigate();
    const [producto, setProducto] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [nuevaPuntuacion, setNuevaPuntuacion] = useState(5);
    const [loadingComentarios, setLoadingComentarios] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState('');

    // Función mejorada para obtener comentarios
    const fetchComentarios = async () => {
        setLoadingComentarios(true);
        try {
            const response = await fetch(`http://localhost/corpfresh-php/comentarios.php?id_producto=${id}`);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (Array.isArray(data)) {
                setComentarios(data);
            } else if (data.success === false) {
                console.warn("Error al cargar comentarios:", data.error);
                setComentarios([]);
            } else {
                setComentarios([]);
                console.warn("Formato de datos inesperado:", data);
            }
        } catch (err) {
            console.error("Error al obtener comentarios:", err);
            setComentarios([]);
        } finally {
            setLoadingComentarios(false);
        }
    };

    useEffect(() => {
        const fetchProducto = async () => {
            try {
                const response = await fetch(`http://localhost/corpfresh-php/visualizarProducto.php?id=${id}`);
                if (!response.ok) throw new Error("No se pudo cargar el producto.");
                const data = await response.json();
                setProducto(data.error ? null : data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducto();
        fetchComentarios();
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
                    cancelButtonText: 'Seguir comprando',
                    preConfirm: () => navigate('/carrito'),
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Hubo un problema con la solicitud. Intenta nuevamente.', 'error');
        }
    };

    // Función mejorada para agregar comentarios
    const agregarComentario = async () => {
        if (!authState || !authState.email) {
            Swal.fire('Error', 'Debes iniciar sesión para comentar.', 'error');
            return;
        }
    
        if (nuevoComentario.trim() === '') {
            Swal.fire('Error', 'El comentario no puede estar vacío.', 'error');
            return;
        }
    
        try {
            const response = await fetch('http://localhost/corpfresh-php/comentarios.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id_producto: id, 
                    comentario: nuevoComentario,
                    puntuacion: nuevaPuntuacion, 
                    usuario: authState.email 
                })
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                setNuevoComentario('');
                setNuevaPuntuacion(5);
                await fetchComentarios();
                Swal.fire('Éxito', 'Comentario agregado correctamente.', 'success');
            } else {
                Swal.fire('Error', data.error || 'No se pudo agregar el comentario.', 'error');
            }
        } catch (error) {
            console.error("Error al agregar comentario:", error);
            Swal.fire('Error', `Hubo un problema con la solicitud: ${error.message}`, 'error');
        }
    };

    // Función para eliminar comentario
    const eliminarComentario = async (idComentario) => {
        if (!authState || !authState.email) {
            Swal.fire('Error', 'Debes iniciar sesión para eliminar comentarios.', 'error');
            return;
        }

        // Confirmación antes de eliminar
        const confirmResult = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'No podrás revertir esta acción',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmResult.isConfirmed) {
            return;
        }

        try {
            const response = await fetch('http://localhost/corpfresh-php/comentarios.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_comentario: idComentario })
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.success) {
                await fetchComentarios();
                Swal.fire('Éxito', 'Comentario eliminado correctamente.', 'success');
            } else {
                Swal.fire('Error', data.error || 'No se pudo eliminar el comentario.', 'error');
            }
        } catch (error) {
            console.error("Error al eliminar comentario:", error);
            Swal.fire('Error', `Hubo un problema al eliminar el comentario: ${error.message}`, 'error');
        }
    };

    // Función para iniciar edición de comentario
    const iniciarEdicionComentario = (comentario) => {
        setEditingCommentId(comentario.id_comentario);
        setEditingCommentText(comentario.comentario);
    };

    // Función para cancelar edición
    const cancelarEdicionComentario = () => {
        setEditingCommentId(null);
        setEditingCommentText('');
    };

    // Función para guardar edición de comentario
    const guardarEdicionComentario = async () => {
        if (!authState || !authState.email) {
            Swal.fire('Error', 'Debes iniciar sesión para editar comentarios.', 'error');
            return;
        }

        if (editingCommentText.trim() === '') {
            Swal.fire('Error', 'El comentario no puede estar vacío.', 'error');
            return;
        }

        try {
            const response = await fetch('http://localhost/corpfresh-php/comentarios.php', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id_comentario: editingCommentId, 
                    comentario: editingCommentText 
                })
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.success) {
                await fetchComentarios();
                setEditingCommentId(null);
                setEditingCommentText('');
                Swal.fire('Éxito', 'Comentario actualizado correctamente.', 'success');
            } else {
                Swal.fire('Error', data.error || 'No se pudo actualizar el comentario.', 'error');
            }
        } catch (error) {
            console.error("Error al actualizar comentario:", error);
            Swal.fire('Error', `Hubo un problema al actualizar el comentario: ${error.message}`, 'error');
        }
    };

    // Función para representar las estrellas de puntuación
    const renderStars = (rating) => {
        return '⭐'.repeat(rating);
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"><span className="visually-hidden">Cargando...</span></div></div>;
    if (error) return <div className="alert alert-danger">Error: {error}</div>;
    if (!producto) return <div className="alert alert-warning">No se encontró el producto.</div>;

    return (
        <div>
            <Navbar />
            <div className="container mt-5 mb-5">
                <div className="row">
                    <div className="col-md-6">
                        <img src={`http://localhost/corpfresh-php/${producto.imagen_producto}`} className="img-fluid w-75" alt={producto.nombre_producto} />
                    </div>
                    <div className="col-md-6">
                        <h2>{producto.nombre_producto}</h2>
                        <p><strong>Precio:</strong> ${producto.precio_producto}</p>
                        <p><strong>Descripción:</strong> {producto.descripcion_producto}</p>
                        <p><strong>Color:</strong> {producto.color_producto}</p>
                        <p><strong>Marca:</strong> {producto.nombre_marca}</p>
                        <p><strong>Talla:</strong> {producto.talla}</p>
                        <form onSubmit={handleAddToCart}>
                            <div className="mb-3">
                                <label className="form-label">Cantidad:</label>
                                <input type="number" className="form-control" value={cantidad} onChange={(e) => setCantidad(parseInt(e.target.value) || 0)} min="1" required />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg">Añadir al carrito</button>
                        </form>
                    </div>
                </div>
                <hr className="my-4" />
                <h3 className="mb-3">Comentarios y Reseñas</h3>
                {authState && authState.email ? (
                    <div className="mb-4 comment-form">
                        <textarea 
                            className="form-control mb-2" 
                            placeholder="Escribe un comentario" 
                            value={nuevoComentario} 
                            onChange={(e) => setNuevoComentario(e.target.value)}
                            rows="3"
                        />
                        <div className="d-flex align-items-center">
                            <select 
                                className="form-select me-2" 
                                value={nuevaPuntuacion} 
                                onChange={(e) => setNuevaPuntuacion(parseInt(e.target.value))}
                                style={{ maxWidth: "160px" }}
                            >
                                {[1, 2, 3, 4, 5].map(num => (
                                    <option key={num} value={num}>{renderStars(num)}</option>
                                ))}
                            </select>
                            <button 
                                className="btn btn-success" 
                                onClick={agregarComentario}
                                disabled={nuevoComentario.trim() === ''}
                            >
                                Agregar Comentario
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="alert alert-info mb-4">
                        Debes <Link to="/login">iniciar sesión</Link> para agregar comentarios.
                    </div>
                )}
                
                {loadingComentarios ? (
                    <div className="text-center my-4">
                        <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Cargando comentarios...</span>
                        </div>
                        <span className="ms-2">Cargando comentarios...</span>
                    </div>
                ) : comentarios.length > 0 ? (
                    <div className="comments-container">
                        {comentarios.map(comentario => (
                            <div key={comentario.id_comentario} className="card mb-3">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h5 className="card-title">{comentario.usuario}</h5>
                                            <h6 className="card-subtitle mb-2 text-muted">
                                                {new Date(comentario.fecha).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </h6>
                                        </div>
                                        <div className="rating">{renderStars(comentario.puntuacion)}</div>
                                    </div>
                                    
                                    {editingCommentId === comentario.id_comentario ? (
                                        <div className="mt-3">
                                            <textarea 
                                                className="form-control mb-2" 
                                                value={editingCommentText} 
                                                onChange={(e) => setEditingCommentText(e.target.value)}
                                                rows="3"
                                            />
                                            <div className="d-flex gap-2">
                                                <button 
                                                    className="btn btn-sm btn-primary" 
                                                    onClick={guardarEdicionComentario}
                                                    disabled={editingCommentText.trim() === ''}
                                                >
                                                    Guardar
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-secondary" 
                                                    onClick={cancelarEdicionComentario}
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="card-text mt-2">{comentario.comentario}</p>
                                    )}
                                    
                                    {authState && authState.email === comentario.usuario && editingCommentId !== comentario.id_comentario && (
                                        <div className="mt-2 d-flex gap-2">
                                            <button 
                                                className="btn btn-sm btn-outline-primary" 
                                                onClick={() => iniciarEdicionComentario(comentario)}
                                            >
                                                Editar
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-outline-danger" 
                                                onClick={() => eliminarComentario(comentario.id_comentario)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="alert alert-light text-center">
                        No hay comentarios aún. ¡Sé el primero en comentar!
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default VisualizarProducto;