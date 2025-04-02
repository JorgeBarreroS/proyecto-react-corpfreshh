import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({});
  const [searchTerm, setSearchTerm] = useState(""); // Para la búsqueda
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [itemsPerPage, setItemsPerPage] = useState(10); // Elementos por página

  useEffect(() => {
    fetch("http://localhost/CorpFreshhXAMPP/bd/obtenerUsuarios.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener usuarios");
        }
        return response.json();
      })
      .then((data) => setUsuarios(data))
      .catch((err) => setError(err.message));
  }, []);

  const handleEdit = (usuario) => {
    setEditingUserId(usuario.t_id_usuario);
    setEditedUser(usuario);
  };

  const handleSave = () => {
    fetch("http://localhost/CorpFreshhXAMPP/bd/actualizarUsuario.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedUser),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setUsuarios((prevUsuarios) =>
            prevUsuarios.map((usuario) =>
              usuario.t_id_usuario === editedUser.t_id_usuario ? editedUser : usuario
            )
          );
          setEditingUserId(null);
          setEditedUser({});
        } else {
          alert("Error al actualizar el usuario");
        }
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtrar usuarios por búsqueda (correo)
  const filteredUsuarios = usuarios.filter((usuario) =>
    usuario.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsuarios = filteredUsuarios.slice(indexOfFirstUser, indexOfLastUser);

  // Cambiar página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calcular el total de páginas
  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="text-xl font-semibold text-grisOscuro mb-4">Usuarios</h2>
      <input
        type="text"
        placeholder="Buscar usuarios por correo..."
        value={searchTerm}
        onChange={handleSearch}
        className="mb-4 p-2 border border-gray-300"
      />
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <table className="min-w-full bg-white shadow-lg rounded-lg">
          <thead className="bg-grisOscuro text-dark">
            <tr>
              <th className="py-2 px-4 text-left">ID Usuario</th>
              <th className="py-2 px-4 text-left">Correo</th>
              <th className="py-2 px-4 text-left">Rol</th>
              <th className="py-2 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentUsuarios.map((usuario, index) => (
              <tr
                key={usuario.t_id_usuario}
                className={index % 2 === 0 ? "bg-grisClaro" : "bg-white"}
              >
                <td className="py-2 px-4">{usuario.t_id_usuario}</td>
                <td className="py-2 px-4">
                  {editingUserId === usuario.t_id_usuario ? (
                    <input
                      type="text"
                      name="correo"
                      value={editedUser.correo}
                      onChange={handleChange}
                      className="w-full border px-2 py-1"
                    />
                  ) : (
                    usuario.correo
                  )}
                </td>
                <td className="py-2 px-4">
                  {editingUserId === usuario.t_id_usuario ? (
                    <input
                      type="text"
                      name="rol"
                      value={editedUser.rol}
                      onChange={handleChange}
                      className="w-full border px-2 py-1"
                    />
                  ) : (
                    usuario.rol
                  )}
                </td>
                <td className="py-2 px-4 text-center">
                  {editingUserId === usuario.t_id_usuario ? (
                    <button
                      onClick={handleSave}
                      className="text-azulOscuroMate hover:text-blue-500"
                    >
                      Guardar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEdit(usuario)}
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

      {/* Paginación */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 mx-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400"
        >
          Anterior
        </button>
        <span className="flex items-center mx-2">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 mx-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
