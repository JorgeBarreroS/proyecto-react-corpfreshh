import React, { useState, useEffect } from "react";
import { useAuth } from "../services/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Perfil = () => {
  const { authState, logout, updateEmail } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    correo: "",
    direccion1: "",
    direccion2: "",
    ciudad: "",
    pais: ""
  });
  const [originalEmail, setOriginalEmail] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!authState || !authState.email) {
      setLoading(false);
      return;
    }

    setOriginalEmail(authState.email);

    // Si es un usuario de Google sin datos completos
    if (authState.isGoogleUser) {
      setUserData({
        correo: authState.email,
        nombre: authState.name || 'Usuario',
        apellido: 'Google',
        telefono: '',
        direccion1: '',
        direccion2: '',
        ciudad: '',
        pais: ''
      });
      setFormData({
        nombre: authState.name || 'Usuario',
        apellido: 'Google',
        telefono: '',
        correo: authState.email,
        direccion1: '',
        direccion2: '',
        ciudad: '',
        pais: ''
      });
      setLoading(false);
      return;
    }

    // Para usuarios normales
    fetch("https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/app/getUserData.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: authState.email }),
    })
      .then(response => {
        if (!response.ok) throw new Error("Error al obtener datos del usuario");
        return response.json();
      })
      .then(data => {
        if (data.success) {
          setUserData(data.user);
          setFormData({
            nombre: data.user.nombre || authState.name || "",
            apellido: data.user.apellido || "",
            telefono: data.user.telefono || "",
            correo: data.user.correo || authState.email,
            direccion1: data.user.direccion1 || "",
            direccion2: data.user.direccion2 || "",
            ciudad: data.user.ciudad || "",
            pais: data.user.pais || ""
          });
        } else {
          throw new Error(data.message || "Error al cargar datos");
        }
      })
      .catch(err => {
        console.error("Error:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [authState]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    Swal.fire({
      title: '¿Guardar cambios?',
      text: 'Estás a punto de actualizar tus datos.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const emailChanged = formData.correo !== originalEmail;

        fetch("https://corpfreshh-esetgjgec2c7grde.centralus-01.azurewebsites.net/api/app/updateUserData.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: originalEmail,
            newEmail: emailChanged ? formData.correo : null,
            isGoogleUser: authState.isGoogleUser || false,
            ...formData
          }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              Swal.fire('¡Actualizado!', 'Tus datos fueron actualizados.', 'success');
              setEditMode(false);
              setUserData(prev => ({ ...prev, ...formData }));

              if (emailChanged && updateEmail) {
                updateEmail(formData.correo);
                setOriginalEmail(formData.correo);

                Swal.fire({
                  icon: 'info',
                  title: 'Correo actualizado',
                  text: 'Se cerrará tu sesión para completar el proceso.',
                  timer: 3000,
                  showConfirmButton: false
                });

                setTimeout(() => {
                  logout();
                  navigate("/login");
                }, 3000);
              }
            } else {
              Swal.fire('Error', data.message || 'No se pudo actualizar.', 'error');
            }
          })
          .catch(() => {
            Swal.fire('Error', 'Error en la solicitud', 'error');
          });
      }
    });
  };

  const handleLogout = () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/login");
      }
    });
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!authState || !authState.email) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-warning">
          <h2>No hay usuario autenticado</h2>
          <p>Debes iniciar sesión para ver tu perfil</p>
          <button className="btn btn-primary" onClick={() => navigate("/login")}>
            Ir a Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header text-center">
              <h3>Perfil de Usuario</h3>
            </div>
            <div className="card-body text-center">
              <div className="mb-4">
                {authState.avatar ? (
                  <img
                    src={authState.avatar}
                    alt="Perfil"
                    className="rounded-circle img-thumbnail"
                    style={{ width: "150px", height: "150px" }}
                  />
                ) : (
                  <div
                    className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                    style={{
                      width: "150px",
                      height: "150px",
                      backgroundColor: "#007bff",
                      color: "white",
                      fontSize: "48px"
                    }}
                  >
                    {userData?.nombre ? userData.nombre.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              {userData && (
                <div className="user-details mt-4 text-start">
                  <h5>Datos Personales</h5>
                  {editMode ? (
                    <>
                      <div className="mb-3">
                        <label>Correo electrónico:</label>
                        <input type="email" name="correo" className="form-control" value={formData.correo} onChange={handleChange} />
                        {formData.correo !== originalEmail && (
                          <small className="text-warning">
                            ⚠️ Cambiar tu correo requerirá que inicies sesión nuevamente
                          </small>
                        )}
                      </div>
                      <div className="mb-3">
                        <label>Nombre:</label>
                        <input type="text" name="nombre" className="form-control" value={formData.nombre} onChange={handleChange} />
                      </div>
                      <div className="mb-3">
                        <label>Apellido:</label>
                        <input type="text" name="apellido" className="form-control" value={formData.apellido} onChange={handleChange} />
                      </div>
                      <div className="mb-3">
                        <label>Teléfono:</label>
                        <input type="text" name="telefono" className="form-control" value={formData.telefono} onChange={handleChange} />
                      </div>
                      <div className="mb-3">
                        <label>Dirección Principal:</label>
                        <input type="text" name="direccion1" className="form-control" value={formData.direccion1} onChange={handleChange} />
                      </div>
                      <div className="mb-3">
                        <label>Dirección Secundaria:</label>
                        <input type="text" name="direccion2" className="form-control" value={formData.direccion2} onChange={handleChange} />
                      </div>
                      <div className="mb-3">
                        <label>Ciudad:</label>
                        <input type="text" name="ciudad" className="form-control" value={formData.ciudad} onChange={handleChange} />
                      </div>
                      <div className="mb-3">
                        <label>País:</label>
                        <input type="text" name="pais" className="form-control" value={formData.pais} onChange={handleChange} />
                      </div>
                      <button className="btn btn-success me-2" onClick={handleSave}>Guardar</button>
                      <button className="btn btn-secondary" onClick={() => setEditMode(false)}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <table className="table">
                        <tbody>
                          <tr><th>Correo:</th><td>{userData.correo}</td></tr>
                          <tr><th>Nombre:</th><td>{userData.nombre}</td></tr>
                          <tr><th>Apellido:</th><td>{userData.apellido}</td></tr>
                          <tr><th>Teléfono:</th><td>{userData.telefono}</td></tr>
                          <tr><th>Dirección Principal:</th><td>{userData.direccion1}</td></tr>
                          <tr><th>Dirección Secundaria:</th><td>{userData.direccion2}</td></tr>
                          <tr><th>Ciudad:</th><td>{userData.ciudad}</td></tr>
                          <tr><th>País:</th><td>{userData.pais}</td></tr>
                        </tbody>
                      </table>
                      <button className="btn btn-warning" onClick={() => setEditMode(true)}>Editar Información</button>
                    </>
                  )}
                </div>
              )}

              <div className="mt-4">
                <button className="btn btn-primary me-2" onClick={() => navigate("/")}>Ir al Inicio</button>
                <button className="btn btn-danger" onClick={handleLogout}>Cerrar sesión</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;