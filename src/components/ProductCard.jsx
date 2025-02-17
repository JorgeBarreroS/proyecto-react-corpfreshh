import React from 'react';

const ProductCard = ({ imgSrc, title, description, price, link }) => (
    <div className="col-md-4 mb-4">
        <div className="card product-card">
            <img src={imgSrc} className="card-img-top w-50 mx-auto" alt={title} />
            <div className="card-body text-center">
                <h5 className="card-title">{title}</h5>
                <p className="card-text">{description}</p>
                <p className="card-text">
                    <strong>{price}</strong>
                </p>
            </div>
        </div>
    </div>
);

export default ProductCard;
