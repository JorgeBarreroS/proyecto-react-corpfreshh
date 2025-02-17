import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const ProductDetails = ({ match }) => {
  const [product, setProduct] = useState(null);
  const productId = match.params.id;

  useEffect(() => {
    // Obtener los detalles del producto usando fetch
    fetch(`http://localhost/corpfresh-php/productos/${productId}`)
      .then(response => response.json())
      .then(data => setProduct(data))
      .catch(error => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Producto no encontrado'
        });
      });
  }, [productId]);

  const addToCart = (e) => {
    e.preventDefault();
    // Lógica para agregar al carrito, similar al código PHP
    Swal.fire('Producto agregado al carrito!');
  };

  if (!product) return <div>Cargando...</div>;

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-6">
          <img src={product.imagen_producto} className="img-fluid w-75" alt={product.nombre_producto} />
        </div>
        <div className="col-md-6">
          <h2>{product.nombre_producto}</h2>
          <p className="h3 mb-4">${product.precio_producto}</p>
          <p><strong>Descripción:</strong> {product.descripcion_producto}</p>
          <p><strong>Color:</strong> {product.color_producto}</p>
          <p><strong>Marca:</strong> {product.nombre_marca}</p>
          <p><strong>Talla:</strong> {product.talla}</p>

          <form onSubmit={addToCart} className="needs-validation" noValidate>
            <div className="mb-3">
              <label htmlFor="quantity" className="form-label">Cantidad:</label>
              <input type="number" className="form-control" id="quantity" name="cantidad" value="1" min="1" required />
              <div className="invalid-feedback">Por favor ingrese una cantidad válida</div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg mt-3">Añadir al carrito</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
