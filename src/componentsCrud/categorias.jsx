import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState(null);
  const [editingCategoriaId, setEditingCategoriaId] = useState(null);
  const [editedCategoria, setEditedCategoria] = useState({});

  useEffect(() => {
    fetch("http://localhost/ejercicio1/src/bd/obtenerCategorias.php")
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
    fetch("http://localhost/ejercicio1/src/bd/actualizarCategoria.php", {
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

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="text-xl font-semibold text-grisOscuro mb-4">Categorías</h2>
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
            {categorias.map((categoria, index) => (
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
    </div>
  );
}
