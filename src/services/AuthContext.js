import { createContext, useState, useContext, useEffect } from "react";

// Crear el contexto de autenticación
const AuthContext = createContext();

// Proveedor de autenticación
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    try {
      const storedUser = localStorage.getItem("authUser");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error al cargar usuario de localStorage:", error);
      return null;
    }
  });

  useEffect(() => {
    if (authState) {
      localStorage.setItem("authUser", JSON.stringify(authState));
    } else {
      localStorage.removeItem("authUser");
    }
  }, [authState]);

  const login = (userData) => {
    setAuthState(userData);
  };

  const logout = () => {
    setAuthState(null);
    localStorage.removeItem("authUser");
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para acceder al contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};