import React, { useState } from 'react';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import FleteInternacional from './FleteInternacional';
import CargosTraslados from './CargosTraslados';
import DesgloseImpuestos from './DesgloseImpuestos';
import CargosExtra from './CargosExtra';
import Servicios from './Servicios';
import CuentaGastos from './CuentaGastos';
import Pedimento from './Pedimento';
import ResumenCotizacion from './ResumenCotizacion';


const FormularioCotizacion = ({ onCotizacionGuardada }) => {
  const [form, setForm] = useState({
    cliente: '',
    fecha: '',
    mercancia: '',
    regimen: 'A1',
    aduana: 'AICM',
    tipoEnvio: 'Palets',
    cantidad: '',
    estatus: 'Autorizada',
  });

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
  const handleFleteChange = (datosFlete) => {
    setFlete(datosFlete);
  };
  const handleCargosChange = (datosCargos) => {
    setCargos(datosCargos);
  };
  const handleImpuestosChange = (datosImpuestos) => {
    setImpuestos(datosImpuestos);
  };
  const handleCargosExtraChange = (datosExtra) => {
    setCargosExtra(datosExtra);
  };
  const handleServiciosChange = (datosServicios) => {
    setServicios(datosServicios);
  };
  const handleCuentaGastosChange = (datos) => {
    setCuentaGastos(datos);
  };
  const handlePedimentoChange = (datos) => {
    setPedimento(datos);
  };
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
  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Registrar Cotización</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Cliente</Form.Label>
                <Form.Control type="text" name="cliente" value={form.cliente} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Fecha</Form.Label>
                <Form.Control type="date" name="fecha" value={form.fecha} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Tipo de Mercancía</Form.Label>
                <Form.Control type="text" name="mercancia" value={form.mercancia} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Régimen</Form.Label>
                <Form.Select name="regimen" value={form.regimen} onChange={handleChange}>
                  <option value="A1">A1</option>
                  <option value="A4">A4</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Aduana</Form.Label>
                <Form.Select name="aduana" value={form.aduana} onChange={handleChange}>
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
                <Form.Label>Tipo de Envío</Form.Label>
                <Form.Select name="tipoEnvio" value={form.tipoEnvio} onChange={handleChange}>
                  <option value="Palets">Palets</option>
                  <option value="Cajas">Cajas</option>
                  <option value="Contenedor">Contenedor</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Cantidad de Producto</Form.Label>
                <Form.Control type="number" name="cantidad" value={form.cantidad} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Estatus</Form.Label>
                <Form.Select name="estatus" value={form.estatus} onChange={handleChange}>
                  <option value="Autorizada">Autorizada</option>
                  <option value="En negociación">En negociación</option>
                  <option value="Entregado a cliente">Entregado a cliente</option>
                  <option value="Declinada">Declinada</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          {/* Subformularios */}
          <div className="mt-4">
            <FleteInternacional onFleteChange={handleFleteChange} />
          </div>
          <div className="mt-4">
            <CargosTraslados onCargosChange={handleCargosChange} />
          </div>
          <div className="mt-4">
            <DesgloseImpuestos onImpuestosChange={handleImpuestosChange} />
          </div>
          <div className="mt-4">
            <CargosExtra onCargosExtraChange={handleCargosExtraChange} />
          </div>
          <div className="mt-4">
            <Servicios onServiciosChange={handleServiciosChange} />
          </div>
          <div className="mt-4">
            <CuentaGastos onCuentaChange={handleCuentaGastosChange} />
         </div>
         <div className="mt-4">
            <Pedimento onPedimentoChange={handlePedimentoChange} />
        </div>


        <ResumenCotizacion
            datosTotales={{ flete, cargos, impuestos, cargosExtra, servicios, cuentaGastos, pedimento }}
            onResumenChange={setResumen}
            />


          <div className="d-flex justify-content-center mt-4">
            <Button type="submit" variant="success">Guardar Cotización</Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};
export default FormularioCotizacion;