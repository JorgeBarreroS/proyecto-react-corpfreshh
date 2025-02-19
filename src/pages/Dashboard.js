import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext"; // Usar AuthContext
6
const Dashboard = () => {
  const { user, logout } = useAuth(); // Obtener el estado global de autenticación
  const navigate = useNavigate();

  // Redirigir al login si el usuario no está autenticado
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Manejo del cierre de sesión
  const handleLogout = () => {
    logout(); // Eliminar usuario del contexto y localStorage
    navigate("/login");
  };

  // Si el usuario no está autenticado, no se muestra nada
  if (!user) return null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Bienvenido al Dashboard</h1>
        <p>Hola, {user.name}</p> {/* Muestra el nombre del usuario */}
      </div>

      <div className="dashboard-content">
        <p>Este es tu panel principal. Aquí puedes ver todas las opciones disponibles.</p>

        <div className="dashboard-actions">
          <button className="btn btn-primary" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;