import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../services/AuthContext"; // Importar useAuth
import imagen1 from "../imagenes/busqueda-de-lupa.png";
import imagen2 from "../imagenes/carrito-de-compras.png";
import imagen3 from "../imagenes/user.svg";
import "../styles/Navbar.css"; 

const Navbar = () => {
  const { authState, logout } = useAuth(); // Obtener estado y logout

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary" data-bs-theme="secondary">
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
            <li className="nav-item">
              <Link className="nav-link active" to="/">Inicio</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link active" to="/productos">Productos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link active" to="/contacto">Contacto</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link active" to="/nosotros">Nosotros</Link>
            </li>
          </ul>

          <div className="d-flex align-items-center">
            <Link to="/Buscador" className="ms-2">
              <img src={imagen1} className="icon-lupa" alt="lupa" width="30px" />
            </Link>
            <Link to="/carrito" className="ms-2">
              <img src={imagen2} className="icon-carrito" alt="carrito" width="30px" />
            </Link>

            {authState ? (
              <div className="position-relative ms-2">
                <img
                  src={imagen3}
                  className="icon-user"
                  alt="user"
                  width="30px"
                  onClick={logout}
                  style={{ cursor: "pointer" }}
                />
                <span className="active-dot"></span>
              </div>
            ) : (
              <Link to="/login" className="ms-2">
                <img src={imagen3} className="icon-user" alt="user" width="30px" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
