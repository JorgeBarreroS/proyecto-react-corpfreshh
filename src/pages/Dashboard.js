import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext"; 
import "../styles/Dashboard.css"; // Asegúrate de agregar los estilos

const Dashboard = () => {
  const { authState, logout } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    if (!authState) {
      navigate("/login", { replace: true });
    }
  }, [authState, navigate]);

  const handleLogout = async () => {
    try {
      await logout(); 
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (!authState) return null; 

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Bienvenido al Dashboard</h1>
        <p>Hola, {authState.name}</p> 
        <div 
          className="status-indicator" 
          title="Sesión activa (haz clic para cerrar sesión)"
          onClick={handleLogout}
        ></div>
      </div>

      <div className="dashboard-content">
        <p>Este es tu panel principal. Aquí puedes ver todas las opciones disponibles.</p>
      </div>
    </div>
  );
};

export default Dashboard;
