import React, { useEffect, useState } from "react";
import { fetchCategories } from "../services/productService";
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

  const fetchAllProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost/corpfresh-php/productos.php?pagina=${page}&categoria=${selectedCategory}`
      );
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Error al cargar los productos:", err);
      setError("No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCategories = async () => {
    try {
      const response = await fetch("http://localhost/corpfresh-php/categorias.php");
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("Error al cargar las categorías:", err);
      setError("No se pudieron cargar las categorías.");
    }
  };

  useEffect(() => {
    fetchAllProducts();
    fetchAllCategories();
  }, [page, selectedCategory]);

  return (
    <div>
      <Navbar />
      <div className="products-container">
        <h1>Lista de Productos</h1>

        {/* Filtro de categoría */}
        <div className="category-filter">
          <label htmlFor="category">Categoría: </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(Number(e.target.value))}
          >
            <option value="0">Todas</option>
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <option key={category.id_categoria} value={category.id_categoria}>
                  {category.nombre_categoria}
                </option>
              ))
            ) : (
              <option value="0">No hay categorías disponibles</option>
            )}
          </select>
        </div>

        {/* Lista de productos */}
        <ul className="product-list">
          {products.length > 0 ? (
            products.map((product) => (
              <li key={product.id_producto} className="product-item">
                <img
                  src={product.imagen_producto 
                    ? `http://localhost/corpfresh-php/${product.imagen_producto}`
                    : "http://localhost/corpfresh-php/imagenes/1.jpg"}
                  alt={product.nombre_producto}
                />
                <h3>{product.nombre_producto}</h3>
                <p>${product.precio_producto}</p>
                <a href={`/producto/${product.id_producto}`} className="btn btn-dark w-100">Ver Producto</a>
              </li>
            ))
          ) : (
            !loading && <p>No hay productos disponibles.</p>
          )}
        </ul>

        {/* Paginación */}
        <div className="pagination-buttons">
          <button
            disabled={page === 1}
            onClick={() => setPage((prevPage) => prevPage - 1)}
          >
            Anterior
          </button>
          <span style={{ margin: "0 10px" }}>Página {page}</span>
          <button onClick={() => setPage((prevPage) => prevPage + 1)}>
            Siguiente
          </button>
        </div>

        {/* Mensaje de carga */}
        {loading && <p className="loading-message">Cargando productos...</p>}

        {/* Manejo de errores */}
        {error && <p className="error-message">{error}</p>}
      </div>
      <Footer />
    </div>
  );
};

export default ProductsPage;
