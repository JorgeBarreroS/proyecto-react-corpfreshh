import React, { useState, useEffect } from "react";
import { useAuth } from "../services/AuthContext";
import { useNavigate } from "react-router-dom";

const Perfil = () => {
  const { authState, logout } = useAuth(); // Usamos authState en lugar de user
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificamos si existe un usuario autenticado usando authState
    console.log("Estado actual del usuario:", authState);

    // Si no hay usuario autenticado, terminar carga y no hacer la petición
    if (!authState || !authState.email) {
      console.log("No hay usuario autenticado");
      setLoading(false);
      return;
    }
    
    // Si hay usuario autenticado, podemos intentar obtener más datos
    fetch("http://localhost/corpfresh-php/getUserData.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: authState.email }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Error al obtener datos del usuario");
      }
      return response.json();
    })
    .then(data => {
      console.log("Datos obtenidos:", data);
      if (data.success) {
        setUserData(data.user);
      } else {
        throw new Error(data.message || "Error al cargar datos");
      }
    })
    .catch(err => {
      console.error("Error:", err);
      setError(err.message);
    })
    .finally(() => {
      setLoading(false);
    });
  }, [authState]); // Se ejecuta cuando cambia authState

  // Si está cargando, mostramos un spinner
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado después de cargar, mostrar mensaje y botón para ir a login
  if (!authState || !authState.email) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-warning">
          <h2>No hay usuario autenticado</h2>
          <p>Debes iniciar sesión para ver tu perfil</p>
          <button className="btn btn-primary" onClick={() => navigate("/login")}>
            Ir a Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header text-center">
              <h3>Perfil de Usuario</h3>
            </div>
            <div className="card-body text-center">
              {/* Imagen de perfil */}
              <div className="mb-4">
                {authState.avatar ? (
                  <img 
                    src={authState.avatar} 
                    alt="Perfil" 
                    className="rounded-circle img-thumbnail"
                    style={{ width: "150px", height: "150px" }}
                  />
                ) : (
                  <div 
                    className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                    style={{ 
                      width: "150px", 
                      height: "150px", 
                      backgroundColor: "#007bff", 
                      color: "white",
                      fontSize: "48px"
                    }}
                  >
                    {authState.name ? authState.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </div>
              
              {/* Datos básicos del usuario (del contexto Auth) */}
              <h4>{authState.name || "Usuario"}</h4>
              <p className="text-muted">{authState.email}</p>
              <p>Rol: {authState.rol === 1 ? "Administrador" : authState.rol === 2 ? "Cliente" : "Usuario"}</p>
              
              {/* Mostrar error si existe */}
              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}
              
              {/* Datos adicionales del usuario (de la base de datos) */}
              {userData && (
                <div className="user-details mt-4">
                  <h5>Datos Adicionales</h5>
                  <table className="table">
                    <tbody>
                      <tr>
                        <th>ID:</th>
                        <td>{userData.id}</td>
                      </tr>
                      {userData.nombre && (
                        <tr>
                          <th>Nombre:</th>
                          <td>{userData.nombre}</td>
                        </tr>
                      )}
                      {userData.apellido && (
                        <tr>
                          <th>Apellido:</th>
                          <td>{userData.apellido}</td>
                        </tr>
                      )}
                      {userData.telefono && (
                        <tr>
                          <th>Teléfono:</th>
                          <td>{userData.telefono}</td>
                        </tr>
                      )}
                      {userData.direccion && (
                        <tr>
                          <th>Dirección:</th>
                          <td>{userData.direccion}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Botones de navegación */}
              <div className="mt-4">
                <button 
                  className="btn btn-primary me-2" 
                  onClick={() => navigate("/dashboard")}
                >
                  Ir al Dashboard
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;