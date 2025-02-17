import React from "react";

const MissionSection = () => {
  return (
    <section className="bg-brand py-5">
      <div className="container">
        <h2 className="text-center mb-5">Nuestra Misión</h2>
        <div className="row">
          {[
            {
              title: "Artesanía de calidad",
              text: "Estamos comprometidos a ofrecer prendas duraderas y de alta calidad que resistan el paso del tiempo.",
            },
            {
              title: "Moda Sostenible",
              text: "Nuestro objetivo es minimizar nuestro impacto ambiental mediante el uso de materiales y procesos ecológicos.",
            },
            {
              title: "Estilo empoderador",
              text: "Nuestro objetivo es inspirar confianza a través de una moda que sea a la vez moderna y expresiva individualmente.",
            },
          ].map((item, index) => (
            <div className="col-md-4 mb-4" key={index}>
              <div className="card h-100 border-0 shadow">
                <div className="card-body text-center">
                  <h3 className="h5 mb-3">{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
