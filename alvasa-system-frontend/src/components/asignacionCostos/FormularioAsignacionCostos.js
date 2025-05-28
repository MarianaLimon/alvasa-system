// src/components/asignacionCostos/FormularioAsignacionCostos.js
import React, { useState} from 'react';
import {
  Card, Form, Row, Col, Button, Accordion
} from 'react-bootstrap';
import { BsSave, BsListUl } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SeleccionarProcesoModal from './SeleccionarProcesoModal';

import AADespacho from './AADespacho';
import Forwarder from './Forwarder';
import FleteTerrestre from './FleteTerrestre';
import Custodia from './Custodia';
import Paqueteria from './Paqueteria';
import Aseguradora from './Aseguradora';

const FormularioAsignacionCostos = () => {
  const navigate = useNavigate();
  const [mostrarModal, setMostrarModal] = useState(true);
  const [form, setForm] = useState({
    // Datos generales
    folioProceso: '', cliente: '', ejecutivoCuenta: '', noContenedor: '', mercancia: '', tipoCarga: '', 
    salidaAduana: '', aaDespacho: '', forwarder: '', consignatario: '', naviera: '', valorMercancia: '',

    // AA Despacho
    importacionCosto: '', importacionVenta: '', almacenajesCosto: '', almacenajesVenta: '', servicioCosto: '',
    servicioVenta: '', tipoServicio1: '', costoServicio1: '', ventaServicio1: '', tipoServicio2: '',
    costoServicio2: '', ventaServicio2: '',

    // Forwarder
    asignadoPor: '', fleteInternacionalCosto: '', fleteInternacionalVenta: '', cargosLocalesCosto: '', cargosLocalesVenta: '',
    demorasCosto: '', demorasVenta: '', abonado: '', fechaAbon: '', rembolsado: '', fechaRemb: '',

    // Custodia
    nombreProveedor: '', custodiaCosto: '', custodiaVenta: '', pernoctaCosto: '', pernoctaVenta: '', falsoCosto: '',
    falsoVenta: '', cancelacionCosto: '', cancelacionVenta: '', diasCosto: '', diasVenta: '',

    // Paqueteria 
    empresa: '', costo: '', venta: '',

    // Aseguradora
    aseguradora: '', costoAseguradora: '', ventaAseguradora: '',

    // Flete Terrestre 
    proveedor: '',

    flete: '', fleteVenta: '',
    estadia: '', estadiaVenta: '',
    burreo: '', burreoVenta: '',
    sobrepeso: '', sobrepesoVenta: '',
    apoyo: '', apoyoVenta: '',
    pernoctaFlete: '', pernoctaFleteVenta: '',

    extra1: '', extra1Costo: '', extra1Venta: '',
    extra2: '', extra2Costo: '', extra2Venta: '',
    extra3: '', extra3Costo: '', extra3Venta: ''
  });

  const cargarProcesoPorId = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5050/procesos-operativos/${id}`);
      const proceso = res.data;

      setForm({
        folioProceso: proceso.folio_proceso || '',
        cliente: proceso.cliente || '',
        ejecutivoCuenta: proceso.ejecutivo_cuenta || '',
        noContenedor: proceso.informacion_embarque?.no_contenedor || '',
        mercancia: proceso.mercancia || '',
        tipoCarga: proceso.tipo_carga || '',
        salidaAduana: proceso.salida_retorno_contenedor?.salida_aduana || '',
        aaDespacho: proceso.datos_pedimento?.aa_despacho || '',
        forwarder: proceso.informacion_embarque?.forwarde || '',
        consignatario: proceso.informacion_embarque?.consignatario || '',
        naviera: proceso.informacion_embarque?.naviera || '',
        valorMercancia: proceso.valor_mercancia || ''
      });

      setMostrarModal(false);
    } catch (error) {
      console.error('Error al cargar el proceso por ID:', error);
    }
  };

    return (
    <>
      <SeleccionarProcesoModal
        mostrar={mostrarModal}
        onSeleccionar={cargarProcesoPorId}
      />

      {!mostrarModal && (
        <Card className="container-cotizaciones">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Card.Title className="title-reg-po">Asignación de Costos</Card.Title>
              <div style={{ width: '200px' }}>
                <Form.Label>Folio Proceso</Form.Label>
                <Form.Control type="text" value={form.folioProceso} disabled />
              </div>
            </div>

            <h5 className="mb-3 title-section">Datos Generales del Proceso</h5>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Cliente</Form.Label>
                  <Form.Control type="text" value={form.cliente} disabled className="text-uppercase" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Ejecutivo de Cuenta</Form.Label>
                  <Form.Control type="text" value={form.ejecutivoCuenta} disabled className="text-uppercase" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Mercancía</Form.Label>
                  <Form.Control type="text" value={form.mercancia} disabled className="text-uppercase" />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-5">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>No. Contenedor</Form.Label>
                  <Form.Control type="text" value={form.noContenedor} disabled className="text-uppercase" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Tipo de Carga</Form.Label>
                  <Form.Control type="text" value={form.tipoCarga} disabled className="text-uppercase" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Salida de Aduana</Form.Label>
                  <Form.Control type="text" value={form.salidaAduana} disabled className="text-uppercase" />
                </Form.Group>
              </Col>
            </Row>

            <Accordion defaultActiveKey="0" className="mb-4 text-uppercase">
              <Accordion.Item eventKey="0">
                <Accordion.Header>AA Despacho</Accordion.Header>
                <Accordion.Body>
                  <AADespacho datos={{ aaDespacho: form.aaDespacho }} onChange={(datos) => setForm(prev => ({ ...prev, ...datos }))} />
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>Forwarder</Accordion.Header>
                <Accordion.Body>
                    <Forwarder datos={{ forwarder: form.forwarder, asignadoPor: form.asignadoPor, consignatario: form.consignatario, naviera: form.naviera, fleteInternacionalCosto: form.fleteInternacionalCosto, fleteInternacionalVenta: form.fleteInternacionalVenta, cargosLocalesCosto: form.cargosLocalesCosto, cargosLocalesVenta: form.cargosLocalesVenta, demorasCosto: form.demorasCosto, demorasVenta: form.demorasVenta
                      }}onChange={(datos) => setForm(prev => ({ ...prev, ...datos }))}
                    />
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="2">
                <Accordion.Header>Flete Terrestre</Accordion.Header>
                <Accordion.Body>
                   <FleteTerrestre datos={form} onChange={(datos) => setForm(prev => ({ ...prev, ...datos }))} />
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="3">
                <Accordion.Header>Custodia</Accordion.Header>
                <Accordion.Body>
                   <Custodia datos={form}onChange={(datos) => setForm(prev => ({ ...prev, ...datos }))}/>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="4">
                <Accordion.Header>Empresa Paquetería</Accordion.Header>
                <Accordion.Body>
                  <Paqueteria datos={{ empresa: form.empresa, costo: form.costo, venta: form.venta }}
                    onChange={(datos) => setForm(prev => ({ ...prev, ...datos }))}
                  />
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="5">
                <Accordion.Header>Aseguradora</Accordion.Header>
                <Accordion.Body>
                  <Aseguradora  datos={{ aseguradora: form.aseguradora, valorMercancia: form.valorMercancia, costo: form.costoAseguradora, venta: form.ventaAseguradora }}
                    onChange={(datos) => setForm(prev => ({ ...prev, ...datos }))}
                  />
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>

            <div className="d-flex justify-content-center gap-3">
              <Button type="submit" variant="success" disabled>
                <BsSave className="me-2" />
                Guardar Asignación de Costos
              </Button>

              <Button variant="warning" onClick={() => navigate('/')}>
                <BsListUl className="me-2" />
                Volver al Inicio
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default FormularioAsignacionCostos;
