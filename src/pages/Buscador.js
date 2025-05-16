import React, { useState, useEffect } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import '../styles/buscador.css';

const SearchBar = ({ searchQuery, onSearchChange, onSearchSubmit }) => (
  <div className="search-container22">
    <form onSubmit={onSearchSubmit} className="search-bar22">
      <input
        type="text"
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Buscar productos"
      />
      <button type="submit">
        <FaSearch size={20} />
      </button>
    </form>
  </div>
);

const ProductCard = ({ producto }) => {
  const precio = parseFloat(producto.precio_producto);
  
  // Función para determinar la fuente de la imagen
  const getImageSource = (imagePath) => {
    if (!imagePath) {
      return "http://localhost/corpfresh-php/imagenes/1.jpg";
    }
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    return `http://localhost/corpfresh-php/${imagePath}`;
  };
  
    const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="product-card22">
      <div className="product-image-container22">
        <img
          src={getImageSource(producto.imagen_producto)}
          alt={producto.nombre_producto}
          onError={(e) => {
            e.target.src = "http://localhost/corpfresh-php/imagenes/1.jpg";
          }}
        />
      </div>
      <h3>{producto.nombre_producto}</h3>
      <p>Precio:{formatPrice(precio)}</p>
      <button className="btn btn-dark" onClick={() => (window.location.href = `/producto/${producto.id_producto}`)}>
        Ver Producto
      </button>
    </div>
  );
};

const Buscador = () => {
  const [productos, setProductos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProductos = async (query) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost/corpfresh-php/busqueda.php?q=${query}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setProductos(data);
      } else {
        setProductos([]);
        setError('La respuesta del servidor no es válida.');
      }
    } catch (err) {
      setError('No se pudo realizar la búsqueda. Inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProductos(searchQuery);
  };

  useEffect(() => {
    fetchProductos('');
  }, []);

  return (
    <div>
      <button className="close-button22" onClick={() => (window.location.href = '/')}>
        <FaTimes size={20} />
      </button>
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
      />
      <div className="products-container22">
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {productos.length === 0 && !loading && <p>No se encontraron productos.</p>}
        {productos.length > 0 && (
          <div className="product-list22">
            {productos.map((producto) => (
              <ProductCard key={producto.id_producto} producto={producto} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Buscador;