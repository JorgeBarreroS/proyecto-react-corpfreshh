import { createContext, useState, useContext } from "react";

// Crea el contexto
const AuthContext = createContext();

// El proveedor que envolverá tus componentes
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(null);

  const login = (userData) => {
    setAuthState(userData); // Establecer el estado de autenticación
  };

  const logout = () => {
    setAuthState(null); // Limpiar el estado al cerrar sesión
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// El hook que usarás en los componentes
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
