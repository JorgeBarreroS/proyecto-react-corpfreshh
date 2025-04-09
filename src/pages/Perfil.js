import React, { useState, useEffect } from "react";
import { useAuth } from "../services/AuthContext";
import { useNavigate } from "react-router-dom";

const Perfil = () => {
  const { authState, logout, updateEmail } = useAuth(); // Asumimos que existe una función updateEmail en AuthContext
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

    fetch("http://localhost/corpfresh-php/getUserData.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: authState.email }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Error al obtener datos del usuario");
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          setUserData(data.user);
          setFormData({
            nombre: data.user.nombre || "",
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
      .finally(() => {
        setLoading(false);
      });
  }, [authState]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const emailChanged = formData.correo !== originalEmail;
    
    fetch("http://localhost/corpfresh-php/updateUserData.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email: originalEmail, 
        newEmail: emailChanged ? formData.correo : null,
        ...formData 
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Datos actualizados correctamente");
          setEditMode(false);
          setUserData(prev => ({ ...prev, ...formData }));
          
          // Si el correo cambió, actualizar en el contexto de autenticación y redirigir
          if (emailChanged && updateEmail) {
            updateEmail(formData.correo);
            setOriginalEmail(formData.correo);
            alert("El correo electrónico ha sido actualizado. Para completar el proceso, se cerrará tu sesión.");
            setTimeout(() => {
              logout();
              navigate("/login");
            }, 2000);
          }
        } else {
          alert("Error al actualizar: " + data.message);
        }
      })
      .catch(err => {
        alert("Error en la solicitud");
        console.error(err);
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
                <button className="btn btn-danger" onClick={() => { logout(); navigate("/"); }}>Cerrar sesión</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;