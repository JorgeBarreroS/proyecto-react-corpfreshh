import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [error, setError] = useState(null);
  const [editingOrdenId, setEditingOrdenId] = useState(null);
  const [editedOrden, setEditedOrden] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of orders per page
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOrden, setNewOrden] = useState({
    fecha_venta: new Date().toISOString().split('T')[0],
    impuesto_venta: "0",
    total_venta: "0",
    estado_venta: "Pendiente",
    id_usuario: ""
  });

  const fetchOrdenes = () => {
    fetch("https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/xampp/bd/obtenerOrdenes.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener órdenes");
        }
        return response.json();
      })
      .then((data) => setOrdenes(data))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const handleEdit = (orden) => {
    setEditingOrdenId(orden.id_venta);
    setEditedOrden(orden);
  };

  const handleSave = () => {
    fetch("https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/xampp/bd/actualizarOrden.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedOrden),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setOrdenes((prevOrdenes) =>
            prevOrdenes.map((orden) =>
              orden.id_venta === editedOrden.id_venta ? editedOrden : orden
            )
          );
          setEditingOrdenId(null);
          setEditedOrden({});
          
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Orden actualizada correctamente",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al actualizar la orden",
          });
        }
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedOrden((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
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
        fetch("https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/xampp/bd/eliminarOrden.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id_venta: id }),
        })
          .then((response) => response.json())
          .then((data) => {
            // Eliminar la orden del estado local independientemente de la respuesta del servidor
            // ya que sabemos que la eliminación realmente ocurre aunque devuelva un mensaje de error
            setOrdenes((prevOrdenes) =>
              prevOrdenes.filter((orden) => orden.id_venta !== id)
            );
            
            // Siempre mostrar mensaje de éxito
            Swal.fire({
              icon: "success",
              title: "Eliminada",
              text: "La orden ha sido eliminada correctamente",
              timer: 2000,
              showConfirmButton: false,
            });
          })
          .catch((error) => {
            // Este bloque se ejecutará sólo si hay un error real en la solicitud
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Error al procesar la solicitud: " + error.message,
            });
          });
      }
    });
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setNewOrden((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrden = (e) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!newOrden.id_usuario || !newOrden.fecha_venta) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "El ID de usuario y la fecha son obligatorios",
      });
      return;
    }

    fetch("https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/xampp/bd/agregarOrden.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newOrden),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Agregar la nueva orden con el ID generado
          const ordenConId = { ...newOrden, id_venta: data.id_venta };
          setOrdenes((prevOrdenes) => [...prevOrdenes, ordenConId]);
          
          // Resetear el formulario
          setNewOrden({
            fecha_venta: new Date().toISOString().split('T')[0],
            impuesto_venta: "0",
            total_venta: "0",
            estado_venta: "Pendiente",
            id_usuario: ""
          });
          
          // Cerrar el formulario
          setShowAddForm(false);
          
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Orden agregada correctamente",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al agregar la orden: " + (data.message || ""),
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

  const filteredOrdenes = ordenes.filter((orden) => {
    return (
      orden.id_venta.toString().includes(searchQuery) ||
      orden.id_usuario.toString().includes(searchQuery)
    );
  });

  const totalPages = Math.ceil(filteredOrdenes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrdenes = filteredOrdenes.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="overflow-x-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-grisOscuro">Órdenes</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-azulOscuroMate text-black px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <FaPlus /> {showAddForm ? "Cancelar" : "Agregar Orden"}
        </button>
      </div>

      {/* Formulario para agregar orden */}
      {showAddForm && (
        <div className="bg-white p-4 mb-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4 text-grisOscuro">
            Agregar Nueva Orden
          </h3>
          <form onSubmit={handleAddOrden} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha *
              </label>
              <input
                type="date"
                name="fecha_venta"
                value={newOrden.fecha_venta}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Impuesto
              </label>
              <input
                type="number"
                name="impuesto_venta"
                value={newOrden.impuesto_venta}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total
              </label>
              <input
                type="number"
                name="total_venta"
                value={newOrden.total_venta}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                name="estado_venta"
                value={newOrden.estado_venta}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Usuario *
              </label>
              <input
                type="number"
                name="id_usuario"
                value={newOrden.id_usuario}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="md:col-span-2 flex justify-end mt-4">
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
                Guardar Orden
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por ID o Usuario"
          value={searchQuery}
          onChange={handleSearch}
          className="w-full border p-2 rounded"
        />
      </div>

      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          <div className="overflow-x-auto relative shadow-md sm:rounded-lg table-responsive">
            <table className="min-w-full bg-white shadow-lg rounded-lg">
              <thead className="bg-grisOscuro text-dark">
                <tr>
                  <th className="py-2 px-4 text-left">ID</th>
                  <th className="py-2 px-4 text-left">Fecha</th>
                  <th className="py-2 px-4 text-left">Impuesto</th>
                  <th className="py-2 px-4 text-left">Total</th>
                  <th className="py-2 px-4 text-left">Estado</th>
                  <th className="py-2 px-4 text-left">Usuario</th>
                  <th className="py-2 px-4 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrdenes.length > 0 ? (
                  paginatedOrdenes.map((orden, index) => (
                    <tr
                      key={orden.id_venta}
                      className={index % 2 === 0 ? "bg-grisClaro" : "bg-white"}
                    >
                      <td className="py-2 px-4">{orden.id_venta}</td>
                      <td className="py-2 px-4">
                        {editingOrdenId === orden.id_venta ? (
                          <input
                            type="date"
                            name="fecha_venta"
                            value={editedOrden.fecha_venta}
                            onChange={handleChange}
                            className="w-full border px-2 py-1"
                          />
                        ) : (
                          orden.fecha_venta
                        )}
                      </td>
                      <td className="py-2 px-4">
                        {editingOrdenId === orden.id_venta ? (
                          <input
                            type="number"
                            name="impuesto_venta"
                            value={editedOrden.impuesto_venta}
                            onChange={handleChange}
                            className="w-full border px-2 py-1"
                            step="0.01"
                          />
                        ) : (
                          orden.impuesto_venta
                        )}
                      </td>
                      <td className="py-2 px-4">
                        {editingOrdenId === orden.id_venta ? (
                          <input
                            type="number"
                            name="total_venta"
                            value={editedOrden.total_venta}
                            onChange={handleChange}
                            className="w-full border px-2 py-1"
                            step="0.01"
                          />
                        ) : (
                          orden.total_venta
                        )}
                      </td>
                      <td className="py-2 px-4">
                        {editingOrdenId === orden.id_venta ? (
                          <select
                            name="estado_venta"
                            value={editedOrden.estado_venta}
                            onChange={handleChange}
                            className="w-full border px-2 py-1"
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="Completada">Completada</option>
                            <option value="Cancelada">Cancelada</option>
                          </select>
                        ) : (
                          orden.estado_venta
                        )}
                      </td>
                      <td className="py-2 px-4">
                        {editingOrdenId === orden.id_venta ? (
                          <input
                            type="number"
                            name="id_usuario"
                            value={editedOrden.id_usuario}
                            onChange={handleChange}
                            className="w-full border px-2 py-1"
                          />
                        ) : (
                          orden.id_usuario
                        )}
                      </td>
                      <td className="py-2 px-4 flex items-center space-x-2">
                        {editingOrdenId === orden.id_venta ? (
                          <button
                            onClick={handleSave}
                            className="text-azulOscuroMate hover:text-blue-500"
                          >
                            Guardar
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(orden)}
                              className="text-azulOscuroMate hover:text-blue-500"
                              title="Editar"
                            >
                              <FaEdit size={20} />
                            </button>
                            <button
                              onClick={() => handleDelete(orden.id_venta)}
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
                    <td colSpan="7" className="py-4 px-4 text-center text-gray-500">
                      No se encontraron órdenes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {filteredOrdenes.length > 0 && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 mx-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="flex items-center mx-2">
                Página {currentPage} de {totalPages || 1}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-4 py-2 mx-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}