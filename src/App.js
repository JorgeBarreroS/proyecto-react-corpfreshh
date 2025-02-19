import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './services/AuthContext'; // Ruta corregida
import { UserProvider } from './services/UserContext'; // Ruta unificada

import Home from './pages/Home';
import Productos from './pages/Productos';
import Contacto from './pages/Contacto';
import Nosotros from './pages/Nosotros';
import Buscador from './pages/Buscador';
import VisualizarProducto from './pages/VisualizarProducto';
import CartPage from './pages/CartPage';
import Register from './pages/Register';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Perfil from './pages/Perfil';
import Dashboard from './pages/Dashboard';

function App() {
    return (
        <AuthProvider> {/* Primero el proveedor de autenticación */}
            <UserProvider> {/* Luego el proveedor de usuario */}
                <Router>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/productos" element={<Productos />} />
                        <Route path="/contacto" element={<Contacto />} />
                        <Route path="/nosotros" element={<Nosotros />} />
                        <Route path="/buscador" element={<Buscador />} />
                        <Route path="/producto/:id" element={<VisualizarProducto />} />
                        <Route path="/carrito" element={<CartPage />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/perfil" element={<Perfil />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                    </Routes>
                </Router>
            </UserProvider>
        </AuthProvider>
    );
}

export default App;

