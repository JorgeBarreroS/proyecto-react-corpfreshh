import React, { useEffect, useState } from "react";
import { useAuth } from "../services/AuthContext";
import { getUserData } from "../services/userService"; // Función para obtener los datos del usuario
import { useNavigate } from "react-router-dom";

const MiInformacion = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!authState) {
      navigate("/login");
      return;
    }
    
    // Llamar a la API o servicio para obtener la información del usuario
    const fetchData = async () => {
      try {
        const data = await getUserData(authState.userId); // Obtener datos del usuario
        setUserData(data);
      } catch (error) {
        console.error("Error obteniendo datos del usuario:", error);
      }
    };

    fetchData();
  }, [authState, navigate]);

  if (!userData) {
    return <p>Cargando información...</p>;
  }

  return (
    <div className="container mt-5">
      <h2>Mi Información</h2>
      <p><strong>Nombre:</strong> {userData.nombre}</p>
      <p><strong>Correo:</strong> {userData.email}</p>
      <p><strong>Teléfono:</strong> {userData.telefono}</p>
    </div>
  );
};

export default MiInformacion;
