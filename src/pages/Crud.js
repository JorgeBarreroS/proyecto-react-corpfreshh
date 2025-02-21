import React, { useState } from "react";
import "../styles/bootstrap.min.css.map";
import "../styles/sidebar.css";
import { useNavigate } from "react-router-dom";

  
export default function App() {
  const navigate = useNavigate();
  const [view, setView] = useState(null);

return (
    <div className="app-container">
    {/* Barra lateral */}
    <aside className="sidebar">
      <h1 className="sidebar-title">Panel de Gestión</h1>
      <nav>
        <ul className="sidebar-menu">
          <li className="sidebar-item">
            <button onClick={() => setView("productos")} className="sidebar-btn">
              Productos
            </button>
          </li>
          <li className="sidebar-item">
            <button onClick={() => setView("categorias")} className="sidebar-btn">
              Categorías
            </button>
          </li>
          <li className="sidebar-item">
            <button onClick={() => setView("ordenes")} className="sidebar-btn">
              Órdenes
            </button>
          </li>
          <li className="sidebar-item">
            <button onClick={() => setView("pedidos")} className="sidebar-btn">
              Pedidos
            </button>
          </li>
          <li className="sidebar-item">
            <button onClick={() => setView("usuarios")} className="sidebar-btn">
              Usuarios
            </button>
          </li>
        </ul>
      </nav>
      
   {/* Botón de salir */}
   <div className="logout-button">
      <button className="btn btn-danger w-100" onClick={() => navigate("/")}>
        Salir
      </button>
    </div>

      
    </aside>

    {/* Contenido principal */}
    <main className="main-content">
      <header className="main-header">
        <h1 className="main-title">Gestión de Recursos</h1>
      </header>
      <div className="content-wrapper">
        
      </div>
    </main>
  </div>
  );
}
