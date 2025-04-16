import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Navbar from '../components/Navbar'; 
import Carousel from '../components/Carousel'; 
import ProductCard from '../components/ProductCard'; 
import Footer from '../components/Footer'; 

import imagen1 from "../imagenes/tenis1.jpg"; 
import imagen2 from "../imagenes/zapatosP.png"; 
import imagen3 from "../imagenes/zapatosPPP.png"; 

import Swal from 'sweetalert2';

// Función para mostrar un Dato Curioso aleatorio
const showFunFact = () => {
    const funFacts = [
        "¿Sabías que las camisetas de algodón se hicieron populares a principios del siglo XX?",
        "Los jeans originalmente fueron creados para los mineros debido a su durabilidad.",
        "El término 'polo' para camisas proviene del deporte del mismo nombre.",
        "La chaqueta de cuero fue popularizada por los pilotos de la Primera Guerra Mundial.",
        "El 'little black dress' fue introducido por Coco Chanel en los años 20.",
        "El color púrpura era tan caro de producir que solo la realeza podía permitirse vestirlo.",
        "Las zapatillas deportivas modernas comenzaron como simples zapatos de lona en el siglo XIX.",
        "La primera tienda de zapatillas exclusivas se abrió en Nueva York en 1986."
    ];
    Swal.fire({
        title: 'Dato Curioso',
        text: funFacts[Math.floor(Math.random() * funFacts.length)],
        icon: 'info',
        confirmButtonText: '¡Genial!'
    });
};

// Función para mostrar una oferta aleatoria
const showRandomOffer = () => {
    const offers = [
        "¡50% de descuento en camisetas de algodón premium!",
        "Compra 2 y lleva 3 en todos nuestros jeans de diseñador.",
        "¡Envío gratis en compras superiores a $50 en ropa de temporada!",
        "¡20% de descuento en tu primera compra de chaquetas exclusivas!",
        "¡Oferta flash! 30% de descuento en toda la colección de verano durante las próximas 24 horas.",
        "¡Exclusivo online! 40% en calzado premium hasta agotar existencias.",
        "Colección limitada: Compra hoy y recibe un accesorio de regalo."
    ];
    Swal.fire({
        title: 'Oferta Especial',
        text: offers[Math.floor(Math.random() * offers.length)],
        icon: 'success',
        confirmButtonText: '¡Aprovechar ahora!'
    });
};

// Función para mostrar un tip de estilo aleatorio
const showRandomStyleTip = () => {
    const tips = [
        "Combina tus jeans con una camisa blanca para un look casual clásico.",
        "Usa capas para añadir profundidad y estilo a tu atuendo en climas más fríos.",
        "Los colores neutros son fáciles de combinar con cualquier prenda.",
        "Los accesorios adecuados pueden transformar un look sencillo en uno elegante.",
        "El contraste entre texturas crea outfits más interesantes visualmente.",
        "Un par de zapatillas premium puede elevar cualquier conjunto casual.",
        "Invierte en piezas atemporales para construir un armario duradero.",
        "Las zapatillas blancas combinan con prácticamente todo tu guardarropa."
    ];
    Swal.fire({
        title: 'Tip de Estilo',
        text: "Consejo de estilo: " + tips[Math.floor(Math.random() * tips.length)],
        icon: 'info',
        confirmButtonText: '¡Gracias!'
    });
};

