import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);
  const [editingProductoId, setEditingProductoId] = useState(null);
  const [editedProducto, setEditedProducto] = useState({});

  useEffect(() => {
    fetch("http://localhost/ejercicio1/src/bd/obtenerProductos.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener productos");
        }
        return response.json();
      })
      .then((data) => setProductos(data))
      .catch((err) => setError(err.message));
  }, []);

  const handleEdit = (producto) => {
    setEditingProductoId(producto.id_producto);
    setEditedProducto(producto);
  };

  const handleSave = () => {
    fetch("http://localhost/ejercicio1/src/bd/actualizarProducto.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedProducto),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setProductos((prevProductos) =>
            prevProductos.map((producto) =>
              producto.id_producto === editedProducto.id_producto
                ? editedProducto
                : producto
            )
          );
          setEditingProductoId(null);
          setEditedProducto({});
        } else {
          alert("Error al actualizar el producto");
        }
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProducto((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="text-xl font-semibold text-grisOscuro mb-4">Productos</h2>
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <table className="min-w-full bg-white shadow-lg rounded-lg">
          <thead className="bg-grisOscuro text-dark">
            <tr>
              <th className="py-2 px-4 text-left">ID</th>
              <th className="py-2 px-4 text-left">Nombre</th>
              <th className="py-2 px-4 text-left">Descripción</th>
              <th className="py-2 px-4 text-left">Color</th>
              <th className="py-2 px-4 text-left">Precio</th>
              <th className="py-2 px-4 text-left">Imagen</th>
              <th className="py-2 px-4 text-left">Marca</th>
              <th className="py-2 px-4 text-left">Talla</th>
              <th className="py-2 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto, index) => (
              <tr
                key={producto.id_producto}
                className={index % 2 === 0 ? "bg-grisClaro" : "bg-white"}
              >
                <td className="py-2 px-4">{producto.id_producto}</td>
                <td className="py-2 px-4">
                  {editingProductoId === producto.id_producto ? (
                    <input
                      type="text"
                      name="nombre_producto"
                      value={editedProducto.nombre_producto}
                      onChange={handleChange}
                      className="w-full border px-2 py-1"
                    />
                  ) : (
                    producto.nombre_producto
                  )}
                </td>
                <td className="py-2 px-4">
                  {editingProductoId === producto.id_producto ? (
                    <input
                      type="text"
                      name="descripcion_producto"
                      value={editedProducto.descripcion_producto}
                      onChange={handleChange}
                      className="w-full border px-2 py-1"
                    />
                  ) : (
                    producto.descripcion_producto
                  )}
                </td>
                <td className="py-2 px-4">
                  {editingProductoId === producto.id_producto ? (
                    <input
                      type="text"
                      name="color_producto"
                      value={editedProducto.color_producto}
                      onChange={handleChange}
                      className="w-full border px-2 py-1"
                    />
                  ) : (
                    producto.color_producto
                  )}
                </td>
                <td className="py-2 px-4">
                  {editingProductoId === producto.id_producto ? (
                    <input
                      type="number"
                      name="precio_producto"
                      value={editedProducto.precio_producto}
                      onChange={handleChange}
                      className="w-full border px-2 py-1"
                    />
                  ) : (
                    producto.precio_producto
                  )}
                </td>
                <td className="py-2 px-4">
                  {editingProductoId === producto.id_producto ? (
                    <input
                      type="text"
                      name="imagen_producto"
                      value={editedProducto.imagen_producto}
                      onChange={handleChange}
                      className="w-full border px-2 py-1"
                    />
                  ) : (
                    producto.imagen_producto
                  )}
                </td>
                <td className="py-2 px-4">
                  {editingProductoId === producto.id_producto ? (
                    <input
                      type="text"
                      name="nombre_marca"
                      value={editedProducto.nombre_marca}
                      onChange={handleChange}
                      className="w-full border px-2 py-1"
                    />
                  ) : (
                    producto.nombre_marca
                  )}
                </td>
                <td className="py-2 px-4">
                  {editingProductoId === producto.id_producto ? (
                    <input
                      type="text"
                      name="talla"
                      value={editedProducto.talla}
                      onChange={handleChange}
                      className="w-full border px-2 py-1"
                    />
                  ) : (
                    producto.talla
                  )}
                </td>
                <td className="py-2 px-4 text-center">
                  {editingProductoId === producto.id_producto ? (
                    <button
                      onClick={handleSave}
                      className="text-azulOscuroMate hover:text-blue-500"
                    >
                      Guardar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEdit(producto)}
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
