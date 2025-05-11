import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt, FaPlus, FaCheck, FaHourglass } from "react-icons/fa";
import Swal from "sweetalert2";

export default function Contactos() {
  const [contactos, setContactos] = useState([]);
  const [error, setError] = useState(null);
  const [editingContactoId, setEditingContactoId] = useState(null);
  const [editedContacto, setEditedContacto] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContacto, setNewContacto] = useState({
    nombre: "",
    email: "",
    mensaje: "",
    fecha_creacion: "",
    estado: "Pendiente"
  });

  const fetchContactos = () => {
    fetch("http://localhost/CorpFreshhXAMPP/bd/obtenerContactos.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener contactos");
        }
        return response.json();
      })
      .then((data) => {
        setContactos(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setError(err.message);
        setContactos([]);
      });
  };

  useEffect(() => {
    fetchContactos();
  }, []);

  const handleEdit = (contacto) => {
    setEditingContactoId(contacto.id);
    setEditedContacto({...contacto});
  };

  const handleSave = () => {
    fetch("http://localhost/CorpFreshhXAMPP/bd/actualizarContacto.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedContacto),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setContactos((prevContactos) =>
            prevContactos.map((p) =>
              p.id === editedContacto.id ? editedContacto : p
            )
          );
          setEditingContactoId(null);
          setEditedContacto({});
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Contacto actualizado correctamente",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al actualizar el contacto",
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
        fetch("http://localhost/CorpFreshhXAMPP/bd/eliminarContacto.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id_contacto: id }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              setContactos((prevContactos) =>
                prevContactos.filter((p) => p.id !== id)
              );
              Swal.fire({
                icon: "success",
                title: "Eliminado",
                text: "El contacto ha sido eliminado correctamente",
                timer: 2000,
                showConfirmButton: false,
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error al eliminar el contacto: " + (data.message || ""),
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
    setEditedContacto((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setNewContacto((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddContacto = (e) => {
    e.preventDefault();
    
    if (!newContacto.nombre || !newContacto.email) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "El nombre y el email son obligatorios",
      });
      return;
    }

    fetch("http://localhost/CorpFreshhXAMPP/bd/agregarContacto.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newContacto),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const contactoConId = { ...newContacto, id: data.id_contacto };
          setContactos((prevContactos) => [...prevContactos, contactoConId]);
          setNewContacto({
            nombre: "",
            email: "",
            mensaje: "",
            fecha_creacion: "",
            estado: "Pendiente"
          });
          setShowAddForm(false);
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Contacto agregado correctamente",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al agregar el contacto: " + (data.message || ""),
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

  const handleToggleEstado = (contacto) => {
    const nuevoEstado = contacto.estado === "Pendiente" ? "Respondido" : "Pendiente";
    
    fetch("http://localhost/CorpFreshhXAMPP/bd/cambiarEstadoContacto.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        id: contacto.id,
        estado: nuevoEstado 
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setContactos((prevContactos) =>
            prevContactos.map((p) =>
              p.id === contacto.id ? { ...p, estado: nuevoEstado } : p
            )
          );
          Swal.fire({
            icon: "success",
            title: "Estado actualizado",
            text: `El contacto ahora está marcado como "${nuevoEstado}"`,
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al actualizar el estado: " + (data.message || ""),
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

  const filteredContactos = contactos.filter((contacto) =>
    Object.values(contacto).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const indexOfLastContacto = currentPage * itemsPerPage;
  const indexOfFirstContacto = indexOfLastContacto - itemsPerPage;
  const currentContactos = filteredContactos.slice(indexOfFirstContacto, indexOfLastContacto);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(filteredContactos.length / itemsPerPage);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-grisOscuro">Contactos</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-azulOscuroMate text-black px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <FaPlus /> {showAddForm ? "Cancelar" : "Agregar Contacto"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-4 mb-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4 text-grisOscuro">
            Agregar Nuevo Contacto
          </h3>
          <form onSubmit={handleAddContacto} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                value={newContacto.nombre}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={newContacto.email}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje
              </label>
              <textarea
                name="mensaje"
                value={newContacto.mensaje}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                rows="4"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Creación
              </label>
              <input
                type="date"
                name="fecha_creacion"
                value={newContacto.fecha_creacion}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                name="estado"
                value={newContacto.estado}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Respondido">Respondido</option>
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
                Guardar Contacto
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar contactos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full md:w-1/3"
        />
        
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600">Resultados por página:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="p-2 border border-gray-300 rounded"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left bg-white">
            <thead className="bg-grisOscuro text-dark">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Nombre</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Mensaje</th>
                <th className="py-3 px-4">Fecha Creación</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentContactos.length > 0 ? (
                currentContactos.map((contacto, index) => (
                  <tr
                    key={contacto.id}
                    className={index % 2 === 0 ? "bg-grisClaro" : "bg-white"}
                  >
                    <td className="py-3 px-4">{contacto.id}</td>
                    <td className="py-3 px-4">
                      {editingContactoId === contacto.id ? (
                        <input
                          type="text"
                          name="nombre"
                          value={editedContacto.nombre || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        contacto.nombre
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingContactoId === contacto.id ? (
                        <input
                          type="email"
                          name="email"
                          value={editedContacto.email || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        contacto.email
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingContactoId === contacto.id ? (
                        <textarea
                          name="mensaje"
                          value={editedContacto.mensaje || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                          rows="2"
                        ></textarea>
                      ) : (
                        contacto.mensaje
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingContactoId === contacto.id ? (
                        <input
                          type="date"
                          name="fecha_creacion"
                          value={editedContacto.fecha_creacion || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        contacto.fecha_creacion
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingContactoId === contacto.id ? (
                        <select
                          name="estado"
                          value={editedContacto.estado || "Pendiente"}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Respondido">Respondido</option>
                        </select>
                      ) : (
                        <span 
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            contacto.estado === "Respondido" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {contacto.estado === "Respondido" ? (
                            <><FaCheck className="inline mr-1" /> {contacto.estado}</>
                          ) : (
                            <><FaHourglass className="inline mr-1" /> {contacto.estado}</>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 flex items-center space-x-2">
                      {editingContactoId === contacto.id ? (
                        <>
                          <button
                            onClick={handleSave}
                            className="text-green-600 hover:text-green-800"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingContactoId(null)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(contacto)}
                            className="text-azulOscuroMate hover:text-blue-500"
                            title="Editar"
                          >
                            <FaEdit size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(contacto.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Eliminar"
                          >
                            <FaTrashAlt size={20} />
                          </button>
                          <button
                            onClick={() => handleToggleEstado(contacto)}
                            className={`${
                              contacto.estado === "Respondido"
                                ? "text-yellow-600 hover:text-yellow-800"
                                : "text-green-600 hover:text-green-800"
                            }`}
                            title={`Marcar como ${
                              contacto.estado === "Respondido" ? "Pendiente" : "Respondido"
                            }`}
                          >
                            {contacto.estado === "Respondido" ? (
                              <FaHourglass size={20} />
                            ) : (
                              <FaCheck size={20} />
                            )}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-4 px-4 text-center text-gray-500">
                    No se encontraron contactos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {filteredContactos.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Mostrando {indexOfFirstContacto + 1} a {Math.min(indexOfLastContacto, filteredContactos.length)} de {filteredContactos.length} contactos
          </div>
          <div className="flex items-center">
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
        </div>
      )}
    </div>
  );
}