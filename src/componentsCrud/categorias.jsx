import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState(null);
  const [editingCategoriaId, setEditingCategoriaId] = useState(null);
  const [editedCategoria, setEditedCategoria] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [itemsPerPage, setItemsPerPage] = useState(5); // Elementos por página

  useEffect(() => {
    fetch("http://localhost/CorpFreshhXAMPP/bd/obtenerCategorias.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener categorías");
        }
        return response.json();
      })
      .then((data) => setCategorias(data))
      .catch((err) => setError(err.message));
  }, []);

  const handleEdit = (categoria) => {
    setEditingCategoriaId(categoria.id_categoria);
    setEditedCategoria(categoria);
  };

  const handleSave = () => {
    fetch("http://localhost/CorpFreshhXAMPP/bd/actualizarCategoria.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedCategoria),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setCategorias((prevCategorias) =>
            prevCategorias.map((categoria) =>
              categoria.id_categoria === editedCategoria.id_categoria
                ? editedCategoria
                : categoria
            )
          );
          setEditingCategoriaId(null);
          setEditedCategoria({});
        } else {
          alert("Error al actualizar la categoría");
        }
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedCategoria((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtrar categorías por búsqueda
  const filteredCategorias = categorias.filter((categoria) =>
    categoria.nombre_categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const indexOfLastCategoria = currentPage * itemsPerPage;
  const indexOfFirstCategoria = indexOfLastCategoria - itemsPerPage;
  const currentCategorias = filteredCategorias.slice(
    indexOfFirstCategoria,
    indexOfLastCategoria
  );

  // Cambiar página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calcular el total de páginas
  const totalPages = Math.ceil(filteredCategorias.length / itemsPerPage);

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="text-xl font-semibold text-grisOscuro mb-4">Categorías</h2>
      <input
        type="text"
        placeholder="Buscar categorías..."
        value={searchTerm}
        onChange={handleSearch}
        className="mb-4 p-2 border border-gray-300"
      />
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <table className="min-w-full bg-white shadow-lg rounded-lg">
          <thead className="bg-grisOscuro text-dark">
            <tr>
              <th className="py-2 px-4 text-left">ID</th>
              <th className="py-2 px-4 text-left">Nombre</th>
              <th className="py-2 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentCategorias.map((categoria, index) => (
              <tr
                key={categoria.id_categoria}
                className={index % 2 === 0 ? "bg-grisClaro" : "bg-white"}
              >
                <td className="py-2 px-4">{categoria.id_categoria}</td>
                <td className="py-2 px-4">
                  {editingCategoriaId === categoria.id_categoria ? (
                    <input
                      type="text"
                      name="nombre_categoria"
                      value={editedCategoria.nombre_categoria}
                      onChange={handleChange}
                      className="w-full border px-2 py-1"
                    />
                  ) : (
                    categoria.nombre_categoria
                  )}
                </td>
                <td className="py-2 px-4 text-center">
                  {editingCategoriaId === categoria.id_categoria ? (
                    <button
                      onClick={handleSave}
                      className="text-azulOscuroMate hover:text-blue-500"
                    >
                      Guardar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEdit(categoria)}
                      className="text-azulOscuroMate hover:text-blue-500"
                    >
                      <FaEdit size={20} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Paginación */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 mx-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400"
        >
          Anterior
        </button>
        <span className="flex items-center mx-2">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 mx-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
