import React from "react";
import "../styles/styles.css"
import imagen1 from "../imagenes/perfil1.jfif";
import imagen2 from "../imagenes/perfil2.jfif";
import imagen3 from "../imagenes/perfil3.jfif";
import imagen4 from "../imagenes/perfil5.jfif";


const TeamSection = () => {
  const teamMembers = [
    {
      name: "Jorge B",
      role: "CEO y director creativo",
      imgSrc: imagen1,
    },
    {
      name: "Arteaga",
      role: "CEO y diseñador",
      imgSrc: imagen2,
    },
    {
      name: "Nelson Avellaneda",
      role: "CEO y diseñador",
      imgSrc: imagen3,
    },
    {
      name: "Diego Pirazan",
      role: "CEO y diseñador",
      imgSrc: imagen4,
    },
  ];

  return (
    <section className="py-5">
      <div className="container">
        <h2 className="text-center mb-5">Conoce a nuestras cofundadores</h2>
        <div className="row">
          {teamMembers.map((member, index) => (
            <div className="col-lg-3 col-md-6 mb-4" key={index}>
              <div className="card border-0 shadow">
                <img src={member.imgSrc} alt={member.name} className="card-img-top " />
                <div className="card-body text-center">
                  <h5 className="card-title">{member.name}</h5>
                  <p className="card-text">{member.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
