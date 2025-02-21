// src/components/usuarios.jsx
import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({});

  useEffect(() => {
    fetch("http://localhost/ejercicio1/src/bd/obtenerUsuarios.php")
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
    fetch("http://localhost/ejercicio1/src/bd/actualizarUsuario.php", {
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

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="text-xl font-semibold text-grisOscuro mb-4">Usuarios</h2>
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
            {usuarios.map((usuario, index) => (
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
    </div>
  );
}
