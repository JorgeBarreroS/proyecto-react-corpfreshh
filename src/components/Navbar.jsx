import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext"; 
import imagen1 from "../imagenes/busqueda-de-lupa.png";
import imagen2 from "../imagenes/carrito-de-compras.png";
import imagen3 from "../imagenes/user.svg";
import "../styles/Navbar.css"; 

const Navbar = () => {
  const { authState, logout } = useAuth(); 
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); 
  const menuRef = useRef(null); 
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch del carrito solo si hay sesión
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        // Verificar si hay un usuario autenticado y obtener su email
        if (!authState || !authState.email) {
          setCartCount(0);
          return;
        }

        console.log("Fetching cart count for user:", authState.email);

        const response = await fetch(`http://localhost/corpfresh-php/carrito/carrito.php?usuario=${authState.email}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        // Verificar que la respuesta sea válida
        if (!response.ok) {
          console.error("Error en la respuesta del servidor:", response.status);
          return;
        }

        // Verificar que el content-type sea JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.error("La respuesta no es JSON, content-type:", contentType);
          const textResponse = await response.text();
          console.error("Respuesta como texto:", textResponse);
          return;
        }

        // Intentar parsear como JSON
        try {
          const data = await response.json();
          
          if (Array.isArray(data)) {
            const totalCantidad = data.reduce((acc, item) => acc + (parseInt(item.cantidad) || 0), 0);
            setCartCount(totalCantidad);
          } else {
            console.error("La respuesta no es un array:", data);
            setCartCount(0);
          }
        } catch (parseError) {
          console.error("Error al parsear JSON:", parseError);
          setCartCount(0);
        }
      } catch (error) {
        console.error("No se pudo cargar el conteo del carrito:", error);
        setCartCount(0);
      }
    };

    if (authState && authState.email) {
      fetchCartCount();
    } else {
      setCartCount(0);
    }
  }, [authState]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">CorpFreshh</Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarTogglerDemo01"
          aria-controls="navbarTogglerDemo01"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarTogglerDemo01">
          <ul className="navbar-nav mb-2 mb-lg-0 mx-auto">
            <li className="nav-item"><Link className="nav-link active" to="/">Inicio</Link></li>
            <li className="nav-item"><Link className="nav-link active" to="/productos">Productos</Link></li>
            <li className="nav-item"><Link className="nav-link active" to="/contacto">Contacto</Link></li>
            <li className="nav-item"><Link className="nav-link active" to="/nosotros">Nosotros</Link></li>
          </ul>

          <div className="d-flex align-items-center">
            <Link to="/buscador" className="ms-2">
              <img src={imagen1} alt="lupa" width="30px" />
            </Link>

            <Link to="/carrito" className="ms-2 position-relative">
              <img src={imagen2} alt="carrito" width="30px" />
              {authState && cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartCount}
                </span>
              )}
            </Link>

            {authState ? (
              <div className="position-relative ms-2" ref={menuRef}>
                <img
                  src={imagen3}
                  alt="user"
                  width="30px"
                  style={{ cursor: "pointer" }}
                  onClick={() => setMenuOpen(!menuOpen)}
                />
                <span className="active-dot"></span>

                {menuOpen && (
                  <div className="dropdown-menu show position-absolute end-0 mt-2 shadow bg-white rounded p-2" style={{ right: 0, zIndex: 10 }}>
                    <button className="dropdown-item" onClick={() => navigate("/dashboard")}>Mi Información</button>
                    <button className="dropdown-item" onClick={() => navigate("/perfil")}>Editar Información</button>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>Cerrar Sesión</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="ms-2">
                <img src={imagen3} alt="user" width="30px" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;