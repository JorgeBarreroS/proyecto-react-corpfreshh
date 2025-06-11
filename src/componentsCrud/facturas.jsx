import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";

export default function Facturas() {
  const [facturas, setFacturas] = useState([]);
  const [error, setError] = useState(null);
  const [editingFacturaId, setEditingFacturaId] = useState(null);
  const [editedFactura, setEditedFactura] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFactura, setNewFactura] = useState({
    id: "",
    pedido_id: "",
    correo_usuario: "",
    id_usuario: "",
    fecha_factura: "",
    subtotal: "",
    envio: "",
    impuestos: "",
    total: "",
    metodo_pago: ""
  });

  const fetchFacturas = () => {
    fetch("https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/xampp/bd/obtenerFacturas.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener facturas");
        }
        return response.json();
      })
      .then((data) => {
        setFacturas(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setError(err.message);
        setFacturas([]);
      });
  };

  useEffect(() => {
    fetchFacturas();
  }, []);

  const handleEdit = (factura) => {
    setEditingFacturaId(factura.id);
    setEditedFactura({...factura});
  };

  const handleSave = () => {
    fetch("https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/xampp/bd/actualizarFactura.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedFactura),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setFacturas((prevFacturas) =>
            prevFacturas.map((f) =>
              f.id === editedFactura.id ? editedFactura : f
            )
          );
          setEditingFacturaId(null);
          setEditedFactura({});
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Factura actualizada correctamente",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al actualizar la factura",
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
        fetch("https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/xampp/bd/eliminarFactura.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id_factura: id }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              setFacturas((prevFacturas) =>
                prevFacturas.filter((f) => f.id !== id)
              );
              Swal.fire({
                icon: "success",
                title: "Eliminada",
                text: "La factura ha sido eliminada correctamente",
                timer: 2000,
                showConfirmButton: false,
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error al eliminar la factura: " + (data.message || ""),
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
    setEditedFactura((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setNewFactura((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFactura = (e) => {
    e.preventDefault();
    
    if (!newFactura.correo_usuario || !newFactura.id_usuario) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "El correo y el ID de usuario son obligatorios",
      });
      return;
    }

    fetch("https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/xampp/bd/agregarFactura.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newFactura),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const facturaConId = { ...newFactura, id: data.id_factura };
          setFacturas((prevFacturas) => [...prevFacturas, facturaConId]);
          setNewFactura({
            id: "",
            pedido_id: "",
            correo_usuario: "",
            id_usuario: "",
            fecha_factura: "",
            subtotal: "",
            envio: "",
            impuestos: "",
            total: "",
            metodo_pago: ""
          });
          setShowAddForm(false);
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Factura agregada correctamente",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al agregar la factura: " + (data.message || ""),
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

  const filteredFacturas = facturas.filter((factura) =>
    Object.values(factura).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const indexOfLastFactura = currentPage * itemsPerPage;
  const indexOfFirstFactura = indexOfLastFactura - itemsPerPage;
  const currentFacturas = filteredFacturas.slice(indexOfFirstFactura, indexOfLastFactura);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(filteredFacturas.length / itemsPerPage);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-grisOscuro">Facturas</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-azulOscuroMate text-black px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <FaPlus /> {showAddForm ? "Cancelar" : "Agregar Factura"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-4 mb-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4 text-grisOscuro">
            Agregar Nueva Factura
          </h3>
          <form onSubmit={handleAddFactura} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Pedido
              </label>
              <input
                type="text"
                name="pedido_id"
                value={newFactura.pedido_id}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Usuario *
              </label>
              <input
                type="email"
                name="correo_usuario"
                value={newFactura.correo_usuario}
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
                value={newFactura.id_usuario}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Factura
              </label>
              <input
                type="date"
                name="fecha_factura"
                value={newFactura.fecha_factura}
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
                value={newFactura.subtotal}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Envío
              </label>
              <input
                type="number"
                name="envio"
                value={newFactura.envio}
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
                value={newFactura.impuestos}
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
                name="total"
                value={newFactura.total}
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
                value={newFactura.metodo_pago}
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
                Guardar Factura
              </button>
            </div>
          </form>
        </div>
      )}

      <input
        type="text"
        placeholder="Buscar facturas..."
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
                <th className="py-3 px-4">Correo</th>
                <th className="py-3 px-4">ID Usuario</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">Envío</th>
                <th className="py-3 px-4">Impuestos</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Método Pago</th>
                <th className="py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentFacturas.length > 0 ? (
                currentFacturas.map((factura, index) => (
                  <tr
                    key={factura.id}
                    className={index % 2 === 0 ? "bg-grisClaro" : "bg-white"}
                  >
                    <td className="py-3 px-4">{factura.id}</td>
                    <td className="py-3 px-4">
                      {editingFacturaId === factura.id ? (
                        <input
                          type="text"
                          name="pedido_id"
                          value={editedFactura.pedido_id || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        factura.pedido_id
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingFacturaId === factura.id ? (
                        <input
                          type="email"
                          name="correo_usuario"
                          value={editedFactura.correo_usuario || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        factura.correo_usuario
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingFacturaId === factura.id ? (
                        <input
                          type="text"
                          name="id_usuario"
                          value={editedFactura.id_usuario || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        factura.id_usuario
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingFacturaId === factura.id ? (
                        <input
                          type="date"
                          name="fecha_factura"
                          value={editedFactura.fecha_factura || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        factura.fecha_factura
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingFacturaId === factura.id ? (
                        <input
                          type="number"
                          name="subtotal"
                          value={editedFactura.subtotal || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                          step="0.01"
                        />
                      ) : (
                        factura.subtotal
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingFacturaId === factura.id ? (
                        <input
                          type="number"
                          name="envio"
                          value={editedFactura.envio || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                          step="0.01"
                        />
                      ) : (
                        factura.envio
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingFacturaId === factura.id ? (
                        <input
                          type="number"
                          name="impuestos"
                          value={editedFactura.impuestos || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                          step="0.01"
                        />
                      ) : (
                        factura.impuestos
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingFacturaId === factura.id ? (
                        <input
                          type="number"
                          name="total"
                          value={editedFactura.total || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                          step="0.01"
                        />
                      ) : (
                        factura.total
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingFacturaId === factura.id ? (
                        <input
                          type="text"
                          name="metodo_pago"
                          value={editedFactura.metodo_pago || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        factura.metodo_pago
                      )}
                    </td>
                    <td className="py-3 px-4 flex items-center space-x-2">
                      {editingFacturaId === factura.id ? (
                        <button
                          onClick={handleSave}
                          className="text-azulOscuroMate hover:text-blue-500"
                        >
                          Guardar
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(factura)}
                            className="text-azulOscuroMate hover:text-blue-500"
                            title="Editar"
                          >
                            <FaEdit size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(factura.id)}
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
                  <td colSpan="11" className="py-4 px-4 text-center text-gray-500">
                    No se encontraron facturas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {filteredFacturas.length > 0 && (
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