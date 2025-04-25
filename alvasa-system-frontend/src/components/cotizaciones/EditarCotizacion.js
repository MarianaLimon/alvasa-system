import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import FormularioCotizacion from './FormularioCotizacion';

const EditarCotizacion = () => {
  const { id } = useParams();
  const [datosIniciales, setDatosIniciales] = useState(null);

  useEffect(() => {
    const obtenerCotizacion = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/cotizaciones/${id}`);
        setDatosIniciales(response.data);
      } catch (error) {
        console.error('Error al obtener cotización:', error);
      }
    };
    obtenerCotizacion();
  }, [id]);

  if (!datosIniciales) {
    return <div className="text-center mt-4">Cargando cotización...</div>;
  }

  return (
    <div className="container mt-4">
      <h2>Editar Cotización</h2>
      {/* Reutilizamos el formulario con los datos actuales de la cotización */}
      <FormularioCotizacion modoEdicion={true} datosIniciales={datosIniciales} />
    </div>
  );
};

export default EditarCotizacion;
