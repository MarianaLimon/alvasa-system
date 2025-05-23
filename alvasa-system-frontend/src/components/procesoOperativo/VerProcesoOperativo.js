import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Spinner, Button, Row, Col, Accordion} from 'react-bootstrap';
import { BsArrowLeft, BsPrinter, BsPencil } from 'react-icons/bs';

const VerProcesoOperativo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proceso, setProceso] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProceso = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5050/procesos-operativos/${id}`);
        setProceso(data);
      } catch (error) {
        console.error('Error al obtener proceso operativo:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProceso();
  }, [id]);

  const formatoFecha = (fechaStr) => {
    if (!fechaStr) return '—';
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return '—';
    const dia = fecha.getUTCDate().toString().padStart(2, '0');
    const mes = fecha.getUTCMonth();
    const anio = fecha.getUTCFullYear();
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    return `${dia} ${meses[mes]} ${anio}`;
  };

  if (loading) return <div className="text-center mt-4"><Spinner animation="border" /></div>;
  if (!proceso) return <div className="text-center mt-4">Proceso no encontrado</div>;

  return (
    <Card className="detalle-card">
      <Card.Body>
        <Card.Title>
          <Row>
            <Col md={6}>
              <p className="detalle-title">Folio del proceso: {proceso.folio_proceso}</p>
            </Col>
          </Row>
        </Card.Title>

        <Row>
          <Col md={4}>
            <h5 className='detalle-title-datosgenerales'>Datos Generales</h5>
            <p><strong>Cliente:</strong> {proceso.cliente}</p>
            <p><strong>Documento PO:</strong> {proceso.doc_po}</p>
            <p><strong>Mercancía:</strong> {proceso.mercancia}</p>
            <p><strong>Fecha Alta:</strong> {formatoFecha(proceso.fecha_alta)}</p>
            <p><strong>Tipo de importación:</strong> {proceso.tipo_importacion}</p>

            <hr className='separador-horizontal'/>
            <h5 className="detalle-title-resumen">Booking</h5>
            <p><strong>ETD:</strong> {formatoFecha(proceso.etd)}</p>

            <hr className='separador-horizontal'/>
            <h5 className="detalle-title-resumen">Observaciones</h5>
            <p>{proceso.observaciones}</p>
          </Col>

          <Col md={8}>
            <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  <span>Información del Embarque</span>
                </Accordion.Header>
                <Accordion.Body>
                  <Row>
                    <Col md={4}>
                      <p><strong>HBL:</strong> {proceso.informacion_embarque?.hbl}</p>
                      <p><strong>No. Contenedor:</strong> {proceso.informacion_embarque?.no_contenedor}</p>
                      <p><strong>Shipper:</strong> {proceso.informacion_embarque?.shipper}</p>
                      <p><strong>ICOTERM:</strong> {proceso.informacion_embarque?.icoterm}</p>
                      <p><strong>Consignatario:</strong> {proceso.informacion_embarque?.consignatario}</p>
                    </Col>
                    <Col md={4}>
                      <p><strong>FORWARDE:</strong> {proceso.informacion_embarque?.forwarde}</p>
                      <p><strong>Tipo:</strong> {proceso.informacion_embarque?.tipo}</p>
                      <p><strong>Peso BL:</strong> {proceso.informacion_embarque?.peso_bl}</p>
                      <p><strong>Peso Real:</strong> {proceso.informacion_embarque?.peso_real}</p>
                      <p><strong>VESSEL:</strong> {proceso.informacion_embarque?.vessel}</p>
                    </Col>
                    <Col md={4}>
                      <p><strong>Naviera:</strong> {proceso.informacion_embarque?.naviera}</p>
                      <p><strong>POL:</strong> {proceso.informacion_embarque?.pol}</p>
                      <p><strong>País Origen:</strong> {proceso.informacion_embarque?.pais_origen}</p>
                      <p><strong>POD:</strong> {proceso.informacion_embarque?.pod}</p>
                      <p><strong>País Destino:</strong> {proceso.informacion_embarque?.pais_destino}</p>
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="1">
                <Accordion.Header>
                  <span>Proceso de Revalidación</span>
                </Accordion.Header>
                <Accordion.Body>
                  <p><strong>MBL:</strong> {proceso.proceso_revalidacion?.mbl}</p>
                  <p><strong>ETA:</strong> {formatoFecha(proceso.proceso_revalidacion?.eta)}</p>
                  <p><strong>Descarga:</strong> {formatoFecha(proceso.proceso_revalidacion?.descarga)}</p>
                  <p><strong>Terminal:</strong> {proceso.proceso_revalidacion?.terminal}</p>
                  <p><strong>Revalidación:</strong> {formatoFecha(proceso.proceso_revalidacion?.revalidacion)}</p>
                  <p><strong>Recepción/envío docs:</strong> {formatoFecha(proceso.proceso_revalidacion?.recepcion_envio_docs)}</p>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="2">
                <Accordion.Header>
                  <span>Datos de Pedimento</span>
                </Accordion.Header>
                <Accordion.Body>
                  <p><strong>Pedimento:</strong> {proceso.datos_pedimento?.pedimento}</p>
                  <p><strong>Pago Pedimento:</strong> {proceso.datos_pedimento?.pago_pedimento || '—'}</p>
                  <p><strong>Régimen:</strong> {proceso.datos_pedimento?.regimen}</p>
                  <p><strong>AA Despacho:</strong> {proceso.datos_pedimento?.aa_despacho}</p>
                  <p><strong>Agente Aduanal:</strong> {proceso.datos_pedimento?.agente_aduanal}</p>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="3">
                <Accordion.Header>
                  <span>Salida y Retorno del Contenedor</span>
                </Accordion.Header>
                <Accordion.Body>
                  <p><strong>Salida Aduana:</strong> {formatoFecha(proceso.salida_retorno_contenedor?.salida_aduana)}</p>
                  <p><strong>Entrega:</strong> {formatoFecha(proceso.salida_retorno_contenedor?.entrega)}</p>
                  <p><strong>Fecha Máx:</strong> {formatoFecha(proceso.salida_retorno_contenedor?.f_max)}</p>
                  <p><strong>Entrega Vacío:</strong> {formatoFecha(proceso.salida_retorno_contenedor?.entrega_vacio)}</p>
                  <p><strong>Condiciones Contenedor:</strong> {proceso.salida_retorno_contenedor?.condiciones_contenedor}</p>
                  <p><strong>Terminal Vacío:</strong> {proceso.salida_retorno_contenedor?.terminal_vacio}</p>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Col>
        </Row>

        <div className="d-flex justify-content-center gap-3 mt-4">
          <Button variant="secondary" onClick={() => navigate('/procesos-operativos')}>
            <BsArrowLeft className="me-2" /> Volver a la lista
          </Button>
          <Button variant="primary">
            <BsPrinter className="me-2" /> Imprimir
          </Button>
          <Button variant="warning" onClick={() => navigate(`/procesos-operativos/editar/${id}`)}>
            <BsPencil className="me-2" />
            Editar cotización
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default VerProcesoOperativo;