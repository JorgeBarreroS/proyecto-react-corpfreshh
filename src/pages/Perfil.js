import React from "react";
import { useUser } from "../components/UserContext";
import { useNavigate } from "react-router-dom";

const Perfil = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div>
        <h2>No hay usuario autenticado</h2>
        <button onClick={() => navigate("/login")}>Ir a Login</button>
      </div>
    );
  }

  return (
    <div className="profile">
      <img src={user.imageUrl} alt="Perfil" />
      <h3>{user.name}</h3>
      <button onClick={() => navigate("/")}>Ir a Inicio</button>
      <button onClick={() => {
        logout();
        navigate("/");
      }}>Cerrar sesión</button>
    </div>
  );
};

export default Perfil;
