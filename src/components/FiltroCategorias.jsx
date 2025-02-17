import React from 'react';

const FiltroCategorias = ({ categorias, selectedCategory, onChangeCategory }) => {
  return (
    <div className="mb-4 d-flex justify-content-end">
      <label htmlFor="categoria" className="me-2">Categoría:</label>
      <select
        id="categoria"
        className="form-select w-auto"
        value={selectedCategory}
        onChange={(e) => onChangeCategory(e.target.value)}
      >
        {categorias.map((categoria) => (
          <option key={categoria.value} value={categoria.value}>
            {categoria.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FiltroCategorias;
