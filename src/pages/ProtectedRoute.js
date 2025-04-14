import { Navigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { authState } = useAuth();

  // Solo permitir al usuario con id 1 (cliente admin)
  if (authState && authState.rol === 1) {
    return children;
  }

  // Redirigir a inicio o login si no está autorizado
  return <Navigate to="/login" />;
};

export default ProtectedRoute;
