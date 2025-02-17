import React from 'react';
import Navbar from '../components/Navbar'; 
import Carousel from '../components/Carousel'; 
import ProductCard from '../components/ProductCard'; 
import Footer from '../components/Footer'; 

import imagen1 from "../imagenes/tenis1.jpg"; 
import imagen2 from "../imagenes/zapatosP.png"; 
import imagen3 from "../imagenes/zapatosPPP.png"; 

import Swal from 'sweetalert2'; // Importa Swal

// Función para mostrar un Dato Curioso aleatorio
const showFunFact = () => {
    const funFacts = [
        "¿Sabías que las camisetas de algodón se hicieron populares a principios del siglo XX?",
        "Los jeans originalmente fueron creados para los mineros debido a su durabilidad.",
        "El término 'polo' para camisas proviene del deporte del mismo nombre.",
        "La chaqueta de cuero fue popularizada por los pilotos de la Primera Guerra Mundial."
    ];
    Swal.fire({
        title: 'Dato Curioso',
        text: funFacts[Math.floor(Math.random() * funFacts.length)],  // Selecciona un dato aleatorio
        icon: 'info',
        confirmButtonText: '¡Genial!'
    });
};

// Función para mostrar una oferta aleatoria
const showRandomOffer = () => {
    const offers = [
        "¡50% de descuento en camisetas de algodón!",
        "Compra 2 y lleva 3 en todos nuestros jeans.",
        "¡Envío gratis en compras superiores a $50 en ropa!",
        "¡20% de descuento en tu primera compra de chaquetas!"
    ];
    Swal.fire({
        title: 'Oferta Especial',
        text: offers[Math.floor(Math.random() * offers.length)],  // Selecciona una oferta aleatoria
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
        "Los accesorios adecuados pueden transformar un look sencillo en uno elegante."
    ];
    Swal.fire({
        title: 'Tip de Estilo',
        text: "Consejo de estilo: " + tips[Math.floor(Math.random() * tips.length)],  // Selecciona un tip aleatorio
        icon: 'info',
        confirmButtonText: '¡Gracias!'
    });
};

const Home = () => (
    <div>
        <Navbar />
        <Carousel
            showFunFact={showFunFact}
            showRandomOffer={showRandomOffer}
            showRandomStyleTip={showRandomStyleTip}
        />
        <div className="container">
            <h2 className="text-center mb-4">Productos Destacados</h2>
            <div className="row">
                <ProductCard
                    imgSrc={imagen1}
                    title="Louis Vuitton Skate Black"
                    description="Están hechos con materiales exóticos."
                    price="$10.736.439"
                    link="visualizacion.html"
                />
                <ProductCard
                    imgSrc={imagen2}
                    title="Jordan 4 Retro White Thunder"
                    description="Un toque elegante y moderno."
                    price="$1.228.693"
                    link="visualizacion_productos/visualizarZ.html"
                />
                <ProductCard
                    imgSrc={imagen3}
                    title="Jordan 4 Retro Military Blue"
                    description="Combinación histórica y elegante."
                    price="$568.375"
                    link="visualizacion_productos/visualizarZZZ.html"
                />
            </div>
        </div>
        <Footer />
        
    </div>
    
);

export default Home;