const Home = () => {
    const navigate = useNavigate(); // Movido aquí dentro del componente
    const [ofertaActiva, setOfertaActiva] = useState(null);
    const [countdown, setCountdown] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [loading, setLoading] = useState(true);

    // Obtener la oferta activa desde la API
    useEffect(() => {
        const fetchOfertaActiva = async () => {
            try {
                const response = await fetch("http://localhost/CorpFreshhXAMPP/bd/Ofertas/obtenerOfertaActiva.php");
                const data = await response.json();
                
                if (data.success && data.data) {
                    setOfertaActiva(data.data);
                    
                    // Calcular la diferencia de tiempo para la cuenta regresiva
                    const fechaFin = new Date(data.data.fecha_fin);
                    const ahora = new Date();
                    const diferencia = fechaFin - ahora;
                    
                    if (diferencia > 0) {
                        const days = Math.floor(diferencia / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const minutes = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
                        const seconds = Math.floor((diferencia % (1000 * 60)) / 1000);
                        
                        setCountdown({ days, hours, minutes, seconds });
                    }
                }
            } catch (error) {
                console.error("Error al obtener oferta activa:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchOfertaActiva();
    }, []);

    // Efecto para la cuenta regresiva
    useEffect(() => {
        if (!ofertaActiva) return;
        
        const timer = setInterval(() => {
            setCountdown(prev => {
                // Si todos los valores están en 0, detener el contador
                if (prev.days === 0 && prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
                    clearInterval(timer);
                    return prev;
                }
                
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                } else if (prev.days > 0) {
                    return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
                }
                return prev;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [ofertaActiva]);

    return (
        <div className="main-container">
            <Navbar />
            <Carousel
                showFunFact={showFunFact}
                showRandomOffer={showRandomOffer}
                showRandomStyleTip={showRandomStyleTip}
            />
            
            {/* Banner promocional con animación */}
            <div className="bg-black text-white py-3 text-center">
                <div className="container mx-auto d-flex justify-content-center flex-wrap">
                    <span className="mx-4 my-1 d-inline-flex align-items-center"><i className="fas fa-truck mr-2"></i> Envío gratuito en pedidos +$100</span>
                    <span className="mx-4 my-1 d-inline-flex align-items-center"><i className="fas fa-redo mr-2"></i> Devoluciones gratuitas</span>
                    <span className="mx-4 my-1 d-inline-flex align-items-center"><i className="fas fa-lock mr-2"></i> Pagos 100% seguros</span>
                    <span className="mx-4 my-1 d-inline-flex align-items-center"><i className="fas fa-headset mr-2"></i> Soporte 24/7</span>
                </div>
            </div>
            
            {/* Productos Destacados */}
            <div className="container py-5">
                <h2 className="text-center fw-bold mb-2">Productos Destacados</h2>
                <p className="text-center text-muted mb-5">Descubre nuestra selección premium de calzado exclusivo</p>
                
                <div className="row g-4">
                    <div className="col-md-4 mb-4">
                        <ProductCard
                            imgSrc={imagen1}
                            title="Louis Vuitton Skate Black"
                            description="Están hechos con materiales exóticos y exclusivos para el máximo confort."
                            price="$10.736.439"
                        />
                    </div>
                    <div className="col-md-4 mb-4">
                        <ProductCard
                            imgSrc={imagen2}
                            title="Jordan 4 Retro White Thunder"
                            description="Un toque elegante y moderno para tu colección premium."
                            price="$1.228.693"
                        />
                    </div>
                    <div className="col-md-4 mb-4">
                        <ProductCard
                            imgSrc={imagen3}
                            title="Jordan 4 Retro Military Blue"
                            description="Combinación histórica y elegante para un estilo inconfundible."
                            price="$568.375"
                        />
                    </div>
                </div>
            </div>
            
            {/* Banner de oferta especial dinámica */}
            {loading ? (
                <div className="bg-dark text-white py-5 my-5 text-center">
                    <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-3">Cargando ofertas especiales...</p>
                </div>
            ) : ofertaActiva ? (
                <div className="bg-dark text-white py-5 my-5">
                    <div className="container">
                        <div className="text-center">
                            <h3 className="mb-3 fw-bold">{ofertaActiva.titulo}</h3>
                            <p className="mb-4">{ofertaActiva.descripcion || "Oferta exclusiva por tiempo limitado"}</p>
                            
                            <div className="d-flex justify-content-center flex-wrap mb-4">
                                <div className="bg-secondary bg-opacity-25 rounded p-3 mx-2 mb-2" style={{width: "80px", color: "white"}}>
                                    <div className="fs-3 fw-bold">{countdown.days}</div>
                                    <div className="small text-uppercase">Días</div>
                                </div>
                                <div className="bg-secondary bg-opacity-25 rounded p-3 mx-2 mb-2" style={{width: "80px", color: "white"}}>
                                    <div className="fs-3 fw-bold">{countdown.hours}</div>
                                    <div className="small text-uppercase">Horas</div>
                                </div>
                                <div className="bg-secondary bg-opacity-25 rounded p-3 mx-2 mb-2" style={{width: "105px", color: "white"}}>
                                    <div className="fs-3 fw-bold">{countdown.minutes}</div>
                                    <div className="small text-uppercase">Minutos</div>
                                </div>
                                <div className="bg-secondary bg-opacity-25 rounded p-3 mx-2 mb-2" style={{width: "105px", color: "white"}}>
                                    <div className="fs-3 fw-bold">{countdown.seconds}</div>
                                    <div className="small text-uppercase">Segundos</div>
                                </div>
                            </div>
                            
                            <button 
                                className="btn btn-danger btn-lg mb-2"
                                onClick={() => navigate("/productos")}
                                >
                                -{ofertaActiva.porcentaje_descuento}% DESCUENTO – {ofertaActiva.texto_boton || "Comprar Ahora"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-dark text-white py-5 my-5">
                    <div className="container">
                        <div className="text-center">
                            <h3 className="mb-3 fw-bold">Sin ofertas activas actualmente</h3>
                            <p className="mb-4">¡No te pierdas nuestras próximas promociones!</p>
                            <button
                                className="btn btn-light btn-lg mb-2"
                                onClick={() => navigate("/productos")}
                                >
                                Ver Productos
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Categorías */}
            <div className="container py-5">
                <h2 className="text-center mb-5">Nuestras Categorías</h2>
                <div className="row">
                    <div className="col-md-4 mb-4">
                        <div className="card shadow-sm h-100">
                            <div className="card-body text-center">
                                <img src={imagen1} alt="Sneakers Exclusivos" className="img-fluid mb-3" style={{maxHeight: "150px", objectFit: "contain"}} />
                                <h4>Sneakers Exclusivos</h4>
                                <p className="text-muted">42 productos</p>
                                <button className="btn btn-outline-dark mt-2">Ver Colección</button>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 mb-4">
                        <div className="card shadow-sm h-100">
                            <div className="card-body text-center">
                                <img src={imagen2} alt="Colección Urbana" className="img-fluid mb-3" style={{maxHeight: "150px", objectFit: "contain"}} />
                                <h4>Colección Urbana</h4>
                                <p className="text-muted">38 productos</p>
                                <button className="btn btn-outline-dark mt-2">Ver Colección</button>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 mb-4">
                        <div className="card shadow-sm h-100">
                            <div className="card-body text-center">
                                <img src={imagen3} alt="Edición Limitada" className="img-fluid mb-3" style={{maxHeight: "150px", objectFit: "contain"}} />
                                <h4>Edición Limitada</h4>
                                <p className="text-muted">15 productos</p>
                                <button className="btn btn-outline-dark mt-2">Ver Colección</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Banner promocional */}
            <div className="bg-light py-5 my-5">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-6 mb-4 mb-md-0">
                            <h3 className="mb-3">Colección Premium 2025</h3>
                            <p className="mb-4">Descubre nuestras exclusivas piezas de diseñador con los materiales más innovadores y descuentos especiales por tiempo limitado.</p>
                            {ofertaActiva ? (
                                <>
                                    <button className="btn btn-danger me-2">-{ofertaActiva.porcentaje_descuento}% DESCUENTO</button>
                                    <button className="btn btn-dark">{ofertaActiva.texto_boton || "Comprar Ahora"}</button>
                                </>
                            ) : (
                                <>
                                    <button className="btn btn-danger me-2">-30% DESCUENTO</button>
                                    <button className="btn btn-dark">Comprar Ahora</button>
                                </>
                            )}
                        </div>
                        <div className="col-md-6">
                            <div className="card shadow">
                                <div className="card-body">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="rounded-circle bg-danger me-2" style={{width: "10px", height: "10px"}}></div>
                                        <small className="text-muted">Edición Limitada</small>
                                    </div>
                                    <h4 className="card-title">Colección Exclusiva</h4>
                                    <p className="card-text">Cada par de nuestra colección premium está numerado y certificado. Sólo producimos 500 unidades de cada modelo para garantizar exclusividad.</p>
                                    <a href="#" className="text-dark fw-bold text-decoration-none">
                                        Descubrir más <i className="fas fa-long-arrow-alt-right ms-1"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Testimonios */}
            <div className="container py-5">
                <h2 className="text-center mb-5">Lo que dicen nuestros clientes</h2>
                <div className="row">
                    <div className="col-md-4 mb-4">
                        <div className="card h-100 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="bg-secondary rounded-circle me-3" style={{width: "50px", height: "50px"}}></div>
                                    <div>
                                        <h5 className="mb-0">Carlos Rodríguez</h5>
                                        <div className="text-warning">
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                        </div>
                                    </div>
                                </div>
                                <p className="card-text">"Las zapatillas que compré superaron mis expectativas. Comodidad y estilo en un solo producto."</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 mb-4">
                        <div className="card h-100 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="bg-secondary rounded-circle me-3" style={{width: "50px", height: "50px"}}></div>
                                    <div>
                                        <h5 className="mb-0">María González</h5>
                                        <div className="text-warning">
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                            <i className="far fa-star"></i>
                                        </div>
                                    </div>
                                </div>
                                <p className="card-text">"El servicio al cliente es excelente y los productos son de primera calidad."</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 mb-4">
                        <div className="card h-100 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="bg-secondary rounded-circle me-3" style={{width: "50px", height: "50px"}}></div>
                                    <div>
                                        <h5 className="mb-0">Juan Pérez</h5>
                                        <div className="text-warning">
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                        </div>
                                    </div>
                                </div>
                                <p className="card-text">"Mi colección de sneakers ha crecido gracias a los excelentes precios y la calidad de esta tienda."</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default Home;