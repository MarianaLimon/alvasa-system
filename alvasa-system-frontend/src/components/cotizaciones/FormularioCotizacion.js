import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { BsSave, BsPrinter } from 'react-icons/bs';
import FleteInternacional from './FleteInternacional';
import CargosTraslados from './CargosTraslados';
import DesgloseImpuestos from './DesgloseImpuestos';
import CargosExtra from './CargosExtra';
import Servicios from './Servicios';
import CuentaGastos from './CuentaGastos';
import Pedimento from './Pedimento';
import ResumenCotizacion from './ResumenCotizacion';
import { Accordion } from 'react-bootstrap';

const FormularioCotizacion = ({ onCotizacionGuardada }) => {
  const [form, setForm] = useState({
    folio: '',
    cliente_id: '',
    empresa: '',
    fecha: '',
    mercancia: '',
    regimen: '',
    aduana: '',
    tipoEnvio: '',
    cantidad: '',
    estatus: '',
  });

  const [clientes, setClientes] = useState([]);

  const [flete, setFlete] = useState({});
  const [cargos, setCargos] = useState({});
  const [impuestos, setImpuestos] = useState({});
  const [cargosExtra, setCargosExtra] = useState({});
  const [servicios, setServicios] = useState({});
  const [cuentaGastos, setCuentaGastos] = useState({});
  const [pedimento, setPedimento] = useState({});
  const [resumen, setResumen] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  const handleFleteChange = (datosFlete) => setFlete(datosFlete);
  const handleCargosChange = (datosCargos) => setCargos(datosCargos);
  const handleImpuestosChange = (datosImpuestos) => setImpuestos(datosImpuestos);
  const handleCargosExtraChange = (datosExtra) => setCargosExtra(datosExtra);
  const handleServiciosChange = (datosServicios) => setServicios(datosServicios);
  const handleCuentaGastosChange = (datos) => setCuentaGastos(datos);
  const handlePedimentoChange = (datos) => setPedimento(datos);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cotizacionCompleta = {
      ...form,
      flete,
      cargos,
      impuestos,
      cargosExtra,
      servicios,
      cuentaGastos,
      pedimento,
      ...resumen,
    };
    console.log('Cotización enviada:', cotizacionCompleta);
    if (onCotizacionGuardada) onCotizacionGuardada(cotizacionCompleta);
  };

  useEffect(() => {
    const obtenerClientes = async () => {
      try {
        const respuesta = await axios.get('http://localhost:5000/clientes'); // Ajusta la URL si es diferente
        setClientes(respuesta.data);
      } catch (error) {
        console.error('Error al obtener clientes:', error);
      }
    };
  
    obtenerClientes();
  }, []);

  return (
    <Card className="container-cotizaciones">
      <Card.Body>
        <Card.Title>Registrar Cotización</Card.Title>
        <Form onSubmit={handleSubmit}>
          <div className="d-flex justify-content-end mb-3">
            <div className="form-group" style={{ width: '200px' }}>
              <Form.Label>Folio</Form.Label>
              <Form.Control
                type="text"
                name="folio"
                value={form.folio}
                onChange={handleChange}
                placeholder="COT-0001"
              />
            </div>
          </div>

          <Row>
            <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Cliente</Form.Label>
              <Form.Select name="cliente_id" value={form.cliente_id} onChange={handleChange} required>
                <option value="">Seleccionar cliente...</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
              <Form.Group className="mb-3">
              <Form.Label>Empresa</Form.Label>
              <Form.Control type="text" name="empresa" value={form.empresa} onChange={handleChange} placeholder=""/>
            </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Fecha</Form.Label>
                <Form.Control type="date" name="fecha" value={form.fecha} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Mercancía</Form.Label>
                <Form.Control type="text" name="mercancia" value={form.mercancia} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={6}>
            <Form.Group className="mb-3">
                <Form.Label>Régimen</Form.Label>
                <Form.Select name="regimen" value={form.regimen} onChange={handleChange}>
                  <option value="">Seleccionar...</option>
                  <option value="A1">A1</option>
                  <option value="A4">A4</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Aduana</Form.Label>
                <Form.Select name="aduana" value={form.aduana} onChange={handleChange}>
                  <option value="">Seleccionar...</option>
                  <option value="AICM">AICM</option>
                  <option value="Manzanillo">Manzanillo</option>
                  <option value="Lazaro Cardenas">Lázaro Cárdenas</option>
                  <option value="Long Beach">Long Beach</option>
                  <option value="Progreso">Progreso</option>
                  <option value="San Diego">San Diego</option>
                  <option value="Veracruz">Veracruz</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Estatus</Form.Label>
                <Form.Select name="estatus" value={form.estatus} onChange={handleChange} required>
                  <option value="">Seleccionar...</option>
                  <option value="Autorizada">Autorizada</option>
                  <option value="En negociación">En negociación</option>
                  <option value="Entregado a cliente">Entregado a cliente</option>
                  <option value="Declinada">Declinada</option>
                </Form.Select>

                {form.estatus && (
                  <div className="mt-2">
                    <span
                      className={`badge px-4 py-2 fs-6 ${
                        form.estatus === 'Autorizada' ? 'bg-success' :
                        form.estatus === 'En negociación' ? 'bg-warning text-dark' :
                        form.estatus === 'Entregado a cliente' ? 'bg-info text-dark' :
                        form.estatus === 'Declinada' ? 'bg-danger' : ''
                      }`}
                    >
                      {form.estatus}
                    </span>
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          {/* Subformularios */}
          <Accordion defaultActiveKey="0" className="mt-4">
            <Accordion.Item eventKey="0">
              <Accordion.Header className="accordion-header-custom">Flete Internacional</Accordion.Header>
              <Accordion.Body>
                <FleteInternacional onFleteChange={handleFleteChange} />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>Cargos de Traslados</Accordion.Header>
              <Accordion.Body>
                <CargosTraslados onCargosChange={handleCargosChange} />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
              <Accordion.Header>Desglose de Impuestos</Accordion.Header>
              <Accordion.Body>
                <DesgloseImpuestos onImpuestosChange={handleImpuestosChange} />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="3">
              <Accordion.Header>Cargos Extra</Accordion.Header>
              <Accordion.Body>
                <CargosExtra onCargosExtraChange={handleCargosExtraChange} />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="4">
              <Accordion.Header>Servicios</Accordion.Header>
              <Accordion.Body>
                <Servicios onServiciosChange={handleServiciosChange} />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="5">
              <Accordion.Header>Cuenta de Gastos</Accordion.Header>
              <Accordion.Body>
                <CuentaGastos onCuentaChange={handleCuentaGastosChange} />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="6">
              <Accordion.Header>Pedimento</Accordion.Header>
              <Accordion.Body>
                <Pedimento onPedimentoChange={handlePedimentoChange} />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          <ResumenCotizacion
            datosTotales={{ flete, cargos, impuestos, cargosExtra, servicios, cuentaGastos, pedimento }}
            onResumenChange={setResumen}
          />

          <div className="d-flex justify-content-center gap-3 mt-4">
            <Button type="submit" variant="success">
              <BsSave className="me-2" />
              Guardar Cotización
            </Button>

            <Button variant="primary" onClick={() => window.print()}>
              <BsPrinter className="me-2" />
              Imprimir Cotización
            </Button>
          </div>


        </Form>
      </Card.Body>
    </Card>
  );
};

export default FormularioCotizacion;