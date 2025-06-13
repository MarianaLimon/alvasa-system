import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spinner, Button, Row, Col, Accordion, Table } from 'react-bootstrap';
import { BsArrowLeft, BsPrinter, BsPencil, BsEye } from 'react-icons/bs';
import axios from 'axios';

const VerAsignacionCostos = () => {
  const { folio } = useParams();
  const navigate = useNavigate();
  const [asignacion, setAsignacion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAsignacion = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5050/asignacion-costos/completo/${folio}`);
        setAsignacion(data);
      } catch (error) {
        console.error('Error al obtener asignación:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAsignacion();
  }, [folio]);

  const formatoMoneda = (valor) => {
    if (!valor) return '—';
    return `$${parseFloat(valor).toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) return <div className="text-center mt-4"><Spinner animation="border" /></div>;
  if (!asignacion) return <div className="text-center mt-4">Asignación no encontrada</div>;

  const manejarImprimir = () => {
    const url = `http://localhost:5050/asignacion-costos/pdf/${asignacion.id}`;
    window.open(url, '_blank');
  };

  return (
    <Card className="detalle-card">
      <Card.Body>
        <Card.Title>
          <Row>
            <Col md={6}>
              <p className="detalle-title">Folio de Proceso Operativo: {asignacion.folio_proceso}</p>
            </Col>
          </Row>
        </Card.Title>

        <Row>
          <Col md={4}>
            <h5 className="detalle-title-datosgenerales">Datos Generales</h5>
                <p><strong>Cliente:</strong> {asignacion.nombre_cliente}</p>
                <p><strong>Ejecutivo de Cuenta:</strong> {asignacion.ejecutivo_cuenta}</p>
                <p><strong>Mercancia:</strong> {asignacion.mercancia}</p>
                <p><strong>No. Contenedor:</strong> {asignacion.no_contenedor}</p>
                <p><strong>Tipo de Carga:</strong> {asignacion.tipo_carga}</p>
                <p><strong>Salida Aduana:</strong> {asignacion.salida_aduana}</p>
          </Col>

          <Col md={8}>
            <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header>AA Despacho</Accordion.Header>
                <Accordion.Body>
                    <p><strong>Nom. Proveedor:</strong> {asignacion.aa_despacho?.aa_despacho}</p>
                    <p><strong>AA Despacho:</strong> {asignacion.aa_despacho?.aa_despacho}</p>
                    <p><strong>Importación - Costo:</strong> {formatoMoneda(asignacion.aa_despacho?.importacion_costo)}</p>
                    <p><strong>Importación - Venta:</strong> {formatoMoneda(asignacion.aa_despacho?.importacion_venta)}</p>
                    <p><strong>Almacenajes - Costo:</strong> {formatoMoneda(asignacion.aa_despacho?.almacenajes_costo)}</p>
                    <p><strong>Almacenajes - Venta:</strong> {formatoMoneda(asignacion.aa_despacho?.almacenajes_venta)}</p>
                    <p><strong>Servicio - Costo:</strong> {formatoMoneda(asignacion.aa_despacho?.servicio_costo)}</p>
                    <p><strong>Servicio - Venta:</strong> {formatoMoneda(asignacion.aa_despacho?.servicio_venta)}</p>
                    <p><strong>Servicio 1:</strong> {asignacion.aa_despacho?.tipo_servicio1}</p>
                    <p><strong>Costo:</strong> {formatoMoneda(asignacion.aa_despacho?.costo_servicio1)}</p>
                    <p><strong>Venta:</strong> {formatoMoneda(asignacion.aa_despacho?.venta_servicio1)}</p>
                    <p><strong>Servicio 2:</strong> {asignacion.aa_despacho?.tipo_servicio2}</p>
                    <p><strong>Costo:</strong> {formatoMoneda(asignacion.aa_despacho?.costo_servicio2)}</p>
                    <p><strong>Venta:</strong> {formatoMoneda(asignacion.aa_despacho?.venta_servicio2)}</p>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="1">
                <Accordion.Header>Forwarder</Accordion.Header>
                <Accordion.Body>
                    <p><strong>Forwarder:</strong> {asignacion.forwarder?.forwarder}</p>
                    <p><strong>Asignado por:</strong> {asignacion.forwarder?.asignado_por}</p>
                    <p><strong>Consignatario:</strong> {asignacion.forwarder?.consignatario}</p>
                    <p><strong>Naviera:</strong> {asignacion.forwarder?.naviera}</p>
                    <p><strong>Flete Internacional - Costo:</strong> {formatoMoneda(asignacion.forwarder?.flete_internacional_costo)}</p>
                    <p><strong>Flete Internacional - Venta:</strong> {formatoMoneda(asignacion.forwarder?.flete_internacional_venta)}</p>
                    <p><strong>Cargos Locales - Costo:</strong> {formatoMoneda(asignacion.forwarder?.cargos_locales_costo)}</p>
                    <p><strong>Cargos Locales - Venta:</strong> {formatoMoneda(asignacion.forwarder?.cargos_locales_venta)}</p>
                    <p><strong>Demoras - Costo:</strong> {formatoMoneda(asignacion.forwarder?.demoras_costo)}</p>
                    <p><strong>Demoras - Venta:</strong> {formatoMoneda(asignacion.forwarder?.demoras_venta)}</p>
                    <p><strong>Abonado:</strong> {formatoMoneda(asignacion.forwarder?.abonado)}</p>
                    <p><strong>Fecha Abono:</strong> {asignacion.forwarder?.fecha_abon?.split('T')[0]}</p>
                    <p><strong>Reembolsado:</strong> {formatoMoneda(asignacion.forwarder?.rembolsado)}</p>
                    <p><strong>Fecha Reembolso:</strong> {asignacion.forwarder?.fecha_remb?.split('T')[0]}</p>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="2">
                <Accordion.Header>Flete Terrestre</Accordion.Header>
                <Accordion.Body>
                    <p><strong>Proveedor:</strong> {asignacion.flete_terrestre?.proveedor}</p>
                    <p><strong>Flete:</strong> {formatoMoneda(asignacion.flete_terrestre?.flete)}</p>
                    <p><strong>Flete Venta:</strong> {formatoMoneda(asignacion.flete_terrestre?.flete_venta)}</p>
                    <p><strong>Estadía:</strong> {formatoMoneda(asignacion.flete_terrestre?.estadia)}</p>
                    <p><strong>Estadía Venta:</strong> {formatoMoneda(asignacion.flete_terrestre?.estadia_venta)}</p>
                    <p><strong>Burreo:</strong> {formatoMoneda(asignacion.flete_terrestre?.burreo)}</p>
                    <p><strong>Burreo Venta:</strong> {formatoMoneda(asignacion.flete_terrestre?.burreo_venta)}</p>
                    <p><strong>Sobrepeso:</strong> {formatoMoneda(asignacion.flete_terrestre?.sobrepeso)}</p>
                    <p><strong>Sobrepeso Venta:</strong> {formatoMoneda(asignacion.flete_terrestre?.sobrepeso_venta)}</p>
                    <p><strong>Apoyo:</strong> {formatoMoneda(asignacion.flete_terrestre?.apoyo)}</p>
                    <p><strong>Apoyo Venta:</strong> {formatoMoneda(asignacion.flete_terrestre?.apoyo_venta)}</p>
                    <p><strong>Pernocta:</strong> {formatoMoneda(asignacion.flete_terrestre?.pernocta)}</p>
                    <p><strong>Pernocta Venta:</strong> {formatoMoneda(asignacion.flete_terrestre?.pernocta_venta)}</p>

                    {asignacion.flete_terrestre?.extras?.length > 0 && (
                    <>
                        <h6>Extras:</h6>
                        {asignacion.flete_terrestre.extras.map((extra, idx) => (
                        <p key={idx}>
                            <strong>{extra.concepto}</strong>: {formatoMoneda(extra.costo)} / {formatoMoneda(extra.venta)}
                        </p>
                        ))}
                    </>
                    )}
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="3">
                <Accordion.Header>Custodia</Accordion.Header>
                <Accordion.Body>
                    <p><strong>Proveedor:</strong> {asignacion.custodia?.custodia_proveedor}</p>
                    <p><strong>Costo:</strong> {formatoMoneda(asignacion.custodia?.custodia_costo)}</p>
                    <p><strong>Venta:</strong> {formatoMoneda(asignacion.custodia?.custodia_venta)}</p>
                    <p><strong>Pernocta - Costo:</strong> {formatoMoneda(asignacion.custodia?.custodia_pernocta_costo)}</p>
                    <p><strong>Pernocta - Venta:</strong> {formatoMoneda(asignacion.custodia?.custodia_pernocta_venta)}</p>
                    <p><strong>Falso - Costo:</strong> {formatoMoneda(asignacion.custodia?.custodia_falso_costo)}</p>
                    <p><strong>Falso - Venta:</strong> {formatoMoneda(asignacion.custodia?.custodia_falso_venta)}</p>
                    <p><strong>Cancelación - Costo:</strong> {formatoMoneda(asignacion.custodia?.custodia_cancelacion_costo)}</p>
                    <p><strong>Cancelación - Venta:</strong> {formatoMoneda(asignacion.custodia?.custodia_cancelacion_venta)}</p>
                    <p><strong>Días - Costo:</strong> {asignacion.custodia?.custodia_dias_costo}</p>
                    <p><strong>Días - Venta:</strong> {asignacion.custodia?.custodia_dias_venta}</p>
                    <p><strong>Almacenaje - Costo:</strong> {formatoMoneda(asignacion.custodia?.custodia_costo_almacenaje)}</p>
                    <p><strong>Almacenaje - Venta:</strong> {formatoMoneda(asignacion.custodia?.custodia_venta_almacenaje)}</p>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="4">
                <Accordion.Header>Paquetería</Accordion.Header>
                <Accordion.Body>
                    <p><strong>Empresa:</strong> {asignacion.paqueteria?.empresa}</p>
                    <p><strong>Costo:</strong> {formatoMoneda(asignacion.paqueteria?.costo)}</p>
                    <p><strong>Venta:</strong> {formatoMoneda(asignacion.paqueteria?.venta)}</p>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="5">
                <Accordion.Header>Aseguradora</Accordion.Header>
                <Accordion.Body>
                    <p><strong>Aseguradora:</strong> {asignacion.aseguradora?.aseguradora}</p>
                    <p><strong>Valor Mercancía:</strong> {formatoMoneda(asignacion.aseguradora?.valor_mercancia)}</p>
                    <p><strong>Costo:</strong> {formatoMoneda(asignacion.aseguradora?.costo)}</p>
                    <p><strong>Venta:</strong> {formatoMoneda(asignacion.aseguradora?.venta)}</p>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Col>
        </Row>
        
        <div className="d-flex flex-column align-items-center gap-2 mt-4">
            <div className="d-flex gap-3">
                <Button variant="primary" onClick={manejarImprimir}>
                    <BsPrinter className="me-2" /> Imprimir
                </Button>
                <Button variant="warning" onClick={() => navigate(`/asignacion-costos/editar/${folio}`)}>
                    <BsPencil className="me-2" /> Editar asignación de costos
                </Button>
                <Button variant="info" onClick={() => navigate(`/procesos-operativos/ver/${folio}`)}>
                    <BsEye className="me-2" /> Ver proceso operativo
                </Button>
            </div>

            <div>
                <Button variant="secondary" className="mt-2" onClick={() => navigate('/asignacion-costos')}>
                <BsArrowLeft className="me-2" /> Volver a la lista
                </Button>
            </div>
        </div>

      </Card.Body>
    </Card>
  );
};

export default VerAsignacionCostos;

