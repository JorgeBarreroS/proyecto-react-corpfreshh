import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './services/AuthContext';
import { UserProvider } from './services/UserContext';    

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
import MiInformacion from "./pages/MiInformacion";
import Crud from "./pages/Crud";
import ProtectedRoute from "./pages/ProtectedRoute";
import PagoNequi from './pages/PagoNequi';
import PagoCasa from './pages/PagoCasa';
import Checkout from './pages/Checkout'; // Nuevo componente de checkout
import MisPedidos from './pages/MisPedidos'; // Nuevo componente para ver pedidos
import DetallePedido from './pages/DetallePedido'; // Nuevo componente para detalles de pedido

function App() {
    return (
        <UserProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/productos" element={<Productos />} />
                        <Route path="/contacto" element={<Contacto />} />
                        <Route path="/nosotros" element={<Nosotros />} />
                        <Route path="/buscador" element={<Buscador />} />
                        <Route path="/producto/:id" element={<VisualizarProducto />} />
                        <Route path="/carrito" element={<CartPage />} />
                        <Route path="/checkout" element={<Checkout />} /> {/* Nueva ruta de checkout */}
                        <Route path="/mis-pedidos" element={<MisPedidos />} /> {/* Nueva ruta para pedidos */}
                        <Route path="/mis-pedidos/:id" element={<DetallePedido />} /> {/* Ruta para detalles de pedido */}
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/perfil" element={<Perfil />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/mi-informacion" element={<MiInformacion />} />
                        <Route path="/crud" element={<ProtectedRoute><Crud /></ProtectedRoute>} />
                        <Route path="/pago-nequi" element={<PagoNequi />} />
                        <Route path="/pago-casa" element={<PagoCasa />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </UserProvider>
    );
}

export default App;