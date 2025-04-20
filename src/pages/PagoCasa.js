import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/pagocasa.css'; 
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const PagoCasa = () => {
    const [formData, setFormData] = useState({
        direccion: '',
        telefono: '',
        horarioEntrega: '',
        nombreRecibe: '',
        apellidoRecibe: '',
        correo: '',
        ciudad: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Formulario enviado:', formData);

        Swal.fire({
            title: '¡Formulario enviado!',
            text: 'Gracias por tu información. Pronto nos pondremos en contacto.',
            icon: 'success',
            confirmButtonColor: '#27ae60',
        });
    };

    return (
        <div className="formulario-envio-container">
            <Navbar />
            <h1 className="titulo">Formulario de Envío</h1>
            <form onSubmit={handleSubmit} className="formulario-envio">
                <div className="form-group">
                    <div className="label-container"><label>Dirección:</label></div>
                    <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <div className="label-container"><label>Teléfono:</label></div>
                    <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <div className="label-container"><label>Horario de Entrega:</label></div>
                    <input type="time" name="horarioEntrega" value={formData.horarioEntrega} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <div className="label-container"><label>Nombre de quien recibe:</label></div>
                    <input type="text" name="nombreRecibe" value={formData.nombreRecibe} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <div className="label-container"><label>Apellido de quien recibe:</label></div>
                    <input type="text" name="apellidoRecibe" value={formData.apellidoRecibe} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <div className="label-container"><label>Correo:</label></div>
                    <input type="email" name="correo" value={formData.correo} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <div className="label-container"><label>Ciudad:</label></div>
                    <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} required />
                </div>
                <button type="submit">
                    <FontAwesomeIcon icon={faPaperPlane} style={{ marginRight: '8px' }} />
                    Enviar
                </button>
            </form>
        </div>
    );
};

export default PagoCasa;
