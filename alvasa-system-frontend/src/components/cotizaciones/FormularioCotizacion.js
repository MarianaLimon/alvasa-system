import React, { useState } from 'react';

import { guardarCotizacion } from '../../utils/guardarCotizacion';
import { useCargaInicialCotizacion } from '../../hooks/useCargaInicialCotizacion';

import { Form, Button, Card, Accordion, Badge } from 'react-bootstrap';
import { BsSave, BsListUl } from 'react-icons/bs';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import FormularioDatosGenerales from './FormularioDatosGenerales';
import FleteInternacional from './FleteInternacional';
import CargosTraslados from './CargosTraslados';
import DesgloseImpuestos from './DesgloseImpuestos';
import CargosExtra from './CargosExtra';
import Servicios from './Servicios';
import CuentaGastos from './CuentaGastos';
import Pedimento from './Pedimento';
import ResumenCotizacion from './ResumenCotizacion';

const FormularioCotizacion = ({ onCotizacionGuardada, modo = 'crear', datosIniciales = null }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(datosIniciales || {
    folio: '',
    cliente_id: '',
    empresa: '',
    fecha: new Date().toISOString().split('T')[0],
    mercancia: '',
    regimen: '',
    aduana: '',
    tipo_envio: '',
    incoterm: '',
    cantidad: 0,
    estatus: 'En negociación',
  });

  const [clientes, setClientes] = useState([]);
  const [flete, setFlete] = useState({
    origenDestino: '',
    concepto1: '',
    valor1: '',
    concepto2: '',
    valor2: '',
    concepto3: '',
    valor3: '',
    seguroMercancia: false,
    total: 0,
  });
  const [cargos, setCargos] = useState({});
  const [impuestos, setImpuestos] = useState({});
  const [cargosExtra, setCargosExtra] = useState({});
  const [servicios, setServicios] = useState({});
  const [cuentaGastos, setCuentaGastos] = useState({});
  const [pedimento, setPedimento] = useState({});
  const [resumen, setResumen] = useState({});

  useCargaInicialCotizacion({
    modo,
    id,
    setForm,
    setClientes,
    setFlete,
    setCargos,
    setCargosExtra,
    setServicios,
    setCuentaGastos,
    setPedimento,
    setImpuestos
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'cantidad' ? parseInt(value, 10) || 0 : value });
  };

  const renderBadgeEstatus = (estatus) => {
    const clases = {
      'Autorizada': 'bg-success',
      'En negociación': 'bg-warning text-dark',
      'Entregado a cliente': 'bg-info text-dark',
      'Declinada': 'bg-danger'
    };
    return (
      <span className={`badge px-4 py-2 fs-6 ${clases[estatus] || ''}`}>{estatus}</span>
    );
  };

  // helper robusto: toma el id ya venga en resp o en resp.data
  const pickId = (obj) => (
    obj?.cotizacionCompleta?.id ??
    obj?.cotizacion?.id ??
    obj?.id ??
    obj?.insertId ??
    obj?.cotizacionId ??
    obj?.id_cotizacion ??
    null
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resp = await guardarCotizacion({
        modo,
        form,
        resumen,
        flete,
        cargos,
        cargosExtra,
        servicios,
        cuentaGastos,
        pedimento,
        impuestos,
        id,
      });

      // normaliza por si guardarCotizacion devuelve un Axios response
      const data = resp?.data ?? resp;

      if (onCotizacionGuardada && data?.cotizacionCompleta) {
        onCotizacionGuardada(data.cotizacionCompleta);
      }

      // 1) intenta resolver el id de distintas formas
      let idCotizacion = (modo === 'crear')
        ? (pickId(data) ?? pickId(resp))
        : id;

      // 2) Fallback: si aún no hay id, pide la lista y usa la más reciente (id más alto)
      if (!idCotizacion) {
        try {
          const r = await fetch('/cotizaciones');
          if (r.ok) {
            const lista = await r.json();
            if (Array.isArray(lista) && lista.length) {
              idCotizacion = lista.reduce(
                (max, it) => (it?.id > max ? it.id : max),
                lista[0]?.id ?? 0
              );
            }
          }
        } catch (e) {
          console.warn('Fallback /cotizaciones falló:', e);
        }
      }

      // 3) Navegación
      if (modo === 'crear') {
        if (idCotizacion) {
          toast.success('Cotización guardada correctamente ✅');
          navigate(`/cotizaciones/${idCotizacion}`);
        } else {
          // evita /undefined
          toast.warn('Cotización guardada correctamente');
          navigate('/cotizaciones');
        }
      } else {
        toast.success('Cotización actualizada correctamente ✅');
        navigate(`/cotizaciones/${id}`);
      }
    } catch (error) {
      console.error('Error al guardar cotización:', error);
      toast.error('Hubo un error al guardar la cotización ❌');
    }
  };


  const handleFleteChange = (datosFlete) => setFlete(datosFlete);
  const handleCargosChange = (datosCargos) => setCargos(datosCargos);
  const handleImpuestosChange = (datosImpuestos) => setImpuestos(datosImpuestos);
  const handleCargosExtraChange = (datosExtra) => setCargosExtra(datosExtra);
  const handleServiciosChange = (datosServicios) => setServicios(datosServicios);
  const handleCuentaGastosChange = (datos) => setCuentaGastos(datos);
  const handlePedimentoChange = (datos) => setPedimento(datos);

  return (
    <Card className="container-cotizaciones">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="title-listacot">
            {modo === 'crear' ? 'Registrar Cotización' : `Editar Cotización: ${form.folio}`}
          </Card.Title>
          {form.estatus && renderBadgeEstatus(form.estatus)}
        </div>

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
          
          <FormularioDatosGenerales
            form={form}
            handleChange={handleChange}
            clientes={clientes}
            setForm={setForm}
          />
          
          <Accordion defaultActiveKey="0" className="mt-4">
            <Accordion.Item eventKey="0">
            <Accordion.Header>
              <div className="d-flex justify-content-between align-items-center w-100">
                <span>Flete Internacional</span>
                <Badge className="total-solapa">Total: {flete.total}</Badge>
              </div>
            </Accordion.Header>
              <Accordion.Body>
                <FleteInternacional onFleteChange={handleFleteChange} datos={flete} />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>
                <div className="d-flex justify-content-between align-items-center w-100">
                  <span>Cargos de Traslados</span>
                  <Badge className="total-solapa">Total: {cargos.total}</Badge>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <CargosTraslados onCargosChange={handleCargosChange} datos={cargos} />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
              <Accordion.Header>
                <div className="d-flex justify-content-between align-items-center w-100">
                  <span>Desglose de Impuestos</span>
                  <Badge className="total-solapa">Total: {impuestos.total}</Badge>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <DesgloseImpuestos onImpuestosChange={handleImpuestosChange} datos={impuestos} />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="3">
              <Accordion.Header>
                <div className="d-flex justify-content-between align-items-center w-100">
                  <span>Cargos Extra</span>
                  <Badge className="total-solapa">Total: {cargosExtra.total}</Badge>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <CargosExtra onCargosExtraChange={handleCargosExtraChange} datos={cargosExtra} />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="4">
              <Accordion.Header>
                <div className="d-flex justify-content-between align-items-center w-100">
                  <span>Servicios</span>
                  <Badge className="total-solapa">Total: {servicios.total}</Badge>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <Servicios onServiciosChange={handleServiciosChange} datos={servicios} />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="5">
              <Accordion.Header>
                <div className="d-flex justify-content-between align-items-center w-100">
                  <span>Cuenta de Gastos</span>
                  <Badge className="total-solapa">Total: {cuentaGastos.total}</Badge>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <CuentaGastos onCuentaChange={handleCuentaGastosChange} datos={cuentaGastos} />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="6">
              <Accordion.Header>
              <div className="d-flex justify-content-between align-items-center w-100">
                  <span>Pedimento</span>
                  <Badge className="total-solapa">Total: {pedimento.total}</Badge>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <Pedimento onPedimentoChange={handlePedimentoChange} datos={pedimento} />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          <ResumenCotizacion
            datosTotales={{ flete, cargos, impuestos, cargosExtra, servicios, cuentaGastos, pedimento }}
            datos={form}
            onResumenChange={setResumen}
          />

          <div className="d-flex justify-content-center gap-3 mt-4">
            <Button type="submit" variant="success">
              <BsSave className="me-2" />
              {modo === 'crear' ? 'Guardar Cotización' : 'Actualizar Cotización'}
            </Button>

            <Button variant="warning" onClick={() => navigate('/cotizaciones')}>
              <BsListUl className="me-2" />
              Ver todas las cotizaciones
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FormularioCotizacion;