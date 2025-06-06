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
    activo: "1",
    texto_boton: "Comprar Ahora",
    id_producto: null,
    id_categoria: null
  });

  const fetchOfertas = () => {
  fetch("http://localhost/CorpFreshhXAMPP/bd/Ofertas/obtenerOfertas.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al obtener ofertas");
      }
      return response.json();
    })
    .then((data) => {
      const now = new Date();

      const ofertasFormateadas = data.map((oferta) => {
        const fechaFin = new Date(oferta.fecha_fin);
        const isExpired = fechaFin < now;
        const estabaActiva = oferta.activo === "1";

        // Si la oferta venció y aún está activa, cambiar estado
        if (isExpired && estabaActiva) {
          desactivarOfertaAutomatica(oferta.id_oferta);
          oferta.activo = "0";
        }

        return {
          ...oferta,
          activo: String(oferta.activo),
          fecha_inicio: formatDateForDisplay(oferta.fecha_inicio),
          fecha_fin: formatDateForDisplay(oferta.fecha_fin)
        };
      });

      setOfertas(ofertasFormateadas);
    })
    .catch((err) => {
      setError(err.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al cargar las ofertas: " + err.message,
      });
    });
};
const desactivarOfertaAutomatica = async (id_oferta) => {
  try {
    const response = await fetch("http://localhost/CorpFreshhXAMPP/bd/Ofertas/toggleOfertaActiva.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_oferta,
        activo: "0",
      }),
    });

    const data = await response.json();
    if (!data.success) {
      console.error("No se pudo desactivar oferta vencida:", data.message);
    }
  } catch (error) {
    console.error("Error desactivando oferta vencida:", error);
  }
};


  useEffect(() => {
    fetchOfertas();
  }, []);

  const handleEdit = (oferta) => {
  setEditingOfertaId(oferta.id_oferta);
  setEditedOferta({
    ...oferta,
    // Asegurar que activo sea string "1" o "0"
    activo: oferta.activo === "1" ? "1" : "0",
    // Formatear fechas para el input
    fecha_inicio: formatDateForInput(oferta.fecha_inicio),
    fecha_fin: formatDateForInput(oferta.fecha_fin),
    // Manejar valores nulos para id_producto e id_categoria
    id_producto: oferta.id_producto || null,
    id_categoria: oferta.id_categoria || null
  });
};

  const handleSave = async () => {
  // Validación reforzada
  if (!editedOferta.titulo || !editedOferta.fecha_fin) {
    Swal.fire({
      icon: "warning",
      title: "Campos requeridos",
      text: "El título y fecha de finalización son obligatorios",
    });
    return;
  }

  try {
    // Preparar datos para enviar
    const ofertaToSend = {
      ...editedOferta,
      activo: editedOferta.activo === "1" ? "1" : "0", // Forzar string "1" o "0"
      fecha_inicio: editedOferta.fecha_inicio || new Date().toISOString().slice(0, 16),
      fecha_fin: editedOferta.fecha_fin,
      id_producto: editedOferta.id_producto || null,
      id_categoria: editedOferta.id_categoria || null
    };

    // Debug: Mostrar datos que se enviarán
    console.log("Datos a enviar:", ofertaToSend);

    const response = await fetch("http://localhost/CorpFreshhXAMPP/bd/Ofertas/actualizarOferta.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ofertaToSend),
    });

    const data = await response.json();
    console.log("Respuesta del servidor:", data);

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Error al actualizar la oferta");
    }

    // Actualización optimista del estado local
    setOfertas(ofertas.map(oferta => 
      oferta.id_oferta === editingOfertaId ? { 
        ...oferta,
        ...editedOferta,
        activo: data.activo_actualizado !== undefined ? String(data.activo_actualizado) : editedOferta.activo,
        fecha_inicio: formatDateForDisplay(editedOferta.fecha_inicio),
        fecha_fin: formatDateForDisplay(editedOferta.fecha_fin)
      } : oferta
    ));

    setEditingOfertaId(null);
    setEditedOferta({});
    
    Swal.fire({
      icon: "success",
      title: "¡Éxito!",
      text: "Oferta actualizada correctamente",
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Error al actualizar:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message || "Ocurrió un error al actualizar la oferta",
    });
  }
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
              fetchOfertas(); // Recargar las ofertas
              Swal.fire({
                icon: "success",
                title: "Eliminado",
                text: "La oferta ha sido eliminada correctamente",
                timer: 2000,
                showConfirmButton: false,
              });
            } else {
              throw new Error(data.message || "Error al eliminar la oferta");
            }
          })
          .catch((error) => {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: error.message,
            });
          });
      }
    });
  };

const handleToggleActive = async (id, currentState) => {
  const newState = currentState === "1" ? "0" : "1";
  
  try {
    const response = await fetch("http://localhost/CorpFreshhXAMPP/bd/Ofertas/toggleOfertaActiva.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        id_oferta: id, 
        activo: newState 
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Error al cambiar el estado");
    }

    // Actualizar el estado local directamente para mejor rendimiento
    setOfertas(ofertas.map(oferta => 
      oferta.id_oferta === id ? { ...oferta, activo: newState } : oferta
    ));

    Swal.fire({
      icon: "success",
      title: "¡Éxito!",
      text: `Oferta ${newState === "1" ? "activada" : "desactivada"} correctamente`,
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message,
    });
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedOferta((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setNewOferta((prev) => ({ 
      ...prev, 
      [name]: name === "porcentaje_descuento" || name === "id_producto" || name === "id_categoria" 
        ? (value === "" ? null : parseInt(value)) 
        : value 
    }));
  };

  const handleAddOferta = (e) => {
    e.preventDefault();
    
    if (!newOferta.titulo || !newOferta.fecha_fin) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "El título y fecha de finalización son obligatorios",
      });
      return;
    }

    // Validar rango de descuento
    if (newOferta.porcentaje_descuento < 0 || newOferta.porcentaje_descuento > 100) {
      Swal.fire({
        icon: "warning",
        title: "Valor inválido",
        text: "El porcentaje de descuento debe estar entre 0 y 100",
      });
      return;
    }

    const ofertaToSend = {
      ...newOferta,
      fecha_inicio: newOferta.fecha_inicio || new Date().toISOString().slice(0, 16),
      activo: String(newOferta.activo)
    };

    fetch("http://localhost/CorpFreshhXAMPP/bd/Ofertas/agregarOferta.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ofertaToSend),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          fetchOfertas();
          setNewOferta({
            titulo: "",
            descripcion: "",
            porcentaje_descuento: 0,
            fecha_inicio: "",
            fecha_fin: "",
            activo: "1",
            texto_boton: "Comprar Ahora",
            id_producto: null,
            id_categoria: null
          });
          setShowAddForm(false);
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Oferta agregada correctamente",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          throw new Error(data.message || "Error al agregar la oferta");
        }
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
        });
      });
  };

  // Formatear fecha para input datetime-local
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  // Formatear fecha para visualización
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleString('es-ES', options);
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
                    ID Producto (opcional)
                </label>
                <input
                    type="number"
                    name="id_producto"
                    value={newOferta.id_producto || ''}
                    onChange={handleAddFormChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    min="1"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Categoría (opcional)
                </label>
                <input
                    type="number"
                    name="id_categoria"
                    value={newOferta.id_categoria || ''}
                    onChange={handleAddFormChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    min="1"
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
                <th className="py-3 px-4">Texto Botón</th>
                <th className="py-3 px-4">ID Producto</th>
                <th className="py-3 px-4">ID Categoría</th>
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
                          required
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
                          type="text"
                          name="texto_boton"
                          value={editedOferta.texto_boton}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        oferta.texto_boton
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingOfertaId === oferta.id_oferta ? (
                        <input
                          type="number"
                          name="id_producto"
                          value={editedOferta.id_producto || ''}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                          min="1"
                        />
                      ) : (
                        oferta.id_producto || '-'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingOfertaId === oferta.id_oferta ? (
                        <input
                          type="number"
                          name="id_categoria"
                          value={editedOferta.id_categoria || ''}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                          min="1"
                        />
                      ) : (
                        oferta.id_categoria || '-'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingOfertaId === oferta.id_oferta ? (
                        <input
                          type="datetime-local"
                          name="fecha_inicio"
                          value={editedOferta.fecha_inicio}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        />
                      ) : (
                        oferta.fecha_inicio
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingOfertaId === oferta.id_oferta ? (
                        <input
                          type="datetime-local"
                          name="fecha_fin"
                          value={editedOferta.fecha_fin}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                          required
                        />
                      ) : (
                        oferta.fecha_fin
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
                        <>
                          <button
                            onClick={handleSave}
                            className="text-green-600 hover:text-green-800"
                            title="Guardar"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingOfertaId(null)}
                            className="text-red-600 hover:text-red-800"
                            title="Cancelar"
                          >
                            Cancelar
                          </button>
                        </>
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
                  <td colSpan="11" className="py-4 px-4 text-center text-gray-500">
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