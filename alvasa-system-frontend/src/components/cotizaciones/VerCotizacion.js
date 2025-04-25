import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Spinner, Button, Row, Col, Accordion } from 'react-bootstrap';
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
        <Card.Title className="text-center mb-4">Cotización {cotizacion.folio}</Card.Title>

        <Row>
          {/* Columna izquierda - Información general */}
          <Col md={4}>
            <h5>Datos Generales</h5>
            <p><strong>Cliente:</strong> {cotizacion.cliente}</p>
            <p><strong>Empresa:</strong> {cotizacion.empresa}</p>
            <p><strong>Fecha:</strong> {cotizacion.fecha}</p>
            <p><strong>Mercancía:</strong> {cotizacion.mercancia}</p>
            <p><strong>Régimen:</strong> {cotizacion.regimen}</p>
            <p><strong>Aduana:</strong> {cotizacion.aduana}</p>
            <p><strong>Tipo de Envío:</strong> {cotizacion.tipo_envio}</p>
            <p><strong>Cantidad:</strong> {cotizacion.cantidad}</p>
            <p><strong>Estatus:</strong> {cotizacion.estatus}</p>

            <h5 className="mt-4">Resumen</h5>
            <p><strong>Propuesta:</strong> ${Number(cotizacion.propuesta || 0).toFixed(2)}</p>
            <p><strong>Total:</strong> ${Number(cotizacion.total || 0).toFixed(2)}</p>
            <p><strong>Ahorro:</strong> ${Number(cotizacion.ahorro || 0).toFixed(2)}</p>
            <p><strong>Fracción IGI:</strong> {cotizacion.fraccion_igi}</p>
            <p><strong>Monto Comisionista:</strong> ${Number(cotizacion.monto_comisionista || 0).toFixed(2)}</p>
            <p><strong>Notas:</strong> {cotizacion.notas}</p>
          </Col>

          {/* Columna derecha - Acordeones */}
          <Col md={8}>
            <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header>Flete Internacional</Accordion.Header>
                <Accordion.Body>
                  <p><strong>Origen - Destino:</strong> {cotizacion.flete_origen_destino}</p>
                  <p><strong>Concepto 1:</strong> {cotizacion.flete_concepto_1} - <strong>Valor:</strong> ${Number(cotizacion.flete_valor_1 || 0).toFixed(2)}</p>
                  <p><strong>Concepto 2:</strong> {cotizacion.flete_concepto_2} - <strong>Valor:</strong> ${Number(cotizacion.flete_valor_2 || 0).toFixed(2)}</p>
                  <p><strong>Concepto 3:</strong> {cotizacion.flete_concepto_3} - <strong>Valor:</strong> ${Number(cotizacion.flete_valor_3 || 0).toFixed(2)}</p>
                  <p><strong>Total Flete:</strong> ${Number(cotizacion.flete_total || 0).toFixed(2)}</p>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="1">
                <Accordion.Header>Cargos de Traslados</Accordion.Header>
                <Accordion.Body>
                  <p>Aquí se mostrarán los cargos de traslados.</p>
                  {/* Después llenamos los datos reales aquí */}
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="2">
                <Accordion.Header>Desglose de Impuestos</Accordion.Header>
                <Accordion.Body>
                  <p>Aquí se mostrará el desglose de impuestos.</p>
                  {/* Después llenamos los datos reales aquí */}
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="3">
                <Accordion.Header>Cargos Extra</Accordion.Header>
                <Accordion.Body>
                  <p>Aquí se mostrarán los cargos extra.</p>
                  {/* Después llenamos los datos reales aquí */}
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="4">
                <Accordion.Header>Servicios</Accordion.Header>
                <Accordion.Body>
                  <p>Aquí se mostrarán los servicios.</p>
                  {/* Después llenamos los datos reales aquí */}
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="5">
                <Accordion.Header>Cuenta de Gastos</Accordion.Header>
                <Accordion.Body>
                  <p>Aquí se mostrará la cuenta de gastos.</p>
                  {/* Después llenamos los datos reales aquí */}
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="6">
                <Accordion.Header>Pedimento</Accordion.Header>
                <Accordion.Body>
                  <p>Aquí se mostrarán los datos del pedimento.</p>
                  {/* Después llenamos los datos reales aquí */}
                </Accordion.Body>
  </Accordion.Item>
            </Accordion>
          </Col>
        </Row>

        {/* Botones abajo */}
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