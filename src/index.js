import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { UserProvider } from "./services/UserContext"; // Si ya tienes UserContext
import { AuthProvider } from "./services/AuthContext"; // Asegúrate de importar AuthProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UserProvider>
      <AuthProvider>  {/* Asegúrate de envolver todo con AuthProvider */}
        <App />
      </AuthProvider>
    </UserProvider>
  </React.StrictMode>
);

// Si deseas comenzar a medir el rendimiento de tu aplicación, pasa una función
// para registrar los resultados (por ejemplo: reportWebVitals(console.log))
// o envíalos a un endpoint de análisis. Aprende más en: https://bit.ly/CRA-vitals
reportWebVitals();
