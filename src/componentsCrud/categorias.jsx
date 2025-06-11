import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState(null);
  const [editingCategoriaId, setEditingCategoriaId] = useState(null);
  const [editedCategoria, setEditedCategoria] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoria, setNewCategoria] = useState({
    nombre_categoria: ""
  });

  const fetchCategorias = () => {
    fetch("https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/xampp/bd/obtenerCategorias.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener categorías");
        }
        return response.json();
      })
      .then((data) => setCategorias(data))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleEdit = (categoria) => {
    setEditingCategoriaId(categoria.id_categoria);
    setEditedCategoria(categoria);
  };

  const handleSave = () => {
    fetch("https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/xampp/bd/actualizarCategoria.php", {
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
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Categoría actualizada correctamente",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al actualizar la categoría",
          });
        }
      });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch("https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/xampp/bd/eliminarCategoria.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id_categoria: id }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              setCategorias((prevCategorias) =>
                prevCategorias.filter((categoria) => categoria.id_categoria !== id)
              );
              Swal.fire({
                icon: "success",
                title: "Eliminada",
                text: "La categoría ha sido eliminada correctamente",
                timer: 2000,
                showConfirmButton: false,
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error al eliminar la categoría: " + (data.message || ""),
              });
            }
          })
          .catch((error) => {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Error al procesar la solicitud: " + error.message,
            });
          });
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedCategoria((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setNewCategoria((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCategoria = (e) => {
    e.preventDefault();
    
    // Validar campo requerido
    if (!newCategoria.nombre_categoria) {
      Swal.fire({
        icon: "warning",
        title: "Campo requerido",
        text: "El nombre de la categoría es obligatorio",
      });
      return;
    }

    fetch("https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/xampp/bd/agregarCategoria.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCategoria),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Agregar la nueva categoría con el ID generado
          const categoriaConId = { ...newCategoria, id_categoria: data.id_categoria };
          setCategorias((prevCategorias) => [...prevCategorias, categoriaConId]);
          
          // Resetear el formulario
          setNewCategoria({
            nombre_categoria: ""
          });
          
          // Cerrar el formulario
          setShowAddForm(false);
          
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Categoría agregada correctamente",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al agregar la categoría: " + (data.message || ""),
          });
        }
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al procesar la solicitud: " + error.message,
        });
      });
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
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-grisOscuro">Categorías</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-azulOscuroMate text-black px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <FaPlus /> {showAddForm ? "Cancelar" : "Agregar Categoría"}
        </button>
      </div>

      {/* Formulario para agregar categoría */}
      {showAddForm && (
        <div className="bg-white p-4 mb-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4 text-grisOscuro">
            Agregar Nueva Categoría
          </h3>
          <form onSubmit={handleAddCategoria} className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre_categoria"
                value={newCategoria.nombre_categoria}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="mr-2 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-azulOscuroMate text-black rounded hover:bg-blue-700"
              >
                Guardar Categoría
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar categorías..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 p-2 border border-gray-300 w-full"
      />

      {/* Tabla de categorías */}
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left bg-white">
            <thead className="bg-grisOscuro text-dark">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Nombre</th>
                <th className="py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentCategorias.length > 0 ? (
                currentCategorias.map((categoria, index) => (
                  <tr
                    key={categoria.id_categoria}
                    className={index % 2 === 0 ? "bg-grisClaro" : "bg-white"}
                  >
                    <td className="py-3 px-4">{categoria.id_categoria}</td>
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4 flex items-center space-x-2">
                      {editingCategoriaId === categoria.id_categoria ? (
                        <button
                          onClick={handleSave}
                          className="text-azulOscuroMate hover:text-blue-500"
                        >
                          Guardar
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(categoria)}
                            className="text-azulOscuroMate hover:text-blue-500"
                            title="Editar"
                          >
                            <FaEdit size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(categoria.id_categoria)}
                            className="text-red-600 hover:text-red-800"
                            title="Eliminar"
                          >
                            <FaTrashAlt size={20} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-4 px-4 text-center text-gray-500">
                    No se encontraron categorías
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {filteredCategorias.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 mx-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="flex items-center mx-2">
            Página {currentPage} de {totalPages || 1}
          </span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-4 py-2 mx-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}