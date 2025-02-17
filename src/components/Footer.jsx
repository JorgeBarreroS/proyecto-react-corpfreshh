import React, { useState } from 'react';
import Swal from 'sweetalert2';

const Footer = () => {

    const [email, setEmail] = useState('');


    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };


    const handleSubscribe = () => {
        const trimmedEmail = email.trim();


        if (trimmedEmail === "") {
            Swal.fire({
                icon: 'warning',
                title: 'Campo vacío',
                text: 'Por favor, ingresa tu correo electrónico',
                confirmButtonText: 'OK'
            });
        } else {

            Swal.fire({
                icon: 'success',
                title: '¡Suscripción completada!',
                text: 'Gracias por suscribirte a nuestro boletín',
                confirmButtonText: 'OK'
            });

            setEmail('');
        }
    };

    return (
        <footer className="bg-light text-dark pt-5 pb-4">
            <div className="container text-center text-md-start">
                <div className="row text-center text-md-start">
                    {/* Enlaces útiles */}
                    <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
                        <h5 className="text-uppercase mb-4 font-weight-bold">Enlaces útiles</h5>
                        <p><a href="#" className="text-dark">Inicio</a></p>
                        <p><a href="#" className="text-dark">Acerca de nosotros</a></p>
                        <p><a href="#" className="text-dark">Contacto</a></p>
                    </div>

                    {/* Contacto */}
                    <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
                        <h5 className="text-uppercase mb-4 font-weight-bold">Contacto</h5>
                        <p><i className="fas fa-phone mr-3"></i>+57 3208706701</p>
                        <p><i className="fas fa-envelope mr-3"></i> CorpFreshh@gmail.com</p>
                        <p><i className="fas fa-map-marker-alt mr-3"></i> Calle 56, Bosa Porvenir</p>
                    </div>

                    {/* Redes sociales */}
                    <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
                        <h5 className="text-uppercase mb-4 font-weight-bold">Redes sociales</h5>
                        <p><a href="#" className="text-dark">Facebook</a></p>
                        <p><a href="#" className="text-dark">Twitter</a></p>
                        <p><a href="#" className="text-dark">Instagram</a></p>
                    </div>

                    {/* CorpFreshh */}
                    <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
                        <h5 className="text-uppercase mb-4 font-weight-bold">CorpFreshh</h5>
                        <p>Suscríbete a nuestro boletín informativo para recibir las últimas noticias y ofertas especiales.</p>
                        <div className="input-group mb-3">
                            <input 
                                type="email" 
                                className="form-control" 
                                id="email" 
                                placeholder="Tu correo electrónico"
                                value={email}
                                onChange={handleEmailChange} // Maneja el cambio en el input
                            />
                            <button 
                                className="btn btn-primary" 
                                type="button" 
                                id="subscribeBtn"
                                onClick={handleSubscribe} // Llama a la función de suscripción
                            >
                                Suscribirse
                            </button>
                        </div>
                    </div>

                </div>

                {/* Copyright */}
                <div className="row align-items-center mt-4">
                    <div className="col-md-12 text-center">
                        <p className="text-dark">&copy; 2024 CorpFreshh. Todos los derechos reservados.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
