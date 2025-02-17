import React from "react";
import imagen3 from "../imagenes/corp-freshh.jfif";


const StorySection = () => {
  return (
    <section className="py-5">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <h2 className="mb-4">Nuestra historia</h2>
            <p className="lead mb-4">
              CorpFreshh surgió de una pasión compartida por la moda y la sostenibilidad. Nuestros cuatro cofundadores
              se unieron con la visión de crear una marca de ropa que no solo se vea bien sino que se sienta bien,
              tanto para quien la usa como para el planeta.
            </p>
            <p>
              En CorpFreshh creemos que el estilo y la responsabilidad pueden ir de la mano. Nuestras colecciones
              están cuidadosamente seleccionadas para ofrecerle las últimas tendencias y al mismo tiempo mantener
              nuestro compromiso con la producción ética y los materiales sostenibles.
            </p>
          </div>
          <div className="col-lg-6">
            <center>
              <img
                src= {imagen3}
                alt="CorpFreshh Store"
                className="img-fluid rounded shadow"
              />
            </center>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
