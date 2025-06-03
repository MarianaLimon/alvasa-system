import React, { useState, useEffect } from 'react';
import {
  Card, Form, Row, Col, Button, Accordion
} from 'react-bootstrap';
import { BsSave, BsListUl } from 'react-icons/bs';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import SeleccionarProcesoModal from './SeleccionarProcesoModal';

import AADespacho from './AADespacho';
import Forwarder from './Forwarder';
import FleteTerrestre from './FleteTerrestre';
import Custodia from './Custodia';
import Paqueteria from './Paqueteria';
import Aseguradora from './Aseguradora';

const FormularioAsignacionCostos = ({ modo = 'crear' }) => {
  console.log("Modo del formulario:", modo);
  const navigate = useNavigate();
  const { folioProceso } = useParams();
  const location = useLocation();
  const [mostrarModal, setMostrarModal] = useState(modo === 'crear');
  const [form, setForm] = useState({
    procesoOperativoId: '', clienteId: '', nombreCliente: '', folioProceso: '', cliente: '', ejecutivoCuenta: '', noContenedor: '', mercancia: '', tipoCarga: '',
    salidaAduana: '', aaDespacho: '', forwarder: '', consignatario: '', naviera: '', valorMercancia: '',
    importacionCosto: '', importacionVenta: '', almacenajesCosto: '', almacenajesVenta: '', servicioCosto: '',
    servicioVenta: '', tipoServicio1: '', costoServicio1: '', ventaServicio1: '', tipoServicio2: '',
    costoServicio2: '', ventaServicio2: '',
    asignadoPor: '', fleteInternacionalCosto: '', fleteInternacionalVenta: '', cargosLocalesCosto: '', cargosLocalesVenta: '',
    demorasCosto: '', demorasVenta: '', abonado: '', fechaAbon: '', rembolsado: '', fechaRemb: '',
    nombreProveedor: '', custodiaCosto: '', custodiaVenta: '', pernoctaCosto: '', pernoctaVenta: '', falsoCosto: '',
    falsoVenta: '', cancelacionCosto: '', cancelacionVenta: '', diasCosto: '', diasVenta: '',
    empresa: '', costo: '', venta: '',
    aseguradora: '', costoAseguradora: '', ventaAseguradora: '',
    proveedor: '', flete: '', fleteVenta: '', estadia: '', estadiaVenta: '', burreo: '', burreoVenta: '',
    sobrepeso: '', sobrepesoVenta: '', apoyo: '', apoyoVenta: '', pernoctaFlete: '', pernoctaFleteVenta: '',
    extra1: '', extra1Costo: '', extra1Venta: '',
    extra2: '', extra2Costo: '', extra2Venta: '',
    extra3: '', extra3Costo: '', extra3Venta: ''
  });

  const cargarProcesoPorId = async (idProceso) => {
    try {
      // Primero, verifica si ya existe una asignación
      const res = await axios.get(`http://localhost:5050/asignacion-costos/proceso/${idProceso}`);
      
      // Si existe, redirige a la edición
      if (res.data && res.data.id) {
        navigate(`/asignacion-costos/editar/${res.data.id}`, { replace: true });
      }
    } catch (error) {
      // Si no existe, entonces carga el proceso para crear una nueva
      if (error.response && error.response.status === 404) {
        try {
          const resProceso = await axios.get(`http://localhost:5050/procesos-operativos/${idProceso}`);
          const proceso = resProceso.data;

          setForm(prev => ({
            ...prev,
            procesoOperativoId: proceso.id || '',
            clienteId: proceso.cliente_id || '',
            nombreCliente: proceso.cliente || proceso.nombre_cliente || '',
            folioProceso: proceso.folio_proceso || '',
            cliente: proceso.cliente || proceso.nombre_cliente || '',
            ejecutivoCuenta: proceso.ejecutivo_cuenta || '',
            noContenedor: proceso.informacion_embarque?.no_contenedor || '',
            mercancia: proceso.mercancia || '',
            tipoCarga: proceso.tipo_carga || '',
            salidaAduana: proceso.salida_retorno_contenedor?.salida_aduana || '',
            aaDespacho: proceso.datos_pedimento?.aa_despacho || '',
            forwarder: proceso.informacion_embarque?.forwarde || '',
            consignatario: proceso.informacion_embarque?.consignatario || '',
            naviera: proceso.informacion_embarque?.naviera || ''
          }));

          setMostrarModal(false);
        } catch (err) {
          console.error('Error al cargar proceso operativo:', err);
        }
      } else {
        console.error('Error al verificar asignación existente:', error);
      }
    }
  };

  useEffect(() => {
    const cargarAsignacion = async () => {
      if (modo === 'editar' && folioProceso) {
        console.log("Entrando a modo editar con ID:", folioProceso);
        try {
          const { data } = await axios.get(`http://localhost:5050/asignacion-costos/folio/${folioProceso}`);
          console.log("Datos cargados para edición:", data);
          setForm(prev => ({
          ...prev,
          procesoOperativoId: data.proceso_operativo_id || '',
          clienteId: data.cliente_id || '',
          nombreCliente: data.nombre_cliente || '',
          folioProceso: data.folio_proceso || '',
          cliente: data.nombre_cliente || '',
          ejecutivoCuenta: data.ejecutivo_cuenta || '',
          noContenedor: data.no_contenedor || '',
          mercancia: data.mercancia || '',
          tipoCarga: data.tipo_carga || '',
          salidaAduana: data.salida_aduana || ''
        }));
          setMostrarModal(false);
        } catch (error) {
          console.error('Error al cargar asignación existente:', error);
        }
      }
    };

    cargarAsignacion();
  }, [modo, folioProceso, location.key]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modo === 'editar') {
        await axios.put(`http://localhost:5050/asignacion-costos/${folioProceso}`, form);
        alert('Asignación actualizada correctamente');
      } else {
        await axios.post('http://localhost:5050/asignacion-costos', form);
        alert('Asignación guardada correctamente');
      }
      navigate('/'); // o la ruta deseada
    } catch (error) {
      console.error('Error al guardar la asignación:', error);
      alert('Hubo un error al guardar la asignación');
    }
  };

  return (
    <>
      {modo === 'crear' && (
        <SeleccionarProcesoModal
          mostrar={mostrarModal}
          onSeleccionar={cargarProcesoPorId}
        />
      )}

      {!mostrarModal && (
        <Form onSubmit={handleSubmit}>
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
                    <Forwarder datos={form} onChange={(datos) => setForm(prev => ({ ...prev, ...datos }))} />
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
                    <Custodia datos={form} onChange={(datos) => setForm(prev => ({ ...prev, ...datos }))} />
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="4">
                  <Accordion.Header>Empresa Paquetería</Accordion.Header>
                  <Accordion.Body>
                    <Paqueteria datos={form} onChange={(datos) => setForm(prev => ({ ...prev, ...datos }))} />
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="5">
                  <Accordion.Header>Aseguradora</Accordion.Header>
                  <Accordion.Body>
                    <Aseguradora datos={form} onChange={(datos) => setForm(prev => ({ ...prev, ...datos }))} />
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>

              <div className="d-flex justify-content-center gap-3">
                <Button type="submit" variant="success">
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
        </Form>
      )}
    </>
  );

};

export default FormularioAsignacionCostos;