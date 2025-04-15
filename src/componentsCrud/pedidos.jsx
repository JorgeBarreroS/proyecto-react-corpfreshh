import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState(null);
  const [editingPedidoId, setEditingPedidoId] = useState(null);
  const [editedPedido, setEditedPedido] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPedido, setNewPedido] = useState({
    id_venta: "",
    id_usuario: "",
    fecha_pedido: "",
    estado_pedido: "",
    metodo_envio_pedido: ""
  });

  const fetchPedidos = () => {
    fetch("http://localhost/CorpFreshhXAMPP/bd/obtenerPedidos.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener pedidos");
        }
        return response.json();
      })
      .then((data) => setPedidos(data))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const handleEdit = (pedido) => {
    setEditingPedidoId(pedido.id_pedido);
    setEditedPedido(pedido);
  };

  const handleSave = () => {
    fetch("http://localhost/CorpFreshhXAMPP/bd/actualizarPedido.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedPedido),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setPedidos((prevPedidos) =>
            prevPedidos.map((pedido) =>
              pedido.id_pedido === editedPedido.id_pedido ? editedPedido : pedido
            )
          );
          setEditingPedidoId(null);
          setEditedPedido({});
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Pedido actualizado correctamente",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al actualizar el pedido",
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
        fetch("http://localhost/CorpFreshhXAMPP/bd/eliminarPedido.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id_pedido: id }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              setPedidos((prevPedidos) =>
                prevPedidos.filter((pedido) => pedido.id_pedido !== id)
              );
              Swal.fire({
                icon: "success",
                title: "Eliminado",
                text: "El pedido ha sido eliminado correctamente",
                timer: 2000,
                showConfirmButton: false,
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error al eliminar el pedido: " + (data.message || ""),
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
    setEditedPedido((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setNewPedido((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPedido = (e) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!newPedido.id_venta || !newPedido.id_usuario) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "El ID de venta y el ID de usuario son obligatorios",
      });
      return;
    }

    fetch("http://localhost/CorpFreshhXAMPP/bd/agregarPedido.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPedido),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Agregar el nuevo pedido con el ID generado
          const pedidoConId = { ...newPedido, id_pedido: data.id_pedido };
          setPedidos((prevPedidos) => [...prevPedidos, pedidoConId]);
          
          // Resetear el formulario
          setNewPedido({
            id_venta: "",
            id_usuario: "",
            fecha_pedido: "",
            estado_pedido: "",
            metodo_envio_pedido: ""
          });
          
          // Cerrar el formulario
          setShowAddForm(false);
          
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Pedido agregado correctamente",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al agregar el pedido: " + (data.message || ""),
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

  // Filtrar pedidos por búsqueda
  const filteredPedidos = pedidos.filter((pedido) =>
    Object.values(pedido).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Paginación
  const indexOfLastPedido = currentPage * itemsPerPage;
  const indexOfFirstPedido = indexOfLastPedido - itemsPerPage;
  const currentPedidos = filteredPedidos.slice(
    indexOfFirstPedido,
    indexOfLastPedido
  );

  // Cambiar página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calcular el total de páginas
  const totalPages = Math.ceil(filteredPedidos.length / itemsPerPage);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-grisOscuro">Pedidos</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-azulOscuroMate text-black px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <FaPlus /> {showAddForm ? "Cancelar" : "Agregar Pedido"}
        </button>
      </div>

      {/* Formulario para agregar pedido */}
      {showAddForm && (
        <div className="bg-white p-4 mb-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4 text-grisOscuro">
            Agregar Nuevo Pedido
          </h3>
          <form onSubmit={handleAddPedido} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Venta *
              </label>
              <input
                type="text"
                name="id_venta"
                value={newPedido.id_venta}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Usuario *
              </label>
              <input
                type="text"
                name="id_usuario"
                value={newPedido.id_usuario}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Pedido
              </label>
              <input
                type="date"
                name="fecha_pedido"
                value={newPedido.fecha_pedido}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado Pedido
              </label>
              <input
                type="text"
                name="estado_pedido"
                value={newPedido.estado_pedido}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Envío
              </label>
              <input
                type="text"
                name="metodo_envio_pedido"
                value={newPedido.metodo_envio_pedido}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
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
                Guardar Pedido
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar pedidos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 p-2 border border-gray-300 w-full"
      />

      {/* Tabla de pedidos */}
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left bg-white">
            <thead className="bg-grisOscuro text-dark">
              <tr>
                <th className="py-3 px-4">ID Pedido</th>
                <th className="py-3 px-4">ID Venta</th>
                <th className="py-3 px-4">ID Usuario</th>
                <th className="py-3 px-4">Fecha Pedido</th>
                <th className="py-3 px-4">Estado Pedido</th>
                <th className="py-3 px-4">Método Envío</th>
                <th className="py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentPedidos.length > 0 ? (
                currentPedidos.map((pedido, index) => (
                  <tr
                    key={pedido.id_pedido}
                    className={index % 2 === 0 ? "bg-grisClaro" : "bg-white"}
                  >
                    <td className="py-3 px-4">{pedido.id_pedido}</td>
                    <td className="py-3 px-4">
                      {editingPedidoId === pedido.id_pedido ? (
                        <input
                          type="text"
                          name="id_venta"
                          value={editedPedido.id_venta}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        pedido.id_venta
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingPedidoId === pedido.id_pedido ? (
                        <input
                          type="text"
                          name="id_usuario"
                          value={editedPedido.id_usuario}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        pedido.id_usuario
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingPedidoId === pedido.id_pedido ? (
                        <input
                          type="date"
                          name="fecha_pedido"
                          value={editedPedido.fecha_pedido}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        pedido.fecha_pedido
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingPedidoId === pedido.id_pedido ? (
                        <input
                          type="text"
                          name="estado_pedido"
                          value={editedPedido.estado_pedido}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        pedido.estado_pedido
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingPedidoId === pedido.id_pedido ? (
                        <input
                          type="text"
                          name="metodo_envio_pedido"
                          value={editedPedido.metodo_envio_pedido}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        pedido.metodo_envio_pedido
                      )}
                    </td>
                    <td className="py-3 px-4 flex items-center space-x-2">
                      {editingPedidoId === pedido.id_pedido ? (
                        <button
                          onClick={handleSave}
                          className="text-azulOscuroMate hover:text-blue-500"
                        >
                          Guardar
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(pedido)}
                            className="text-azulOscuroMate hover:text-blue-500"
                            title="Editar"
                          >
                            <FaEdit size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(pedido.id_pedido)}
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
                    No se encontraron pedidos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {filteredPedidos.length > 0 && (
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