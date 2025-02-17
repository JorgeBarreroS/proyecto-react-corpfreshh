import React from 'react';

const Producto = ({ imgSrc, title, price, link }) => {
  return (
    <div className="col">
      <div className="card h-90 w-100 text-center">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img
            src={imgSrc}
            className="card-img-top img-productos"
            alt={title}
            style={{
              maxWidth: "50%",
              height: "auto",
            }}
          />
        </div>
        <div className="card-body">
          <h5 className="card-title">{title}</h5>
          <p className="fw-bold">{price}</p>
          <a href={link} className="btn btn-dark" target="_blank" rel="noopener noreferrer">
            Añadir al carrito
          </a>
        </div>
      </div>
    </div>
  );
};

export default Producto;
