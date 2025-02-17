// components/VisualizarProducto.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Importa useNavigate
import Swal from 'sweetalert2'; // Librería para mostrar mensajes emergentes
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/visualizarProducto.css';
import { addToCart } from '../services/carritoService'; // Importa desde el servicio

const VisualizarProducto = () => {
    const { id } = useParams(); // Obtener el ID del producto de la URL
    const [producto, setProducto] = useState(null);
    const [cantidad, setCantidad] = useState(1); // Variable para la cantidad seleccionada
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Hook para la navegación

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

    // Función para manejar la adición al carrito
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
          console.log('Datos a enviar al carrito:', productData);
          
          const response = await addToCart(productData);
          
          console.log('Respuesta de addToCart:', response);
      
          if (response.error) {
            Swal.fire('Error', response.error, 'error');
          } else {
            Swal.fire({
              title: 'Producto agregado',
              text: 'El producto se ha añadido al carrito.',
              icon: 'success',
              confirmButtonText: 'Ver el carrito',
              showCancelButton: true,
              preConfirm: () => {
                navigate('/carrito');
              }
            });
          }
        } catch (error) {
          console.error('Error completo al añadir al carrito:', error);
          Swal.fire('Error', 'Hubo un problema con la solicitud. Intenta nuevamente.', 'error');
        }
      };
    
    
    if (loading) {
        return <div>Cargando...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!producto) {
        return <div>No se encontró el producto.</div>;
    }

    return (
        <div>
            <Navbar />
            <div className="container mt-5">
                <div className="row">
                    <div className="col-md-6">
                        <img
                            src={`http://localhost/corpfresh-php/${producto.imagen_producto}`}
                            className="img-fluid w-75"
                            alt={producto.nombre_producto}
                        />
                    </div>
                    <div className="col-md-6">
                        <h2>{producto.nombre_producto}</h2>
                        <p className="h3 mb-4">${producto.precio_producto}</p>
                        <p><strong>Descripción:</strong> {producto.descripcion_producto}</p>
                        <p><strong>Color:</strong> {producto.color_producto}</p>
                        <p><strong>Marca:</strong> {producto.nombre_marca}</p>
                        <p><strong>Talla:</strong> {producto.talla}</p>

                        <form id="addToCartForm" onSubmit={handleAddToCart}>
                            <input type="hidden" name="id_producto" value={producto.id_producto} />
                            <input type="hidden" name="nombre" value={producto.nombre_producto} />
                            <input type="hidden" name="precio" value={producto.precio_producto} />
                            <input type="hidden" name="imagen" value={producto.imagen_producto} />
                            
                            <div className="mb-3">
                                <label htmlFor="quantity" className="form-label">Cantidad:</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    id="quantity"
                                    name="cantidad"
                                    value={cantidad}
                                    onChange={(e) => setCantidad(e.target.value)}
                                    min="1"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg mt-3">Añadir al carrito</button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default VisualizarProducto;
