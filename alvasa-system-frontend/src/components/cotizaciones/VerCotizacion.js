import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Spinner, Button } from 'react-bootstrap';
import { BsArrowLeft, BsPencil } from 'react-icons/bs';

const VerCotizacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cotizacion, setCotizacion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerCotizacion = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/cotizaciones/${id}`);
        setCotizacion(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener la cotización:', error);
        setLoading(false);
      }
    };
    obtenerCotizacion();
  }, [id]);

  if (loading) return <div className="text-center mt-4"><Spinner animation="border" /></div>;
  if (!cotizacion) return <div className="text-center mt-4">No se encontró la cotización.</div>;

  return (
    <Card className="m-4">
      <Card.Body>
        <Card.Title>Cotización {cotizacion.folio}</Card.Title>
        <p><strong>Cliente:</strong> {cotizacion.cliente}</p>
        <p><strong>Empresa:</strong> {cotizacion.empresa}</p>
        <p><strong>Fecha:</strong> {cotizacion.fecha}</p>
        <p><strong>Mercancía:</strong> {cotizacion.mercancia}</p>
        <p><strong>Propuesta:</strong> ${Number(cotizacion.propuesta).toFixed(2)}</p>
        <p><strong>Total:</strong> ${Number(cotizacion.total).toFixed(2)}</p>
        <p><strong>Ahorro:</strong> ${Number(cotizacion.ahorro).toFixed(2)}</p>
        <p><strong>Estatus:</strong> {cotizacion.estatus}</p>
        <p><strong>Notas:</strong> {cotizacion.notas}</p>

        <div className="d-flex justify-content-center gap-3 mt-4">
          <Button variant="secondary" onClick={() => navigate('/cotizaciones')}>
            <BsArrowLeft className="me-2" />
            Volver a la lista
          </Button>
          <Button variant="warning" onClick={() => navigate(`/cotizaciones/editar/${id}`)}>
            <BsPencil className="me-2" />
            Editar cotización
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default VerCotizacion;