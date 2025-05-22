import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Accordion } from 'react-bootstrap';
import { BsSave, BsListUl } from 'react-icons/bs';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import InformacionEmbarque from './InformacionEmbarque';
import ProcesoRevalidacion from './ProcesoRevalidacion';
import DatosPedimento from './DatosPedimento';
import ContenedorSalidaRetorno from './ContenedorSalidaRetorno';
import { useCargaInicialProceso } from '../../hooks/useCargaInicialProceso';

// Utilidad para fecha local
const getFechaHoyLocal = () => {
  const hoy = new Date();
  hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
  return hoy.toISOString().split('T')[0];
};

const FormularioProcesoOperativo = ({ modo = 'crear', datosIniciales = {}, onSubmit }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [clientes, setClientes] = useState([]);
  const [embarque, setEmbarque] = useState({});
  const [revalidacion, setRevalidacion] = useState({});
  const [datosPedimento, setDatosPedimento] = useState({});
  const [salidaContenedor, setSalidaContenedor] = useState({});

  const [form, setForm] = useState({
    folioProceso: '',
    clienteId: '',
    docPO: '',
    mercancia: '',
    fechaAlta: getFechaHoyLocal(),
    tipoImportacion: '',
    etd: '',
    cotizacionId: '',
    observaciones: '',
  });

  // Hook personalizado para cargar clientes y folio o datos en modo edición
  useCargaInicialProceso({ modo, id, setForm, setClientes });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: typeof value === 'string' ? value.toUpperCase() : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const datosCompletos = {
      ...form,
      informacionEmbarque: embarque,
      procesoRevalidacion: revalidacion,
      datosPedimento: datosPedimento,
      salidaRetornoContenedor: salidaContenedor
    };

    if (onSubmit) {
      onSubmit(datosCompletos);
    } else {
      axios.post('http://localhost:5050/procesos-operativos', datosCompletos)
        .then((res) => {
          if (res.status === 201) {
            toast.success('Proceso operativo guardado correctamente ✅');
          } else if (res.status === 207) {
            toast.warning('Guardado parcial: hubo errores en subformularios ⚠️');
          }
          setTimeout(() => navigate('/procesos-operativos'), 1000);
        })
        .catch(err => {
          console.error('Error al guardar:', err);
          toast.error('Error al guardar el proceso operativo ❌');
        });
    }
  };

  return (
    <Card className="container-cotizaciones">
      <Card.Body>
        {/* Título y folio */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="title-reg-po">
            {modo === 'crear' ? 'Registrar Proceso Operativo' : `Editar Proceso: ${form.folioProceso}`}
          </Card.Title>
          <div style={{ width: '200px' }}>
            <Form.Label>Folio</Form.Label>
            <Form.Control
              type="text"
              name="folioProceso"
              value={form.folioProceso}
              readOnly
              disabled
              className="text-uppercase"
            />
          </div>
        </div>

        {/* Formulario principal */}
        <Form onSubmit={handleSubmit}>
          <h5 className="mb-3 title-section">Datos Generales</h5>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Cliente</Form.Label>
                <Form.Select
                  name="clienteId"
                  value={form.clienteId}
                  onChange={handleChange}
                  className="text-uppercase"
                  required
                >
                  <option value="">Seleccionar cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre.toUpperCase()}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Doc. PO</Form.Label>
                <Form.Control
                  type="text"
                  name="docPO"
                  value={form.docPO}
                  onChange={handleChange}
                  className="text-uppercase"
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Mercancía</Form.Label>
                <Form.Control
                  type="text"
                  name="mercancia"
                  value={form.mercancia}
                  onChange={handleChange}
                  className="text-uppercase"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Fecha de Alta</Form.Label>
                <Form.Control
                  type="date"
                  name="fechaAlta"
                  value={form.fechaAlta}
                  onChange={handleChange}
                  className="text-uppercase"
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Tipo de Importación</Form.Label>
                <Form.Select
                  name="tipoImportacion"
                  value={form.tipoImportacion}
                  onChange={handleChange}
                  className="text-uppercase"
                >
                  <option value="">Seleccionar</option>
                  <option value="MARITIMO">Marítimo</option>
                  <option value="TERRESTRE">Terrestre</option>
                  <option value="AEREO">Aéreo</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <h5 className="mb-3 title-section">Booking</h5>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>ETD</Form.Label>
                <Form.Control
                  type="date"
                  name="etd"
                  value={form.etd}
                  onChange={handleChange}
                  className="text-uppercase"
                />
              </Form.Group>
            </Col>
          </Row>

          <Accordion defaultActiveKey="0" className="mb-3 text-uppercase">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Información general del embarque</Accordion.Header>
              <Accordion.Body>
                <InformacionEmbarque onChange={setEmbarque} datos={embarque} />
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="1">
              <Accordion.Header>Proceso de revalidación</Accordion.Header>
              <Accordion.Body>
                <ProcesoRevalidacion onChange={setRevalidacion} datos={revalidacion} />
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="2">
              <Accordion.Header>Datos de pedimento</Accordion.Header>
              <Accordion.Body>
                <DatosPedimento onChange={setDatosPedimento} datos={datosPedimento} />
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="3">
              <Accordion.Header>Salida y retorno del contenedor</Accordion.Header>
              <Accordion.Body>
                <ContenedorSalidaRetorno onChange={setSalidaContenedor} datos={salidaContenedor} />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          <Form.Group className="mb-3">
            <Form.Label>Observaciones</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
              className="text-uppercase"
            />
          </Form.Group>

          <div className="d-flex justify-content-center gap-3 mt-4">
            <Button type="submit" variant="success">
              <BsSave className="me-2" />
              {modo === 'crear' ? 'Guardar Proceso' : 'Actualizar Proceso'}
            </Button>

            <Button variant="warning" onClick={() => navigate('/procesos-operativos')}>
              <BsListUl className="me-2" />
              Ver todos los procesos
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FormularioProcesoOperativo;