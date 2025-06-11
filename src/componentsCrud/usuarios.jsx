import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [dataStructure, setDataStructure] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    nombre_usuario: "",
    apellido_usuario: "",
    telefono_usuario: "",
    correo_usuario: "",
    direccion1_usuario: "",
    direccion2_usuario: "",
    ciudad_usuario: "",
    pais_usuario: "",
    contrasena: "",
    id_rol: ""
  });

  const fetchUsuarios = () => {
    fetch("https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/xampp/bd/obtenerUsuarios.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener usuarios");
        }
        return response.json();
      })
      .then((data) => setUsuarios(data))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleEdit = (usuario) => {
    // Crear una copia del usuario para editar y asegurarse de que tenga el campo contrasena
    const userToEdit = {
      ...usuario,
      contrasena: "" // Inicializar contrasena como campo vacío para evitar enviar la contraseña encriptada al servidor
    };
    setEditingUserId(usuario.id_usuario);
    setEditedUser(userToEdit);
  };

  const handleSave = () => {
    // Crear una copia del usuario editado para asegurarnos de que tiene el formato correcto
    const userToUpdate = { ...editedUser };
    
    fetch("https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/xampp/bd/actualizarUsuario.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userToUpdate),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Actualizar la lista de usuarios en el estado
          setUsuarios((prevUsuarios) =>
            prevUsuarios.map((usuario) =>
              usuario.id_usuario === editedUser.id_usuario
                ? editedUser
                : usuario
            )
          );
          setEditingUserId(null);
          setEditedUser({});
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Usuario actualizado correctamente",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al actualizar el usuario: " + (data.error || ""),
          });
        }
      })
      .catch(error => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al procesar la solicitud: " + error.message,
        });
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
        fetch("https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/xampp/bd/eliminarUsuario.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id_usuario: id }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              setUsuarios((prevUsuarios) =>
                prevUsuarios.filter((usuario) => usuario.id_usuario !== id)
              );
              Swal.fire({
                icon: "success",
                title: "Eliminado",
                text: "El usuario ha sido eliminado correctamente",
                timer: 2000,
                showConfirmButton: false,
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error al eliminar el usuario: " + (data.message || ""),
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
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!newUser.nombre_usuario || !newUser.correo_usuario || !newUser.contrasena) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "El nombre, correo y contraseña son obligatorios",
      });
      return;
    }

    fetch("https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/xampp/bd/agregarUsuario.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Agregar el nuevo usuario con el ID generado
          const usuarioConId = { ...newUser, id_usuario: data.id_usuario };
          setUsuarios((prevUsuarios) => [...prevUsuarios, usuarioConId]);
          
          // Resetear el formulario
          setNewUser({
            nombre_usuario: "",
            apellido_usuario: "",
            telefono_usuario: "",
            correo_usuario: "",
            direccion1_usuario: "",
            direccion2_usuario: "",
            ciudad_usuario: "",
            pais_usuario: "",
            contrasena: "",
            id_rol: ""
          });
          
          // Cerrar el formulario
          setShowAddForm(false);
          
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Usuario agregado correctamente",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al agregar el usuario: " + (data.message || ""),
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

  // Filtrar usuarios por búsqueda (nombre o correo)
  const filteredUsuarios = usuarios.filter((usuario) =>
    usuario.nombre_usuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.correo_usuario?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsuarios = filteredUsuarios.slice(
    indexOfFirstUser,
    indexOfLastUser
  );

  // Cambiar página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calcular el total de páginas
  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-grisOscuro">Usuarios</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-azulOscuroMate text-black px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <FaPlus /> {showAddForm ? "Cancelar" : "Agregar Usuario"}
        </button>
      </div>

      {/* Formulario para agregar usuario */}
      {showAddForm && (
        <div className="bg-white p-4 mb-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4 text-grisOscuro">
            Agregar Nuevo Usuario
          </h3>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre_usuario"
                value={newUser.nombre_usuario}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido
              </label>
              <input
                type="text"
                name="apellido_usuario"
                value={newUser.apellido_usuario}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                name="telefono_usuario"
                value={newUser.telefono_usuario}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo *
              </label>
              <input
                type="email"
                name="correo_usuario"
                value={newUser.correo_usuario}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección 1
              </label>
              <input
                type="text"
                name="direccion1_usuario"
                value={newUser.direccion1_usuario}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección 2
              </label>
              <input
                type="text"
                name="direccion2_usuario"
                value={newUser.direccion2_usuario}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad
              </label>
              <input
                type="text"
                name="ciudad_usuario"
                value={newUser.ciudad_usuario}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                País
              </label>
              <input
                type="text"
                name="pais_usuario"
                value={newUser.pais_usuario}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <input
                type="password"
                name="contrasena"
                value={newUser.contrasena}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <input
                type="number"
                name="id_rol"
                value={newUser.id_rol}
                onChange={handleAddFormChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
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
                Guardar Usuario
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar usuarios por nombre o correo..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 p-2 border border-gray-300 w-full rounded"
      />

      {/* Tabla de usuarios con responsive */}
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg table-responsive">
          <table className="w-full text-sm text-left bg-white">
            <thead className="bg-grisOscuro text-dark">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Nombre</th>
                <th className="py-3 px-4">Apellido</th>
                <th className="py-3 px-4">Teléfono</th>
                <th className="py-3 px-4">Correo</th>
                <th className="py-3 px-4">Dirección 1</th>
                <th className="py-3 px-4">Dirección 2</th>
                <th className="py-3 px-4">Ciudad</th>
                <th className="py-3 px-4">País</th>
                <th className="py-3 px-4">Contraseña</th>
                <th className="py-3 px-4">Rol</th>
                <th className="py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentUsuarios.length > 0 ? (
                currentUsuarios.map((usuario, index) => (
                  <tr
                    key={usuario.id_usuario}
                    className={index % 2 === 0 ? "bg-grisClaro" : "bg-white"}
                  >
                    <td className="py-3 px-4">{usuario.id_usuario}</td>
                    <td className="py-3 px-4">
                      {editingUserId === usuario.id_usuario ? (
                        <input
                          type="text"
                          name="nombre_usuario"
                          value={editedUser.nombre_usuario || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1 rounded"
                        />
                      ) : (
                        usuario.nombre_usuario
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingUserId === usuario.id_usuario ? (
                        <input
                          type="text"
                          name="apellido_usuario"
                          value={editedUser.apellido_usuario || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1 rounded"
                        />
                      ) : (
                        usuario.apellido_usuario
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingUserId === usuario.id_usuario ? (
                        <input
                          type="text"
                          name="telefono_usuario"
                          value={editedUser.telefono_usuario || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1 rounded"
                        />
                      ) : (
                        usuario.telefono_usuario
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingUserId === usuario.id_usuario ? (
                        <input
                          type="email"
                          name="correo_usuario"
                          value={editedUser.correo_usuario || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1 rounded"
                        />
                      ) : (
                        usuario.correo_usuario
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingUserId === usuario.id_usuario ? (
                        <input
                          type="text"
                          name="direccion1_usuario"
                          value={editedUser.direccion1_usuario || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1 rounded"
                        />
                      ) : (
                        usuario.direccion1_usuario
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingUserId === usuario.id_usuario ? (
                        <input
                          type="text"
                          name="direccion2_usuario"
                          value={editedUser.direccion2_usuario || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1 rounded"
                        />
                      ) : (
                        usuario.direccion2_usuario
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingUserId === usuario.id_usuario ? (
                        <input
                          type="text"
                          name="ciudad_usuario"
                          value={editedUser.ciudad_usuario || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1 rounded"
                        />
                      ) : (
                        usuario.ciudad_usuario
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingUserId === usuario.id_usuario ? (
                        <input
                          type="text"
                          name="pais_usuario"
                          value={editedUser.pais_usuario || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1 rounded"
                        />
                      ) : (
                        usuario.pais_usuario
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingUserId === usuario.id_usuario ? (
                        <input
                          type="password"
                          name="contrasena"
                          value={editedUser.contrasena || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1 rounded"
                          placeholder="Nueva contraseña"
                        />
                      ) : (
                        "••••••••"
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {editingUserId === usuario.id_usuario ? (
                        <input
                          type="number"
                          name="id_rol"
                          value={editedUser.id_rol || ""}
                          onChange={handleChange}
                          className="w-full border px-2 py-1 rounded"
                        />
                      ) : (
                        usuario.id_rol
                      )}
                    </td>
                    <td className="py-3 px-4 flex items-center space-x-2">
                      {editingUserId === usuario.id_usuario ? (
                        <button
                          onClick={handleSave}
                          className="text-azulOscuroMate hover:text-blue-500"
                        >
                          Guardar
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(usuario)}
                            className="text-azulOscuroMate hover:text-blue-500"
                            title="Editar"
                          >
                            <FaEdit size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(usuario.id_usuario)}
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
                    No se encontraron usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {filteredUsuarios.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 mx-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed rounded"
          >
            Anterior
          </button>
          <span className="flex items-center mx-2">
            Página {currentPage} de {totalPages || 1}
          </span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-4 py-2 mx-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed rounded"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}