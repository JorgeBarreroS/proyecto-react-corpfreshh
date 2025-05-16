import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/productsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchAllProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost/corpfresh-php/productos.php?pagina=${page}&categoria=${selectedCategory}`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Error en los datos recibidos");
      }

      setProducts(data.data.products || []);
      setTotalPages(data.data.pagination.total_pages || 1);
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost/corpfresh-php/categorias.php");
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "http://localhost/corpfresh-php/imagenes/1.jpg";
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost/corpfresh-php/${imagePath}`;
  };

  useEffect(() => {
    fetchAllProducts();
    fetchCategories();
  }, [page, selectedCategory]);

  return (
    <div className="products-page">
      <Navbar />
      
      <div className="container mt-4">
        <h1 className="text-center mb-4">Nuestros Productos</h1>

        {/* Filtro de categorías */}
        <div className="row mb-4">
          <div className="col-md-4">
            <label htmlFor="category-select" className="form-label">Filtrar por categoría:</label>
            <select
              id="category-select"
              className="form-select"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value="0">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.id_categoria} value={category.id_categoria}>
                  {category.nombre_categoria}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mensajes de error/loading */}
        {loading && (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p>Cargando productos...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            {error}
            <button 
              className="btn btn-sm btn-outline-danger ms-3"
              onClick={() => fetchAllProducts()}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Lista de productos */}
        <div className="row">
          {products.map(product => (
            <div key={product.id_producto} className="col-md-4 mb-4">
              <div className="card h-100 product-card">
                <img
                  src={getImageUrl(product.imagen_producto)}
                  className="card-img-top product-image"
                  alt={product.nombre_producto}
                  onError={(e) => {
                    e.target.src = "http://localhost/corpfresh-php/imagenes/1.jpg";
                  }}
                />
                <div className="card-body">
                  <h5 className="card-title">{product.nombre_producto}</h5>
                  
                  <div className="price-container">
                    {product.descuento ? (
                      <>
                        <span className="original-price">
                          {formatPrice(product.precio_producto)}
                        </span>
                        <br></br>
                        <span className="discounted-price">
                          {formatPrice(product.precio_con_descuento)}
                        </span>
                        <span className="discount-badge">
                          -{product.descuento}%
                        </span>
                      </>
                    ) : (
                      <span className="normal-price">
                        {formatPrice(product.precio_producto)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="card-footer bg-transparent">
                  <button
                    className="btn btn-dark w-100"
                    onClick={() => navigate(`/producto/${product.id_producto}`)}
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Paginación */}
        {products.length > 0 && (
          <div className="row mt-4">
            <div className="col-12">
              <nav aria-label="Page navigation">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                      Anterior
                    </button>
                  </li>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = page <= 3 ? i + 1 : 
                                  page >= totalPages - 2 ? totalPages - 4 + i :
                                  page - 2 + i;
                    return pageNum > 0 && pageNum <= totalPages ? (
                      <li 
                        key={pageNum} 
                        className={`page-item ${page === pageNum ? 'active' : ''}`}
                      >
                        <button 
                          className="page-link" 
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </li>
                    ) : null;
                  })}
                  
                  <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    >
                      Siguiente
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}

        {!loading && products.length === 0 && !error && (
          <div className="alert alert-info text-center">
            No se encontraron productos en esta categoría.
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductsPage;