import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [error, setError] = useState(null);
  const [editingOrdenId, setEditingOrdenId] = useState(null);
  const [editedOrden, setEditedOrden] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of orders per page

  useEffect(() => {
    fetch("http://localhost/CorpFreshhXAMPP/bd/obtenerOrdenes.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener órdenes");
        }
        return response.json();
      })
      .then((data) => setOrdenes(data))
      .catch((err) => setError(err.message));
  }, []);

  const handleEdit = (orden) => {
    setEditingOrdenId(orden.id_venta);
    setEditedOrden(orden);
  };

  const handleSave = () => {
    fetch("http://localhost/CorpFreshhXAMPP/bd/actualizarOrden.php", {
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
        } else {
          alert("Error al actualizar la orden");
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
      <h2 className="text-xl font-semibold text-grisOscuro mb-4">Órdenes</h2>
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar por ID o Usuario"
              value={searchQuery}
              onChange={handleSearch}
              className="border p-2 rounded"
            />
          </div>

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
              {paginatedOrdenes.map((orden, index) => (
                <tr
                  key={orden.id_venta}
                  className={index % 2 === 0 ? "bg-grisClaro" : "bg-white"}
                >
                  <td className="py-2 px-4">{orden.id_venta}</td>
                  <td className="py-2 px-4">
                    {editingOrdenId === orden.id_venta ? (
                      <input
                        type="text"
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
                        type="text"
                        name="impuesto_venta"
                        value={editedOrden.impuesto_venta}
                        onChange={handleChange}
                        className="w-full border px-2 py-1"
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
                      />
                    ) : (
                      orden.total_venta
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {editingOrdenId === orden.id_venta ? (
                      <input
                        type="text"
                        name="estado_venta"
                        value={editedOrden.estado_venta}
                        onChange={handleChange}
                        className="w-full border px-2 py-1"
                      />
                    ) : (
                      orden.estado_venta
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {editingOrdenId === orden.id_venta ? (
                      <input
                        type="text"
                        name="id_usuario"
                        value={editedOrden.id_usuario}
                        onChange={handleChange}
                        className="w-full border px-2 py-1"
                      />
                    ) : (
                      orden.id_usuario
                    )}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {editingOrdenId === orden.id_venta ? (
                      <button
                        onClick={handleSave}
                        className="text-azulOscuroMate hover:text-blue-500"
                      >
                        Guardar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEdit(orden)}
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

          {/* Pagination */}
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="bg-gray-200 px-4 py-2 rounded-md"
            >
              Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="bg-gray-200 px-4 py-2 rounded-md"
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}
