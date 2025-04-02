import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState(null);
  const [editingPedidoId, setEditingPedidoId] = useState(null);
  const [editedPedido, setEditedPedido] = useState({});

  useEffect(() => {
    fetch("http://localhost/CorpFreshhXAMPP/bd/obtenerPedidos.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener pedidos");
        }
        return response.json();
      })
      .then((data) => setPedidos(data))
      .catch((err) => setError(err.message));
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
        } else {
          alert("Error al actualizar el pedido");
        }
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedPedido((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="text-xl font-semibold text-grisOscuro mb-4">Pedidos</h2>
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <table className="min-w-full bg-white shadow-lg rounded-lg">
          <thead className="bg-grisOscuro text-dark">
            <tr>
              <th className="py-2 px-4 text-left">ID Pedido</th>
              <th className="py-2 px-4 text-left">ID Venta</th>
              <th className="py-2 px-4 text-left">ID Usuario</th>
              <th className="py-2 px-4 text-left">Fecha Pedido</th>
              <th className="py-2 px-4 text-left">Estado Pedido</th>
              <th className="py-2 px-4 text-left">Método Envío</th>
              <th className="py-2 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido, index) => (
              <tr
                key={pedido.id_pedido}
                className={index % 2 === 0 ? "bg-grisClaro" : "bg-white"}
              >
                <td className="py-2 px-4">{pedido.id_pedido}</td>
                <td className="py-2 px-4">
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
                <td className="py-2 px-4">
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
                <td className="py-2 px-4">
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
                <td className="py-2 px-4">
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
                <td className="py-2 px-4">
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
                <td className="py-2 px-4 text-center">
                  {editingPedidoId === pedido.id_pedido ? (
                    <button
                      onClick={handleSave}
                      className="text-azulOscuroMate hover:text-blue-500"
                    >
                      Guardar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEdit(pedido)}
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
      )}
    </div>
  );
}
