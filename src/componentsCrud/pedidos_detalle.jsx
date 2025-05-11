import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";

export default function PedidosDetalle() {
  const [detalles, setDetalles] = useState([]);
  const [error, setError] = useState(null);
  const [editingDetalleId, setEditingDetalleId] = useState(null);
  const [editedDetalle, setEditedDetalle] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDetalle, setNewDetalle] = useState({
    pedido_id: "",
    producto_id: "",
    nombre_producto: "",
    precio_unitario: "",
    cantidad: "",
    subtotal: "",
    color: "",
    talla: ""
  });

  const fetchDetalles = () => {
    fetch("http://localhost/CorpFreshhXAMPP/bd/obtenerPedidosDetalle.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener detalles de pedidos");
        }
        return response.json();
      })
      .then((data) => {
        setDetalles(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setError(err.message);
        setDetalles([]);
      });
  };

  useEffect(() => {
    fetchDetalles();
  }, []);

  const handleEdit = (detalle) => {
    setEditingDetalleId(detalle.id);
    setEditedDetalle({...detalle});
  };

  const handleSave = () => {
    // Calcular el subtotal basado en precio y cantidad
    const subtotal = parseFloat(editedDetalle.precio_unitario) * parseInt(editedDetalle.cantidad);
    const detalleToSave = {
      ...editedDetalle,
      subtotal: subtotal.toFixed(2)
    };

    fetch("http://localhost/CorpFreshhXAMPP/bd/actualizarPedidoDetalle.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(detalleToSave),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setDetalles((prevDetalles) =>
            prevDetalles.map((d) =>
              d.id === detalleToSave.id ? detalleToSave : d
            )
          );
          setEditingDetalleId(null);
          setEditedDetalle({});
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Detalle de pedido actualizado correctamente",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al actualizar el detalle de pedido: " + (data.message || ""),
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
        fetch("http://localhost/CorpFreshhXAMPP/bd/eliminarPedidoDetalle.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id_detalle: id }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              setDetalles((prevDetalles) =>
                prevDetalles.filter((d) => d.id !== id)
              );
              Swal.fire({
                icon: "success",
                title: "Eliminado",
                text: "El detalle del pedido ha sido eliminado correctamente",
                timer: 2000,
                showConfirmButton: false,
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error al eliminar el detalle del pedido: " + (data.message || ""),
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
    setEditedDetalle((prev) => {
      const updatedDetalle = { ...prev, [name]: value };
      
      // Actualizar el subtotal automáticamente cuando cambie precio o cantidad
      if (name === "precio_unitario" || name === "cantidad") {
        const precio = name === "precio_unitario" ? value : updatedDetalle.precio_unitario;
        const cantidad = name === "cantidad" ? value : updatedDetalle.cantidad;
        
        if (precio && cantidad) {
          const subtotal = parseFloat(precio) * parseInt(cantidad);
          updatedDetalle.subtotal = subtotal.toFixed(2);
        }
      }
      
      return updatedDetalle;
    });
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setNewDetalle((prev) => {
      const updatedDetalle = { ...prev, [name]: value };
      
      // Actualizar el subtotal automáticamente cuando cambie precio o cantidad
      if (name === "precio_unitario" || name === "cantidad") {
        const precio = name === "precio_unitario" ? value : updatedDetalle.precio_unitario;
        const cantidad = name === "cantidad" ? value : updatedDetalle.cantidad;
        
        if (precio && cantidad) {
          const subtotal = parseFloat(precio) * parseInt(cantidad);
          updatedDetalle.subtotal = subtotal.toFixed(2);
        }
      }
      
      return updatedDetalle;
    });
  };

  const handleAddDetalle = (e) => {
    e.preventDefault();
    
    if (!newDetalle.pedido_id || !newDetalle.producto_id) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "El ID de pedido y el ID de producto son obligatorios",
      });
      return;
    }

    // Calcular subtotal si no se ha hecho ya
    if (!newDetalle.subtotal && newDetalle.precio_unitario && newDetalle.cantidad) {
      newDetalle.subtotal = (parseFloat(newDetalle.precio_unitario) * parseInt(newDetalle.cantidad)).toFixed(2);
    }

    fetch("http://localhost/CorpFreshhXAMPP/bd/agregarPedidoDetalle.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newDetalle),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const detalleConId = { ...newDetalle, id: data.id_detalle };
          setDetalles((prevDetalles) => [...prevDetalles, detalleConId]);
          setNewDetalle({
            pedido_id: "",
            producto_id: "",
            nombre_producto: "",
            precio_unitario: "",
            cantidad: "",
            subtotal: "",
            color: "",
            talla: ""
          });
          setShowAddForm(false);
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Detalle de pedido agregado correctamente",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al agregar el detalle de pedido: " + (data.message || ""),
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

  const filteredDetalles = detalles.filter((detalle) =>
    Object.values(detalle).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const indexOfLastDetalle = currentPage * itemsPerPage;
  const indexOfFirstDetalle = indexOfLastDetalle - itemsPerPage;
  const currentDetalles = filteredDetalles.slice(indexOfFirstDetalle, indexOfLastDetalle);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(filteredDetalles.length / itemsPerPage);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-grisOscuro">Detalles de Pedidos</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-azulOscuroMate text-black px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <FaPlus /> {showAddForm ? "Cancelar" : "Agregar Detalle"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-4 mb-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4 text-grisOscuro">
            Agregar Nuevo Detalle de Pedido
          </h3>
          <form onSubmit={handleAddDetalle} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Pedido *
              </label>
              <input
                type="text"
                name="pedido_id"
                value={newDetalle.pedido_id}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Producto *
              </label>
              <input
                type="text"
                name="producto_id"
                value={newDetalle.producto_id}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Producto
              </label>
              <input
                type="text"
                name="nombre_producto"
                value={newDetalle.nombre_producto}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Unitario
              </label>
              <input
                type="number"
                name="precio_unitario"
                value={newDetalle.precio_unitario}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad
              </label>
              <input
                type="number"
                name="cantidad"
                value={newDetalle.cantidad}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtotal
              </label>
              <input
                type="number"
                name="subtotal"
                value={newDetalle.subtotal}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                step="0.01"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="text"
                name="color"
                value={newDetalle.color}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Talla
              </label>
              <input
                type="text"
                name="talla"
                value={newDetalle.talla}
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
                Guardar Detalle
              </button>
            </div>
          </form>
        </div>
      )}

      <input
        type="text"
        placeholder="Buscar detalles de pedidos..."
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
                <th className="py-3 px-4">ID Pedido</th>
                <th className="py-3 px-4">ID Producto</th>
                <th className="py-3 px-4">Nombre Producto</th>
                <th className="py-3 px-4">Precio Unitario</th>
                <th className="py-3 px-4">Cantidad</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">Color</th>
                <th className="py-3 px-4">Talla</th>
                <th className="py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentDetalles.length > 0 ? (
                currentDetalles.map((detalle, index) => (
                  <tr
                    key={detalle.id}
                    className={index % 2 === 0 ? "bg-grisClaro" : "bg-white"}
                  >
                    <td className="py-3 px-4">{detalle.id}</td>
                    <td className="py-3 px-4">
                      {editingDetalleId === detalle.id ? (
                        <input
                          type="text"
                          name="pedido_id"
                          value={editedDetalle.pedido_id || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        detalle.pedido_id
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingDetalleId === detalle.id ? (
                        <input
                          type="text"
                          name="producto_id"
                          value={editedDetalle.producto_id || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        detalle.producto_id
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingDetalleId === detalle.id ? (
                        <input
                          type="text"
                          name="nombre_producto"
                          value={editedDetalle.nombre_producto || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        detalle.nombre_producto
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingDetalleId === detalle.id ? (
                        <input
                          type="number"
                          name="precio_unitario"
                          value={editedDetalle.precio_unitario || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                          step="0.01"
                        />
                      ) : (
                        detalle.precio_unitario
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingDetalleId === detalle.id ? (
                        <input
                          type="number"
                          name="cantidad"
                          value={editedDetalle.cantidad || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        detalle.cantidad
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingDetalleId === detalle.id ? (
                        <input
                          type="number"
                          name="subtotal"
                          value={editedDetalle.subtotal || ""}
                          className="w-full border px-2 py-1"
                          step="0.01"
                          readOnly
                        />
                      ) : (
                        detalle.subtotal
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingDetalleId === detalle.id ? (
                        <input
                          type="text"
                          name="color"
                          value={editedDetalle.color || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        detalle.color
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingDetalleId === detalle.id ? (
                        <input
                          type="text"
                          name="talla"
                          value={editedDetalle.talla || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        detalle.talla
                      )}
                    </td>
                    <td className="py-3 px-4 flex items-center space-x-2">
                      {editingDetalleId === detalle.id ? (
                        <button
                          onClick={handleSave}
                          className="text-azulOscuroMate hover:text-blue-500"
                        >
                          Guardar
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(detalle)}
                            className="text-azulOscuroMate hover:text-blue-500"
                            title="Editar"
                          >
                            <FaEdit size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(detalle.id)}
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
                  <td colSpan="10" className="py-4 px-4 text-center text-gray-500">
                    No se encontraron detalles de pedidos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {filteredDetalles.length > 0 && (
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