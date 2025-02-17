import React from 'react';
import "../styles/style.css"
import "../styles/styles.css"
import "../styles/styless.css"
import imagen1 from "../imagenes/f2.png"
import imagen2 from "../imagenes/camiseta1.jpg"
import imagen3 from "../imagenes/f3.png"


const Carousel = ({ showFunFact, showRandomOffer, showRandomStyleTip }) => (
    <div id="carouselExample" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-inner">
            <div className="carousel-item active">
                <img src={imagen1} className="d-block w-50 mx-auto" alt="Frescura Divertida" />
                <div className="carousel-caption">
                    <h3 className="caption-title">¡Bienvenido a CorpFreshh!</h3>
                    <p className="caption-text">Descubre nuestra selección de productos frescos y divertidos.</p>
                    <button className="btn-fun" onClick={showFunFact}>¡Dato Curioso!</button>
                </div>
            </div>
            <div className="carousel-item">
                <img src={imagen2} className="d-block w-50 mx-auto" alt="Ofertas Especiales" />
                <div className="carousel-caption">
                    <h3 className="caption-title">Ofertas Especiales</h3>
                    <p className="caption-text">No te pierdas nuestras increíbles promociones.</p>
                    <button className="btn-fun" onClick={showRandomOffer}>Ver Oferta Aleatoria</button>
                </div>
            </div>
            <div className="carousel-item">
                <img src={imagen3} className="d-block w-50 mx-auto" alt="Tips de ropa" />
                <div className="carousel-caption">
                    <h3 className="caption-title">Tips de ropa</h3>
                    <p className="caption-text">Inspírate con nuestras combinaciones.</p>
                    <button className="btn-fun" onClick={showRandomStyleTip}>Tips del Día</button>
                </div>
            </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
        </button>
    </div>
);

export default Carousel;
