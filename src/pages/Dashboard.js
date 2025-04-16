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
        <h1>INICIO DE SESION EXITOSO</h1> 
        <div 
          className="status-indicator" 
          title="Sesión activa (haz clic para cerrar sesión)"
          onClick={handleLogout}
        ></div>
      </div>

      <div className="dashboard-content">
        <p>¡Hola!, ya iniciaste sesion exitosamente, puedes volver a la pagina principal, ¡gracias por confiar en CORPFRESH!

          
        </p>
        
        <div className="dashboard-actions">
          <button className="btn btn-success" onClick={() => navigate("/")}>Ir a inicio</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
