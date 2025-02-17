import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import { UserProvider } from "./components/UserContext";
import Home from './pages/Home';  
import Productos from './pages/Productos'; 
import Contacto from './pages/Contacto'; 
import Nosotros from './pages/Nosotros'; 
import Buscador from './pages/Buscador';
import VisualizarProducto from './pages/VisualizarProducto';
import CartPage from './pages/CartPage';
import Register from "./pages/Register";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Perfil from "./pages/Perfil";

function App() {
    return (
        <UserProvider>
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
                </Routes>
            
            </Router>
        </UserProvider>
    );
}

export default App;
