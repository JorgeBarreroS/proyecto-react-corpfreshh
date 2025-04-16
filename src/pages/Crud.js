import React, { useState, useEffect } from "react";
import "../styles/bootstrap.min.css.map";
import "../styles/sidebar.css";
import { useNavigate } from "react-router-dom";
import Productos from "../componentsCrud/productos";
import Categorias from "../componentsCrud/categorias";
import Ordenes from "../componentsCrud/ordenes";
import Pedidos from "../componentsCrud/pedidos";
import Usuarios from "../componentsCrud/usuarios";
import AdminOfertas from "../componentsCrud/AdminOfertas";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

export default function App() {
  const navigate = useNavigate();
  const [view, setView] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetch("http://localhost/CorpFreshhXAMPP/bd/getDashboardData.php")
      .then(res => res.json())
      .then(data => setDashboardData(data))
      .catch(err => console.error(err));
  }, []);

  const renderDashboard = () => {
    if (!dashboardData) return <p>Cargando datos...</p>;

    const productosData = {
      labels: dashboardData.producto.map(p => p.categoria),
      datasets: [
        {
          label: "Productos por Categoría",
          data: dashboardData.producto.map(p => p.total),
          backgroundColor: "rgba(75, 192, 192, 0.5)"
        }
      ]
    };

    const ordenesData = {
      labels: dashboardData.ordenes.map(o => o.mes),
      datasets: [
        {
          label: "Órdenes por Mes",
          data: dashboardData.ordenes.map(o => o.total),
          fill: false,
          borderColor: "rgba(153, 102, 255, 1)"
        }
      ]
    };

    return (
      <div className="dashboard">
        <h3 className="text-center my-4">
          Total de Usuarios Registrados: <strong>{dashboardData.usuario}</strong>
        </h3>

        <div className="chart-grid">
          <div className="chart-box">
            <Bar data={productosData} />
          </div>
          <div className="chart-box">
            <Line data={ordenesData} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h1 className="sidebar-title">Panel de Gestión</h1>
        <nav>
          <ul className="sidebar-menu">
            <li className="sidebar-item">
              <button onClick={() => setView(null)} className="sidebar-btn">
                Dashboard
              </button>
            </li>
            <li className="sidebar-item">
              <button onClick={() => setView("AdminOfertas")} className="sidebar-btn">
                Admin Ofertas
              </button>
            </li>
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
        <div className="logout-button">
          <button className="btn btn-danger w-100" onClick={() => navigate("/")}>
            Salir
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <h1 className="main-title">Gestión de Recursos</h1>
        </header>
        <div className="content-wrapper">
          {view === null && renderDashboard()}
          {view === "AdminOfertas" && <AdminOfertas />}
          {view === "productos" && <Productos />}
          {view === "categorias" && <Categorias />}
          {view === "ordenes" && <Ordenes />}
          {view === "pedidos" && <Pedidos />}
          {view === "usuarios" && <Usuarios />}
        </div>
      </main>
    </div>
  );
}
