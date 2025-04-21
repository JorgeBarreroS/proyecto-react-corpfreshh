import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";


export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState(null);
  const [editingProductoId, setEditingProductoId] = useState(null);
  const [editedProducto, setEditedProducto] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProducto, setNewProducto] = useState({
    nombre_producto: "",
    descripcion_producto: "",
    color_producto: "",
    precio_producto: "",
    imagen_producto: "",
    nombre_marca: "",
    talla: "",
    id_categoria: ""
  });

  const fetchProductos = () => {
    fetch("http://localhost/CorpFreshhXAMPP/bd/obtenerProductos.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener productos");
        }
        return response.json();
      })
      .then((data) => setProductos(data))
      .catch((err) => setError(err.message));
  };

  const fetchCategorias = () => {
    fetch("http://localhost/CorpFreshhXAMPP/bd/obtenerCategorias.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener categorías");
        }
        return response.json();
      })
      .then((data) => setCategorias(data))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, []);

  const handleEdit = (producto) => {
    setEditingProductoId(producto.id_producto);
    setEditedProducto(producto);
  };

  const handleSave = () => {
    fetch("http://localhost/CorpFreshhXAMPP/bd/actualizarProducto.php", {
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
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Producto actualizado correctamente",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al actualizar el producto",
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
        fetch("http://localhost/CorpFreshhXAMPP/bd/eliminarProducto.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id_producto: id }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              setProductos((prevProductos) =>
                prevProductos.filter((producto) => producto.id_producto !== id)
              );
              Swal.fire({
                icon: "success",
                title: "Eliminado",
                text: "El producto ha sido eliminado correctamente",
                timer: 2000,
                showConfirmButton: false,
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error al eliminar el producto: " + (data.message || ""),
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
    setEditedProducto((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setNewProducto((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!newProducto.nombre_producto || !newProducto.precio_producto) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "El nombre y precio del producto son obligatorios",
      });
      return;
    }

    fetch("http://localhost/CorpFreshhXAMPP/bd/agregarProducto.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProducto),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Agregar el nuevo producto con el ID generado
          const productoConId = { ...newProducto, id_producto: data.id_producto };
          setProductos((prevProductos) => [...prevProductos, productoConId]);
          
          // Resetear el formulario
          setNewProducto({
            nombre_producto: "",
            descripcion_producto: "",
            color_producto: "",
            precio_producto: "",
            imagen_producto: "",
            nombre_marca: "",
            talla: "",
            id_categoria: ""
          });
          
          // Cerrar el formulario
          setShowAddForm(false);
          
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Producto agregado correctamente",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al agregar el producto: " + (data.message || ""),
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

  // Función para obtener el nombre de la categoría según el ID
  const getNombreCategoria = (id_categoria) => {
    const categoria = categorias.find(cat => cat.id_categoria === id_categoria);
    return categoria ? categoria.nombre_categoria : "Sin categoría";
  };

  // Filtrar productos por búsqueda
  const filteredProductos = productos.filter((producto) =>
    producto.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const indexOfLastProducto = currentPage * itemsPerPage;
  const indexOfFirstProducto = indexOfLastProducto - itemsPerPage;
  const currentProductos = filteredProductos.slice(
    indexOfFirstProducto,
    indexOfLastProducto
  );

  // Cambiar página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calcular el total de páginas
  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-grisOscuro">Productos</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-azulOscuroMate text-black px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <FaPlus /> {showAddForm ? "Cancelar" : "Agregar Producto"}
        </button>
      </div>

      {/* Formulario para agregar producto */}
      {showAddForm && (
        <div className="bg-white p-4 mb-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4 text-grisOscuro">
            Agregar Nuevo Producto
          </h3>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre_producto"
                value={newProducto.nombre_producto}
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
                name="descripcion_producto"
                value={newProducto.descripcion_producto}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="text"
                name="color_producto"
                value={newProducto.color_producto}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio *
              </label>
              <input
                type="number"
                name="precio_producto"
                value={newProducto.precio_producto}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de Imagen
              </label>
              <input
                type="text"
                name="imagen_producto"
                value={newProducto.imagen_producto}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca
              </label>
              <input
                type="text"
                name="nombre_marca"
                value={newProducto.nombre_marca}
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
                value={newProducto.talla}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                name="id_categoria"
                value={newProducto.id_categoria}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id_categoria} value={categoria.id_categoria}>
                    {categoria.nombre_categoria}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-4">
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
                Guardar Producto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar productos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 p-2 border border-gray-300 w-full"
      />

      {/* Tabla de productos con responsive */}
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg table-responsive">
          <table className="w-full text-sm text-left bg-white ">
            <thead className="bg-grisOscuro text-dark">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Nombre</th>
                <th className="py-3 px-4">Descripción</th>
                <th className="py-3 px-4">Color</th>
                <th className="py-3 px-4">Precio</th>
                <th className="py-3 px-4">Imagen</th>
                <th className="py-3 px-4">Marca</th>
                <th className="py-3 px-4">Talla</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentProductos.length > 0 ? (
                currentProductos.map((producto, index) => (
                  <tr
                    key={producto.id_producto}
                    className={index % 2 === 0 ? "bg-grisClaro" : "bg-white"}
                  >
                    <td className="py-3 px-4">{producto.id_producto}</td>
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4">
                      {editingProductoId === producto.id_producto ? (
                        <select
                          name="id_categoria"
                          value={editedProducto.id_categoria}
                          onChange={handleChange}
                          className="w-full border px-2 py-1"
                        >
                          <option value="">Selecciona una categoría</option>
                          {categorias.map((categoria) => (
                            <option key={categoria.id_categoria} value={categoria.id_categoria}>
                              {categoria.nombre_categoria}
                            </option>
                          ))}
                        </select>
                      ) : (
                        getNombreCategoria(producto.id_categoria)
                      )}
                    </td>
                    <td className="py-3 px-4 flex items-center space-x-2">
                      {editingProductoId === producto.id_producto ? (
                        <button
                          onClick={handleSave}
                          className="text-azulOscuroMate hover:text-blue-500"
                        >
                          Guardar
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(producto)}
                            className="text-azulOscuroMate hover:text-blue-500"
                            title="Editar"
                          >
                            <FaEdit size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(producto.id_producto)}
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
                    No se encontraron productos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {filteredProductos.length > 0 && (
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