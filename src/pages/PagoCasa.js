import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar'; // Este es correcto
import Footer from '../components/Footer'; // Cambié el nombre a "Footer"
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/EnvioCasa.module.css'; // Asegúrate que esté renombrado

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

    useEffect(() => {
        document.body.style.backgroundColor = '#f9f9f9';
        return () => {
            document.body.style.backgroundColor = null;
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        Swal.fire({
            title: '¡Formulario enviado!',
            text: 'Gracias por tu información. Pronto nos pondremos en contacto.',
            icon: 'success',
            confirmButtonColor: '#27ae60',
        });
    };

    return (
        <>
            <Navbar /> 
            <div className={styles.envioCasaContainer}>
                <h1 className={styles.envioCasaTitulo}>Formulario de Envío</h1>
                <form onSubmit={handleSubmit} className={styles.envioCasaFormulario}>
                    {[{ label: 'Dirección', name: 'direccion', type: 'text' },
                      { label: 'Teléfono', name: 'telefono', type: 'tel' },
                      { label: 'Horario de Entrega', name: 'horarioEntrega', type: 'time' },
                      { label: 'Nombre de quien recibe', name: 'nombreRecibe', type: 'text' },
                      { label: 'Apellido de quien recibe', name: 'apellidoRecibe', type: 'text' },
                      { label: 'Correo', name: 'correo', type: 'email' },
                      { label: 'Ciudad', name: 'ciudad', type: 'text' }]
                      .map(({ label, name, type }) => (
                        <div className={styles.envioCasaGrupo} key={name}>
                            <div className={styles.envioCasaEtiqueta}>
                                <label htmlFor={name}>{label}:</label>
                            </div>
                            <input
                                type={type}
                                name={name}
                                value={formData[name]}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    ))}
                    <button type="submit" className={styles.envioCasaBoton}>
                        <FontAwesomeIcon icon={faPaperPlane} style={{ marginRight: '8px' }} />
                        Enviar
                    </button>
                </form>
            </div>
            <Footer /> {/* Asegúrate de que el componente Footer esté bien importado */}
        </>
    );
};

export default PagoCasa;
