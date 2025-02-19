import { createContext, useState, useContext, useEffect } from "react";

// Creamos el contexto de usuario
const UserContext = createContext();

// Proveedor del contexto de usuario para envolver la aplicación
export const UserProvider = ({ children }) => {
  // Intenta recuperar el usuario del localStorage al cargar la aplicación
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Cada vez que el usuario cambie, guardamos la información en localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user"); // Eliminar usuario del almacenamiento
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personalizado para acceder al contexto del usuario
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser debe ser usado dentro de un UserProvider");
  }
  return context;
};