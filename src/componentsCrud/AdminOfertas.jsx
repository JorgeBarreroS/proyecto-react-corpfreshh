import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt, FaPlus, FaToggleOn, FaToggleOff } from "react-icons/fa";
import Swal from "sweetalert2";

export default function AdminOfertas() {
  const [ofertas, setOfertas] = useState([]);
  const [error, setError] = useState(null);
  const [editingOfertaId, setEditingOfertaId] = useState(null);
  const [editedOferta, setEditedOferta] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOferta, setNewOferta] = useState({
    titulo: "",
    descripcion: "",
    porcentaje_descuento: 0,
    fecha_inicio: "",
    fecha_fin: "",
    activo: 1,
    texto_boton: "Comprar Ahora"
  });

  const fetchOfertas = () => {
    fetch("http://localhost/CorpFreshhXAMPP/bd/Ofertas/obtenerOfertas.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener ofertas");
        }
        return response.json();
      })
      .then((data) => setOfertas(data))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    fetchOfertas();
  }, []);

  const handleEdit = (oferta) => {
    setEditingOfertaId(oferta.id_oferta);
    setEditedOferta(oferta);
  };

  const handleSave = () => {
    fetch("http://localhost/CorpFreshhXAMPP/bd/Ofertas/actualizarOferta.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedOferta),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setOfertas((prevOfertas) =>
            prevOfertas.map((oferta) =>
              oferta.id_oferta === editedOferta.id_oferta
                ? editedOferta
                : oferta
            )
          );
          setEditingOfertaId(null);
          setEditedOferta({});
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Oferta actualizada correctamente",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al actualizar la oferta",
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
        fetch("http://localhost/CorpFreshhXAMPP/bd/Ofertas/eliminarOferta.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id_oferta: id }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              setOfertas((prevOfertas) =>
                prevOfertas.filter((oferta) => oferta.id_oferta !== id)
              );
              Swal.fire({
                icon: "success",
                title: "Eliminado",
                text: "La oferta ha sido eliminada correctamente",
                timer: 2000,
                showConfirmButton: false,
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error al eliminar la oferta: " + (data.message || ""),
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

  const handleToggleActive = (id, currentState) => {
    const newState = currentState === "1" ? "0" : "1";
    
    fetch("http://localhost/CorpFreshhXAMPP/bd/Ofertas/toggleOfertaActiva.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id_oferta: id, activo: newState }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setOfertas((prevOfertas) =>
            prevOfertas.map((oferta) =>
              oferta.id_oferta === id
                ? { ...oferta, activo: newState }
                : oferta
            )
          );
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: `Oferta ${newState === "1" ? "activada" : "desactivada"} correctamente`,
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al cambiar el estado de la oferta",
          });
        }
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedOferta((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setNewOferta((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOferta = (e) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!newOferta.titulo || !newOferta.fecha_fin) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "El título y fecha de finalización son obligatorios",
      });
      return;
    }

    fetch("http://localhost/CorpFreshhXAMPP/bd/Ofertas/agregarOferta.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newOferta),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Agregar la nueva oferta con el ID generado
          const ofertaConId = { ...newOferta, id_oferta: data.id_oferta };
          setOfertas((prevOfertas) => [...prevOfertas, ofertaConId]);
          
          // Resetear el formulario
          setNewOferta({
            titulo: "",
            descripcion: "",
            porcentaje_descuento: 0,
            fecha_inicio: "",
            fecha_fin: "",
            activo: 1,
            texto_boton: "Comprar Ahora"
          });
          
          // Cerrar el formulario
          setShowAddForm(false);
          
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Oferta agregada correctamente",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al agregar la oferta: " + (data.message || ""),
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

  // Formatear fecha para input datetime-local
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-grisOscuro">Ofertas Especiales</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-azulOscuroMate text-black px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <FaPlus /> {showAddForm ? "Cancelar" : "Agregar Oferta"}
        </button>
      </div>

      {/* Formulario para agregar oferta */}
      {showAddForm && (
        <div className="bg-white p-4 mb-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4 text-grisOscuro">
            Agregar Nueva Oferta Especial
          </h3>
          <form onSubmit={handleAddOferta} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                name="titulo"
                value={newOferta.titulo}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                name="descripcion"
                value={newOferta.descripcion}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Porcentaje de Descuento
              </label>
              <input
                type="number"
                name="porcentaje_descuento"
                value={newOferta.porcentaje_descuento}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Texto del Botón
              </label>
              <input
                type="text"
                name="texto_boton"
                value={newOferta.texto_boton}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="datetime-local"
                name="fecha_inicio"
                value={newOferta.fecha_inicio}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Fin *
              </label>
              <input
                type="datetime-local"
                name="fecha_fin"
                value={newOferta.fecha_fin}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                name="activo"
                value={newOferta.activo}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
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
                Guardar Oferta
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de ofertas con responsive */}
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left bg-white">
            <thead className="bg-grisOscuro text-dark">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Título</th>
                <th className="py-3 px-4">Descripción</th>
                <th className="py-3 px-4">Descuento</th>
                <th className="py-3 px-4">Fecha Inicio</th>
                <th className="py-3 px-4">Fecha Fin</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ofertas.length > 0 ? (
                ofertas.map((oferta, index) => (
                  <tr
                    key={oferta.id_oferta}
                    className={index % 2 === 0 ? "bg-grisClaro" : "bg-white"}
                  >
                    <td className="py-3 px-4">{oferta.id_oferta}</td>
                    <td className="py-3 px-4">
                      {editingOfertaId === oferta.id_oferta ? (
                        <input
                          type="text"
                          name="titulo"
                          value={editedOferta.titulo}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        oferta.titulo
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingOfertaId === oferta.id_oferta ? (
                        <input
                          type="text"
                          name="descripcion"
                          value={editedOferta.descripcion}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        oferta.descripcion
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingOfertaId === oferta.id_oferta ? (
                        <input
                          type="number"
                          name="porcentaje_descuento"
                          value={editedOferta.porcentaje_descuento}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                          min="0"
                          max="100"
                        />
                      ) : (
                        `${oferta.porcentaje_descuento}%`
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingOfertaId === oferta.id_oferta ? (
                        <input
                          type="datetime-local"
                          name="fecha_inicio"
                          value={formatDateForInput(editedOferta.fecha_inicio)}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        new Date(oferta.fecha_inicio).toLocaleString()
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingOfertaId === oferta.id_oferta ? (
                        <input
                          type="datetime-local"
                          name="fecha_fin"
                          value={formatDateForInput(editedOferta.fecha_fin)}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        new Date(oferta.fecha_fin).toLocaleString()
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingOfertaId === oferta.id_oferta ? (
                        <select
                          name="activo"
                          value={editedOferta.activo}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        >
                          <option value="1">Activo</option>
                          <option value="0">Inactivo</option>
                        </select>
                      ) : (
                        <span 
                          className={`px-2 py-1 rounded ${
                            oferta.activo === "1" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {oferta.activo === "1" ? "Activo" : "Inactivo"}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 flex items-center space-x-2">
                      {editingOfertaId === oferta.id_oferta ? (
                        <button
                          onClick={handleSave}
                          className="text-azulOscuroMate hover:text-blue-500"
                        >
                          Guardar
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(oferta)}
                            className="text-azulOscuroMate hover:text-blue-500"
                            title="Editar"
                          >
                            <FaEdit size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(oferta.id_oferta)}
                            className="text-red-600 hover:text-red-800"
                            title="Eliminar"
                          >
                            <FaTrashAlt size={20} />
                          </button>
                          <button
                            onClick={() => handleToggleActive(oferta.id_oferta, oferta.activo)}
                            className={oferta.activo === "1" ? "text-green-600 hover:text-green-800" : "text-gray-500 hover:text-gray-700"}
                            title={oferta.activo === "1" ? "Desactivar" : "Activar"}
                          >
                            {oferta.activo === "1" ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-4 px-4 text-center text-gray-500">
                    No se encontraron ofertas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}