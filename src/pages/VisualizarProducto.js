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

    // Función para formatear precios en pesos colombianos
    const formatPrecio = (precio) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(precio);
    };

    const getImageSource = (imagePath) => {
        if (!imagePath) return "http://localhost/corpfresh-php/imagenes/1.jpg";
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
        return `http://localhost/corpfresh-php/${imagePath}`;
    };

    const fetchComentarios = async () => {
        setLoadingComentarios(true);
        try {
            const response = await fetch(`http://localhost/corpfresh-php/comentarios.php?id_producto=${id}`);
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            
            const data = await response.json();
            setComentarios(Array.isArray(data) ? data : []);
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
            setLoading(true);
            setError(null);
            setProducto(null); // Resetear producto
            
            // Primero obtener el producto
            const response = await fetch(`http://localhost/corpfresh-php/visualizarProducto.php?id=${id}`);
            if (!response.ok) throw new Error("No se pudo cargar el producto.");
            const data = await response.json();
            
            // Si hay error con el producto, no buscamos ofertas
            if (data.error) {
                setProducto(null);
                setLoading(false);
                return;
            }
            
            // Solo buscar oferta si tenemos un producto válido
            const ofertaResponse = await fetch(`http://localhost/CorpFreshhXAMPP/bd/Ofertas/obtenerOfertaActiva.php?id_producto=${id}`);
            let ofertaData = { success: false };
            
            if (ofertaResponse.ok) {
                ofertaData = await ofertaResponse.json();
            }
            
            // Establecer el producto con o sin oferta
            setProducto({
                ...data,
                oferta: ofertaData.success ? ofertaData.data : null
            });
            
            // Manejar cantidad según stock
            if (data.stock > 0) {
                setCantidad(1);
            } else {
                setCantidad(0);
            }
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

        // Validación de stock
        if (cantidad > producto.stock) {
            Swal.fire('Error', `No hay suficiente stock. Stock disponible: ${producto.stock}`, 'error');
            return;
        }
        
        try {
            const response = await addToCart({
                id_producto: producto.id_producto,
                nombre: producto.nombre_producto,
                precio: producto.precio_producto,
                imagen: producto.imagen_producto,
                cantidad,
            });
            
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

    const agregarComentario = async () => {
        if (!authState?.email) {
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
            
            const data = await response.json();
            if (data.success) {
                setNuevoComentario('');
                setNuevaPuntuacion(5);
                await fetchComentarios();
                Swal.fire('Éxito', 'Comentario agregado correctamente.', 'success');
            } else {
                throw new Error(data.error || 'No se pudo agregar el comentario.');
            }
        } catch (error) {
            console.error("Error al agregar comentario:", error);
            Swal.fire('Error', error.message, 'error');
        }
    };

    const eliminarComentario = async (idComentario) => {
        if (!authState?.email) {
            Swal.fire('Error', 'Debes iniciar sesión para eliminar comentarios.', 'error');
            return;
        }

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

        if (!confirmResult.isConfirmed) return;

        try {
            const response = await fetch('http://localhost/corpfresh-php/comentarios.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_comentario: idComentario })
            });
            
            const data = await response.json();
            if (data.success) {
                await fetchComentarios();
                Swal.fire('Éxito', 'Comentario eliminado correctamente.', 'success');
            } else {
                throw new Error(data.error || 'No se pudo eliminar el comentario.');
            }
        } catch (error) {
            console.error("Error al eliminar comentario:", error);
            Swal.fire('Error', error.message, 'error');
        }
    };

    const iniciarEdicionComentario = (comentario) => {
        setEditingCommentId(comentario.id_comentario);
        setEditingCommentText(comentario.comentario);
    };

    const cancelarEdicionComentario = () => {
        setEditingCommentId(null);
        setEditingCommentText('');
    };

    const guardarEdicionComentario = async () => {
        if (!authState?.email) {
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
            
            const data = await response.json();
            if (data.success) {
                await fetchComentarios();
                setEditingCommentId(null);
                setEditingCommentText('');
                Swal.fire('Éxito', 'Comentario actualizado correctamente.', 'success');
            } else {
                throw new Error(data.error || 'No se pudo actualizar el comentario.');
            }
        } catch (error) {
            console.error("Error al actualizar comentario:", error);
            Swal.fire('Error', error.message, 'error');
        }
    };

    const renderStars = (rating) => {
        return '⭐'.repeat(rating);
    };

    if (loading) return (
        <div className="product-loading-container">
            <div className="product-spinner" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
        </div>
    );

    if (error) return (
        <div className="product-error-container">
            <div className="product-alert alert-danger">Error: {error}</div>
        </div>
    );

    if (!producto) return (
        <div className="product-not-found-container">
            <div className="product-alert alert-warning">No se encontró el producto.</div>
        </div>
    );

    // Determinar si hay suficiente stock para mostrar la UI adecuada
    const hayStock = producto.stock > 0;
    const stockBajo = hayStock && producto.stock <= 5;

    return (
        <div className="product-view-page">
            <Navbar />
            <div className="product-view-container">
                <div className="product-details-row">
                    <div className="product-image-col">
                        <div className="product-image-wrapper">
                            <img 
                                src={getImageSource(producto.imagen_producto)} 
                                className="product-images" 
                                alt={producto.nombre_producto}
                                onError={(e) => {
                                    e.target.src = "http://localhost/corpfresh-php/imagenes/1.jpg";
                                }}
                            />
                        </div>
                    </div>
                    <div className="product-info-col">
                        <h2 className="product-title">{producto.nombre_producto}</h2>
                        <p className="product-text">
                            <strong>Precio:</strong> 
                            {producto.oferta ? (
                                <>
                                    <span className="text-decoration-line-through text-muted">
                                        {formatPrecio(producto.precio_producto)}
                                    </span>
                                    <span className="text-danger ms-2">
                                        {formatPrecio(producto.precio_producto * (1 - producto.oferta.porcentaje_descuento / 100))}
                                    </span>
                                    <span className="badge bg-danger ms-2">
                                        -{producto.oferta.porcentaje_descuento}%
                                    </span>
                                </>
                            ) : (
                                <span>{formatPrecio(producto.precio_producto)}</span>
                            )}
                        </p>
                        <p className="product-text"><strong>Descripción:</strong> {producto.descripcion_producto}</p>
                        <p className="product-text"><strong>Color:</strong> {producto.color_producto}</p>
                        <p className="product-text"><strong>Marca:</strong> {producto.nombre_marca}</p>
                        <p className="product-text"><strong>Talla:</strong> {producto.talla}</p>
                        
                        {/* Mostrar información de stock */}
                        <p className={`product-text ${!hayStock ? 'text-danger' : (stockBajo ? 'text-warning' : 'text-success')}`}>
                            <strong>Stock disponible:</strong> {producto.stock}
                            {!hayStock && <span> - Agotado</span>}
                            {stockBajo && hayStock && <span> - ¡Últimas unidades!</span>}
                        </p>
                        
                        <form onSubmit={handleAddToCart} className="product-form">
                            <div className="product-form-group">
                                <label className="product-form-label">Cantidad:</label>
                                <input 
                                    type="number" 
                                    className="product-form-control" 
                                    value={cantidad} 
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value) || 0;
                                        // Limitar la cantidad al stock disponible
                                        if (value <= producto.stock) {
                                            setCantidad(value);
                                        } else {
                                            setCantidad(producto.stock);
                                            Swal.fire('Aviso', `Solo hay ${producto.stock} unidades disponibles.`, 'info');
                                        }
                                    }}
                                    min="1"
                                    max={producto.stock} 
                                    required 
                                    disabled={!hayStock}
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="product-btn btn-primary"
                                disabled={!hayStock || cantidad <= 0}
                            >
                                {hayStock ? 'Añadir al carrito' : 'Producto agotado'}
                            </button>
                        </form>
                    </div>
                </div>
                
                <div className="comments-section">
                    <h3 className="comments-title">Comentarios y Reseñas</h3>
                    
                    {authState?.email ? (
                        <div className="comment-form-container">
                            <textarea 
                                className="product-form-control" 
                                placeholder="Escribe un comentario" 
                                value={nuevoComentario} 
                                onChange={(e) => setNuevoComentario(e.target.value)}
                                rows="3"
                            />
                            <div className="comment-form-actions">
                                <select 
                                    className="product-form-control rating-select" 
                                    value={nuevaPuntuacion} 
                                    onChange={(e) => setNuevaPuntuacion(parseInt(e.target.value))}
                                >
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <option key={num} value={num}>{renderStars(num)}</option>
                                    ))}
                                </select>
                                <button 
                                    className="product-btn btn-success" 
                                    onClick={agregarComentario}
                                    disabled={nuevoComentario.trim() === ''}
                                >
                                    Agregar Comentario
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="product-alert alert-info">
                            Debes <Link to="/login">iniciar sesión</Link> para agregar comentarios.
                        </div>
                    )}
                    
                    {loadingComentarios ? (
                        <div className="comments-loading">
                            <div className="product-spinner spinner-border-sm" role="status">
                                <span className="visually-hidden">Cargando comentarios...</span>
                            </div>
                            <span>Cargando comentarios...</span>
                        </div>
                    ) : comentarios.length > 0 ? (
                        <div className="comments-list">
                            {comentarios.map(comentario => (
                                <div key={comentario.id_comentario} className="comment-card">
                                    <div className="comment-header">
                                        <div>
                                            <h5 className="comment-user">{comentario.usuario}</h5>
                                            <h6 className="comment-date">
                                                {new Date(comentario.fecha).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </h6>
                                        </div>
                                        <div className="comment-rating">{renderStars(comentario.puntuacion)}</div>
                                    </div>
                                    
                                    {editingCommentId === comentario.id_comentario ? (
                                        <div className="comment-edit-form">
                                            <textarea 
                                                className="product-form-control" 
                                                value={editingCommentText} 
                                                onChange={(e) => setEditingCommentText(e.target.value)}
                                                rows="3"
                                            />
                                            <div className="edit-actions">
                                                <button 
                                                    className="product-btn btn-primary" 
                                                    onClick={guardarEdicionComentario}
                                                    disabled={editingCommentText.trim() === ''}
                                                >
                                                    Guardar
                                                </button>
                                                <button 
                                                    className="product-btn btn-secondary" 
                                                    onClick={cancelarEdicionComentario}
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="comment-text">{comentario.comentario}</p>
                                    )}
                                    
                                    {authState?.email === comentario.usuario && editingCommentId !== comentario.id_comentario && (
                                        <div className="comment-actions">
                                            <button 
                                                className="product-btn btn-outline-primary" 
                                                onClick={() => iniciarEdicionComentario(comentario)}
                                            >
                                                Editar
                                            </button>
                                            <button 
                                                className="product-btn btn-outline-danger" 
                                                onClick={() => eliminarComentario(comentario.id_comentario)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="product-alert alert-light">
                            No hay comentarios aún. ¡Sé el primero en comentar!
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default VisualizarProducto;