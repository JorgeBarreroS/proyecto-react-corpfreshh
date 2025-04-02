import React from 'react';

const ProductCard = ({ imgSrc, title, description, price, link }) => (
    <div className="card product-card h-100">
        <img src={imgSrc} className="card-img-top w-50 mx-auto" alt={title} />
        <div className="card-body text-center">
            <h5 className="card-title">{title}</h5>
            <p className="card-text">{description}</p>
            <p className="card-text">
                <strong>{price}</strong>
            </p>
        </div>
    </div>
);

export default ProductCard;