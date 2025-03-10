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

    // Esta función es ahora la única implementación de fetchComentarios
    const fetchComentarios = async () => {
        try {
            const response = await fetch(`http://localhost/corpfresh-php/comentarios.php?id_producto=${id}`);
            if (!response.ok) throw new Error("Error al cargar comentarios.");
            const data = await response.json();
            setComentarios(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error al cargar comentarios", err);
            setComentarios([]);
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
                    preConfirm: () => navigate('/carrito'),
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Hubo un problema con la solicitud. Intenta nuevamente.', 'error');
        }
    };

    const agregarComentario = async () => {
        // Verificamos con la estructura correcta de authState
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
                    texto: nuevoComentario, 
                    puntuacion: nuevaPuntuacion, 
                    usuario: authState.email // Usando email como identificador de usuario
                })
            });

            const data = await response.json();
            if (data.success) {
                setNuevoComentario('');
                setNuevaPuntuacion(5);
                fetchComentarios(); // Recargar la lista de comentarios
            } else {
                Swal.fire('Error', 'No se pudo agregar el comentario.', 'error');
            }
        } catch (error) {
            console.error("Error al agregar comentario", error);
        }
    };

    if (loading) return <div className="text-center mt-5">Cargando...</div>;
    if (error) return <div className="alert alert-danger">Error: {error}</div>;
    if (!producto) return <div className="alert alert-warning">No se encontró el producto.</div>;

    // Verificamos si el usuario está autenticado para depuración
    console.log("Estado de autenticación:", authState);

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
                        <p><strong>Precio:</strong> ${producto.precio_producto}</p>
                        <p><strong>Descripción:</strong> {producto.descripcion_producto}</p>
                        <p><strong>Color:</strong> {producto.color_producto}</p>
                        <p><strong>Marca:</strong> {producto.nombre_marca}</p>
                        <p><strong>Talla:</strong> {producto.talla}</p>
                        <form onSubmit={handleAddToCart}>
                            <div className="mb-3">
                                <label className="form-label">Cantidad:</label>
                                <input type="number" className="form-control" value={cantidad} onChange={(e) => setCantidad(parseInt(e.target.value))} min="1" required />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg">Añadir al carrito</button>
                        </form>
                    </div>
                </div>
                <hr />
                <h3>Comentarios y Reseñas</h3>
                {/* Verificar con la estructura correcta de authState */}
                {authState && authState.email ? (
                    <div className="mb-3">
                        <textarea className="form-control" placeholder="Escribe un comentario" value={nuevoComentario} onChange={(e) => setNuevoComentario(e.target.value)} />
                        <select className="form-select mt-2" value={nuevaPuntuacion} onChange={(e) => setNuevaPuntuacion(parseInt(e.target.value))}>
                            {[1, 2, 3, 4, 5].map(num => (
                                <option key={num} value={num}>{'⭐'.repeat(num)}</option>
                            ))}
                        </select>
                        <button className="btn btn-success mt-2" onClick={agregarComentario}>Agregar Comentario</button>
                    </div>
                ) : (
                    <div className="alert alert-info">
                        Debes <Link to="/login">iniciar sesión</Link> para agregar comentarios.
                    </div>
                )}
                <ul className="list-group mt-3">
                    {comentarios.length > 0 ? comentarios.map(comentario => (
                        <li key={comentario.id} className="list-group-item">
                            <p>{comentario.texto}</p>
                            <p className="text-warning">{'⭐'.repeat(comentario.puntuacion)}</p>
                        </li>
                    )) : <p>No hay comentarios aún.</p>}
                </ul>
            </div>
            <Footer />
        </div>
    );
};

export default VisualizarProducto;