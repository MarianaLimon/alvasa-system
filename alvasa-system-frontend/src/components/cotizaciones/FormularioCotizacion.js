import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Card, Row, Col, Accordion, Badge } from 'react-bootstrap';
import { BsSave, BsListUl } from 'react-icons/bs';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
    total: 0,
  });
  const [cargos, setCargos] = useState({});
  const [impuestos, setImpuestos] = useState({});
  const [cargosExtra, setCargosExtra] = useState({});
  const [servicios, setServicios] = useState({});
  const [cuentaGastos, setCuentaGastos] = useState({});
  const [pedimento, setPedimento] = useState({});
  const [resumen, setResumen] = useState({});

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cotizacionCompleta = {
      ...form,
      propuesta: resumen.propuesta,
      total: resumen.total,
      ahorro: resumen.ahorro,
      fraccion_igi: resumen.fraccion_igi,
      monto_comisionista: resumen.monto_comisionista || 0,
      notas: resumen.notas,
      flete_origen_destino: flete.origenDestino,
      flete_concepto_1: flete.concepto1,
      flete_valor_1: flete.valor1,
      flete_concepto_2: flete.concepto2,
      flete_valor_2: flete.valor2,
      flete_concepto_3: flete.concepto3,
      flete_valor_3: flete.valor3,
      flete_total: flete.total,
    };

    try {
      let idCotizacion = form.id || id;
      if (modo === 'crear') {
        const response = await axios.post('http://localhost:5050/cotizaciones', cotizacionCompleta);
        idCotizacion = response.data.id;

        const totalCargosCalculado = 
        parseFloat(cargos.terrestre || 0) +
        parseFloat(cargos.aereo || 0) +
        parseFloat(cargos.custodia || 0);

        await axios.post('http://localhost:5050/cargos', {
          cotizacion_id: idCotizacion,
          terrestre: cargos.terrestre || 0,
          aereo: cargos.aereo || 0,
          custodia: cargos.custodia || 0,
          total_cargos: cargos.total || 0,
          almacenajes: totalCargosCalculado,
          demoras: cargosExtra.demoras || 0,
          pernocta: cargosExtra.pernocta || 0,
          burreo: cargosExtra.burreo || 0,
          flete_falso: cargosExtra.fleteFalso || 0,
          servicio_no_realizado: cargosExtra.servicioNoRealizado || 0,
          seguro: cargosExtra.seguro || 0,
          total_cargos_extra: cargosExtra.total || 0
        });

        await axios.post('http://localhost:5050/servicios', {
          cotizacion_id: idCotizacion,
          maniobras: servicios.maniobras || 0,
          revalidacion: servicios.revalidacion || 0,
          gestionDestino: servicios.gestionDestino || 0,
          inspeccionPeritaje: servicios.inspeccionPeritaje || 0,
          documentacionImportacion: servicios.documentacionImportacion || 0,
          garantiaContenedores: servicios.garantiaContenedores || 0,
          distribucion: servicios.distribucion || 0,
          serentyPremium: servicios.serentyPremium || 0,
          total: servicios.total || 0
        });

        await axios.post('http://localhost:5050/cuenta-gastos', {
          cotizacion_id: idCotizacion,
          honorarios: cuentaGastos.honorarios || 0,
          padron: cuentaGastos.padron || 0,
          serviciosComplementarios: cuentaGastos.serviciosComplementarios || 0,
          manejoCarga: cuentaGastos.manejoCarga || 0,
          subtotal: cuentaGastos.subtotal || 0,
          iva: 0.16,
          total: cuentaGastos.total || 0
        });

        await axios.post('http://localhost:5050/pedimentos', {
          cotizacion_id: idCotizacion,
          tipoCambio: pedimento.tipoCambio || 0,
          pesoBruto: pedimento.pesoBruto || 0,
          valorAduana: pedimento.valorAduana || 0,
          dta: pedimento.dta || 0,
          ivaPrv: pedimento.ivaPrv || 0,
          igiIge: pedimento.igiIge || 0,
          prv: pedimento.prv || 0,
          iva: pedimento.iva || 0,
          total: pedimento.total || 0
        });

        await axios.post('http://localhost:5050/desglose-impuestos', {
          cotizacion_id: idCotizacion,
          valorFactura: impuestos.valorFactura || 0,
          flete: impuestos.flete || 0,
          tipoCambio: impuestos.tipoCambio || 0,
          valorAduana: impuestos.valorAduana || 0,
          dta: impuestos.dta || 0,
          igi: impuestos.igi || 0,
          iva: impuestos.iva || 0,
          prv: impuestos.prv || 'No aplica',
          ivaPrv: impuestos.ivaPrv || 'No aplica',
          total: impuestos.total || 0
        });
      } else {
        await axios.put(`http://localhost:5050/cotizaciones/${id}`, cotizacionCompleta);

        const totalCargosCalculado = 
          parseFloat(cargos.terrestre || 0) +
          parseFloat(cargos.aereo || 0) +
          parseFloat(cargos.custodia || 0);

        await axios.put(`http://localhost:5050/cargos/${idCotizacion}`, {
          terrestre: cargos.terrestre || 0,
          aereo: cargos.aereo || 0,
          custodia: cargos.custodia || 0,
          total_cargos: totalCargosCalculado,
          almacenajes: cargosExtra.almacenajes || 0,
          demoras: cargosExtra.demoras || 0,
          pernocta: cargosExtra.pernocta || 0,
          burreo: cargosExtra.burreo || 0,
          flete_falso: cargosExtra.fleteFalso || 0,
          servicio_no_realizado: cargosExtra.servicioNoRealizado || 0,
          seguro: cargosExtra.seguro || 0,
          total_cargos_extra: cargosExtra.total || 0
        });

        await axios.put(`http://localhost:5050/servicios/${idCotizacion}`, {
          maniobras: servicios.maniobras || 0,
          revalidacion: servicios.revalidacion || 0,
          gestionDestino: servicios.gestionDestino || 0,
          inspeccionPeritaje: servicios.inspeccionPeritaje || 0,
          documentacionImportacion: servicios.documentacionImportacion || 0,
          garantiaContenedores: servicios.garantiaContenedores || 0,
          distribucion: servicios.distribucion || 0,
          serentyPremium: servicios.serentyPremium || 0,
          total: servicios.total || 0
        });

        await axios.put(`http://localhost:5050/cuenta-gastos/${idCotizacion}`, {
          honorarios: cuentaGastos.honorarios || 0,
          padron: cuentaGastos.padron || 0,
          serviciosComplementarios: cuentaGastos.serviciosComplementarios || 0,
          manejoCarga: cuentaGastos.manejoCarga || 0,
          subtotal: cuentaGastos.subtotal || 0,
          iva: 0.16,
          total: cuentaGastos.total || 0
        });

        await axios.put(`http://localhost:5050/pedimentos/${idCotizacion}`, {
          tipoCambio: pedimento.tipoCambio || 0,
          pesoBruto: pedimento.pesoBruto || 0,
          valorAduana: pedimento.valorAduana || 0,
          dta: pedimento.dta || 0,
          ivaPrv: pedimento.ivaPrv || 0,
          igiIge: pedimento.igiIge || 0,
          prv: pedimento.prv || 0,
          iva: pedimento.iva || 0,
          total: pedimento.total || 0
        });

        await axios.put(`http://localhost:5050/desglose-impuestos/${idCotizacion}`, {
          valorFactura: impuestos.valorFactura || 0,
          flete: impuestos.flete || 0,
          tipoCambio: impuestos.tipoCambio || 0,
          valorAduana: impuestos.valorAduana || 0,
          dta: impuestos.dta || 0,
          igi: impuestos.igi || 0,
          iva: impuestos.iva || 0,
          prv: impuestos.prv || 'No aplica',
          ivaPrv: impuestos.ivaPrv || 'No aplica',
          total: impuestos.total || 0
        });
      }

      if (onCotizacionGuardada) onCotizacionGuardada(cotizacionCompleta);

        toast.success(
          modo === 'crear'
            ? 'Cotización guardada correctamente ✅'
            : 'Cotización actualizada correctamente ✅'
        );

        // Redireccionar después de un pequeño delay
        setTimeout(() => navigate('/cotizaciones'), 1000);

      } catch (error) {
        console.error('Error al guardar cotización:', error);
        toast.error('Hubo un error al guardar la cotización ❌');
      }
  };

  

  useEffect(() => {
    const obtenerClientes = async () => {
      try {
        const respuesta = await axios.get('http://localhost:5050/clientes');
        setClientes(respuesta.data);
      } catch (error) {
        console.error('Error al obtener clientes:', error);
      }
    };
    obtenerClientes();
  }, []);

  
  useEffect(() => {
    if (modo === 'crear') {
      const obtenerUltimoFolio = async () => {
        try {
          const respuesta = await axios.get('http://localhost:5050/cotizaciones');
          const cotizaciones = respuesta.data;
          if (cotizaciones.length > 0) {
            const folios = cotizaciones.map(c => c.folio);
            const numeros = folios.map(folio => parseInt(folio.split('-')[1], 10));
            const maxNumero = Math.max(...numeros);
            const nuevoNumero = maxNumero + 1;
            const nuevoFolio = `COT-${nuevoNumero.toString().padStart(4, '0')}`;
            setForm(prevForm => ({ ...prevForm, folio: nuevoFolio }));
          } else {
            setForm(prevForm => ({ ...prevForm, folio: 'COT-0001' }));
          }
        } catch (error) {
          console.error('Error al obtener el último folio:', error);
        }
      };
      obtenerUltimoFolio();
    } else if (modo === 'editar' && id) {
      const obtenerDatos = async () => {
        try {
          const respuesta = await axios.get(`http://localhost:5050/cotizaciones/${id}`);
          const cot = respuesta.data;
  
          setForm({
            id: cot.id,
            folio: cot.folio,
            cliente_id: cot.cliente_id,
            empresa: cot.empresa,
            fecha: cot.fecha.split('T')[0],
            mercancia: cot.mercancia,
            regimen: cot.regimen,
            aduana: cot.aduana,
            tipo_envio: cot.tipo_envio,
            cantidad: cot.cantidad,
            estatus: cot.estatus,
            propuesta: cot.propuesta || '',
            total: cot.total || 0,
            ahorro: cot.ahorro || 0,
            fraccion_igi: cot.fraccion_igi || '',
            monto_comisionista: cot.monto_comisionista || '',
            notas: cot.notas || ''
          });
  
          setFlete({
            origenDestino: cot.flete_origen_destino,
            concepto1: cot.flete_concepto_1,
            valor1: cot.flete_valor_1,
            concepto2: cot.flete_concepto_2,
            valor2: cot.flete_valor_2,
            concepto3: cot.flete_concepto_3,
            valor3: cot.flete_valor_3,
            total: parseFloat(cot.flete_valor_1 || 0) +
                   parseFloat(cot.flete_valor_2 || 0) +
                   parseFloat(cot.flete_valor_3 || 0)
          });
  
          setCargos(cot.cargos?.[0] || {});
          setCargosExtra(cot.cargos?.[0] || {});
          setServicios(cot.servicios?.[0] || {});
          setCuentaGastos(cot.cuentaGastos?.[0] || {});
          setPedimento(cot.pedimento || {});
  
          const imp = cot.desgloseImpuestos?.[0] || {};
          setImpuestos({
            valorFactura: imp.valor_factura ?? '',
            flete: imp.flete ?? '',
            tipoCambio: imp.tipo_cambio ?? '',
            valorAduana: imp.valor_aduana ?? 0,
            dta: imp.dta ?? 0,
            igi: imp.igi ?? '',
            iva: imp.iva ?? 0,
            prv: imp.prv ?? 'No aplica',
            ivaPrv: imp.iva_prv ?? 'No aplica',
            total: imp.total ?? 0
          });
  
        } catch (error) {
          console.error('Error al cargar datos para edición:', error);
        }
      };
      obtenerDatos();
    }
  }, [modo, id]);

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

          <Row>
            <Col md={4}>
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
                <Form.Control type="text" name="empresa" value={form.empresa} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Fecha</Form.Label>
                <Form.Control type="date" name="fecha" value={form.fecha} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Mercancía</Form.Label>
                <Form.Control type="text" name="mercancia" value={form.mercancia} onChange={handleChange} required />
              </Form.Group>
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
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Tipo de Envío</Form.Label>
                <Form.Select
                  name="tipo_envio"
                  value={form.tipo_envio || ''}
                  onChange={(e) => setForm({ ...form, tipo_envio: e.target.value })}
                >
                  <option value="">Selecciona tipo de envío</option>
                  <option value="Pallets">Pallets</option>
                  <option value="Cajas">Cajas</option>
                  <option value="Contenedor">Contenedor</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Cantidad</Form.Label>
                <Form.Control
                  type="number"
                  name="cantidad"
                  value={form.cantidad}
                  onChange={handleChange}
                  min={0}
                  required
                />
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
              </Form.Group>
            </Col>
          </Row>

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