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
    correo_usuario: "",
    id_usuario: "",
    fecha_pedido: "",
    total: "",
    metodo_pago: "",
    direccion_entrega: "",
    telefono_contacto: "",
    costo_envio: "",
    impuestos: "",
    estado: ""
  });

  const fetchPedidos = () => {
    fetch("https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/xampp/bd/obtenerPedidos.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener pedidos");
        }
        return response.json();
      })
      .then((data) => {
        setPedidos(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setError(err.message);
        setPedidos([]);
      });
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const handleEdit = (pedido) => {
    setEditingPedidoId(pedido.id);
    setEditedPedido({...pedido});
  };

  const handleSave = () => {
    fetch("https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/xampp/bd/actualizarPedido.php", {
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
            prevPedidos.map((p) =>
              p.id === editedPedido.id ? editedPedido : p
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
        fetch("https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/xampp/bd/eliminarPedido.php", {
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
                prevPedidos.filter((p) => p.id !== id)
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
    
    if (!newPedido.correo_usuario || !newPedido.id_usuario) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "El correo y el ID de usuario son obligatorios",
      });
      return;
    }

    fetch("https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/xampp/bd/agregarPedido.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPedido),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const pedidoConId = { ...newPedido, id: data.id_pedido };
          setPedidos((prevPedidos) => [...prevPedidos, pedidoConId]);
          setNewPedido({
            correo_usuario: "",
            id_usuario: "",
            fecha_pedido: "",
            total: "",
            metodo_pago: "",
            direccion_entrega: "",
            telefono_contacto: "",
            costo_envio: "",
            impuestos: "",
            estado: ""
          });
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

  const filteredPedidos = pedidos.filter((pedido) =>
    Object.values(pedido).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const indexOfLastPedido = currentPage * itemsPerPage;
  const indexOfFirstPedido = indexOfLastPedido - itemsPerPage;
  const currentPedidos = filteredPedidos.slice(indexOfFirstPedido, indexOfLastPedido);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
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

      {showAddForm && (
        <div className="bg-white p-4 mb-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4 text-grisOscuro">
            Agregar Nuevo Pedido
          </h3>
          <form onSubmit={handleAddPedido} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Usuario *
              </label>
              <input
                type="email"
                name="correo_usuario"
                value={newPedido.correo_usuario}
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
                Total
              </label>
              <input
                type="number"
                name="total"
                value={newPedido.total}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago
              </label>
              <input
                type="text"
                name="metodo_pago"
                value={newPedido.metodo_pago}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección Entrega
              </label>
              <input
                type="text"
                name="direccion_entrega"
                value={newPedido.direccion_entrega}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono Contacto
              </label>
              <input
                type="text"
                name="telefono_contacto"
                value={newPedido.telefono_contacto}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Costo Envío
              </label>
              <input
                type="number"
                name="costo_envio"
                value={newPedido.costo_envio}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Impuestos
              </label>
              <input
                type="number"
                name="impuestos"
                value={newPedido.impuestos}
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
                name="estado"
                value={newPedido.estado}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Seleccionar estado</option>
                <option value="pendiente">Pendiente</option>
                <option value="procesando">Procesando</option>
                <option value="enviado">Enviado</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </select>
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

      <input
        type="text"
        placeholder="Buscar pedidos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 p-2 border border-gray-300 w-full"
      />

      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left bg-white">
            <thead className="bg-grisOscuro text-dark">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Correo</th>
                <th className="py-3 px-4">ID Usuario</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Método Pago</th>
                <th className="py-3 px-4">Dirección</th>
                <th className="py-3 px-4">Teléfono</th>
                <th className="py-3 px-4">Costo Envío</th>
                <th className="py-3 px-4">Impuestos</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentPedidos.length > 0 ? (
                currentPedidos.map((pedido, index) => (
                  <tr
                    key={pedido.id}
                    className={index % 2 === 0 ? "bg-grisClaro" : "bg-white"}
                  >
                    <td className="py-3 px-4">{pedido.id}</td>
                    <td className="py-3 px-4">
                      {editingPedidoId === pedido.id ? (
                        <input
                          type="email"
                          name="correo_usuario"
                          value={editedPedido.correo_usuario || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        pedido.correo_usuario
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingPedidoId === pedido.id ? (
                        <input
                          type="text"
                          name="id_usuario"
                          value={editedPedido.id_usuario || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        pedido.id_usuario
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingPedidoId === pedido.id ? (
                        <input
                          type="date"
                          name="fecha_pedido"
                          value={editedPedido.fecha_pedido || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        pedido.fecha_pedido
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingPedidoId === pedido.id ? (
                        <input
                          type="number"
                          name="total"
                          value={editedPedido.total || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                          step="0.01"
                        />
                      ) : (
                        pedido.total
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingPedidoId === pedido.id ? (
                        <input
                          type="text"
                          name="metodo_pago"
                          value={editedPedido.metodo_pago || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        pedido.metodo_pago
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingPedidoId === pedido.id ? (
                        <input
                          type="text"
                          name="direccion_entrega"
                          value={editedPedido.direccion_entrega || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        pedido.direccion_entrega
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingPedidoId === pedido.id ? (
                        <input
                          type="text"
                          name="telefono_contacto"
                          value={editedPedido.telefono_contacto || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        pedido.telefono_contacto
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingPedidoId === pedido.id ? (
                        <input
                          type="number"
                          name="costo_envio"
                          value={editedPedido.costo_envio || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                          step="0.01"
                        />
                      ) : (
                        pedido.costo_envio
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingPedidoId === pedido.id ? (
                        <input
                          type="number"
                          name="impuestos"
                          value={editedPedido.impuestos || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                          step="0.01"
                        />
                      ) : (
                        pedido.impuestos
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingPedidoId === pedido.id ? (
                        <select
                          name="estado"
                          value={editedPedido.estado || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="procesando">Procesando</option>
                          <option value="enviado">Enviado</option>
                          <option value="completado">Completado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      ) : (
                        pedido.estado
                      )}
                    </td>
                    <td className="py-3 px-4 flex items-center space-x-2">
                      {editingPedidoId === pedido.id ? (
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
                            onClick={() => handleDelete(pedido.id)}
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
                  <td colSpan="12" className="py-4 px-4 text-center text-gray-500">
                    No se encontraron pedidos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

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