import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Spinner, Button, Row, Col, Accordion, Badge } from 'react-bootstrap';
import { BsArrowLeft, BsPencil, BsPrinter } from 'react-icons/bs';

const VerCotizacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cotizacion, setCotizacion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerCotizacion = async () => {
      try {
        const response = await axios.get(`http://localhost:5050/cotizaciones/${id}`);
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

  // Función para Bandage Status
  const renderBadgeEstatus = (estatus) => {
    const clases = {
      'Autorizada': 'success',
      'En negociación': 'warning',
      'Entregado a cliente': 'info',
      'Declinada': 'danger'
    };
    return <Badge bg={clases[estatus] || 'secondary'}>{estatus}</Badge>;
  };

  // Función para imprimir la cotización
  const handlePrint = () => {
    window.open(
      `http://localhost:5050/api/cotizaciones/${id}/pdf`,
      '_blank'
      );
  };

  
  return (
    <Card className="detalle-card">
      <Card.Body>
        <Card.Title>
          <Row>
            <Col md={6}>
              <p className="detalle-title">Folio de cotización: {cotizacion.folio}</p>
            </Col>
            <Col md={6}>
              {renderBadgeEstatus(cotizacion.estatus)}
            </Col>
          </Row>
        </Card.Title>
        
        <Row>
          {/* Columna izquierda - Información general */}
          <Col md={4}>
            <h5 className='detalle-title-datosgenerales'>Datos Generales</h5>
            <p><strong>Cliente:</strong> {cotizacion.cliente}</p>
            <p><strong>Empresa:</strong> {cotizacion.empresa}</p>
            <p><strong>Fecha:</strong> {cotizacion.fecha}</p>
            <p><strong>Mercancía:</strong> {cotizacion.mercancia}</p>
            <p><strong>Régimen:</strong> {cotizacion.regimen}</p>
            <p><strong>Aduana:</strong> {cotizacion.aduana}</p>
            <p><strong>Tipo de Envío:</strong> {cotizacion.tipo_envio}</p>
            <p><strong>Cantidad:</strong> {cotizacion.cantidad}</p>
            <p><strong>Estatus:</strong> {cotizacion.estatus}</p>

            <hr className='separador-horizontal'/>

            <h5 className="detalle-title-resumen">Resumen</h5>
            <p><strong>Fracción IGI:</strong> {cotizacion.fraccion_igi}</p>
            <p><strong>Monto Comisionista:</strong> ${Number(cotizacion.monto_comisionista || 0).toFixed(2)}</p>
            <p><strong>Notas:</strong> {cotizacion.notas}</p>
            <p className='detalle-totalgral'><strong>Total:</strong> ${Number(cotizacion.total || 0).toFixed(2)}</p>
            <p className='detalle-propuesta'><strong>Propuesta:</strong> ${Number(cotizacion.propuesta || 0).toFixed(2)}</p>
            <p className='detalle-ahorro'><strong>Ahorro:</strong> ${Number(cotizacion.ahorro || 0).toFixed(2)}</p>
          </Col>

          {/* Columna derecha - Acordeones */}
          <Col md={8}>
            <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <span>Flete Internacional</span>
                    <Badge className="total-solapa">Total: ${Number(cotizacion.flete_total || 0).toFixed(2)}</Badge>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <p><strong>Origen - Destino:</strong> {cotizacion.flete_origen_destino}</p>
                  <p><strong>Concepto 1:</strong> {cotizacion.flete_concepto_1} - <strong>Valor:</strong> ${Number(cotizacion.flete_valor_1 || 0).toFixed(2)}</p>
                  <p><strong>Concepto 2:</strong> {cotizacion.flete_concepto_2} - <strong>Valor:</strong> ${Number(cotizacion.flete_valor_2 || 0).toFixed(2)}</p>
                  <p><strong>Concepto 3:</strong> {cotizacion.flete_concepto_3} - <strong>Valor:</strong> ${Number(cotizacion.flete_valor_3 || 0).toFixed(2)}</p>
                  <p className='detalle-subformulario'><strong>Total Flete:</strong> ${Number(cotizacion.flete_total || 0).toFixed(2)}</p>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="1">
                <Accordion.Header>
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <span>Cargos de Traslados</span>
                    <Badge className="total-solapa">Total: ${Number(cotizacion.cargos?.[0]?.total_cargos  || 0).toFixed(2)}</Badge>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  {cotizacion.cargos && cotizacion.cargos.length > 0 ? (
                    cotizacion.cargos.map((cargo, index) => (
                      <div key={index}>
                        <p><strong>Terrestre:</strong> ${Number(cargo.terrestre || 0).toFixed(2)}</p>
                        <p><strong>Aéreo:</strong> ${Number(cargo.aereo || 0).toFixed(2)}</p>
                        <p><strong>Custodia:</strong> ${Number(cargo.custodia || 0).toFixed(2)}</p>
                        <p className='detalle-subformulario'><strong>Total Cargos:</strong> ${Number(cargo.total_cargos || 0).toFixed(2)}</p>
                      </div>
                    ))
                  ) : (
                    <p>No hay cargos de traslado registrados.</p>
                  )}
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="2">
              <Accordion.Header>
                <div className="d-flex justify-content-between align-items-center w-100">
                  <span>Desglose de Impuestos</span>
                  <Badge className="total-solapa">Total: ${Number(cotizacion.desgloseImpuestos?.[0]?.total  || 0).toFixed(2)}</Badge>
                </div>
              </Accordion.Header>
                <Accordion.Body>
                  {cotizacion.desgloseImpuestos && cotizacion.desgloseImpuestos.length > 0 ? (
                    cotizacion.desgloseImpuestos.map((item, index) => (
                      <div key={index}>
                        <p><strong>Valor Factura:</strong> ${Number(item.valor_factura || 0).toFixed(2)}</p>
                        <p><strong>Flete:</strong> ${Number(item.flete || 0).toFixed(2)}</p>
                        <p><strong>Tipo de Cambio:</strong> {Number(item.tipo_cambio || 0).toFixed(2)}</p>
                        <p><strong>DTA:</strong> ${Number(item.dta || 0).toFixed(2)}</p>
                        <p><strong>IGI:</strong> ${Number(item.igi || 0).toFixed(2)}</p>
                        <p><strong>IVA:</strong> ${Number(item.iva || 0).toFixed(2)}</p>
                        <p><strong>PRV:</strong> {item.prv}</p>
                        <p><strong>IVA / PRV:</strong> {item.iva_prv}</p>
                        <p className='detalle-subformulario'><strong>Total:</strong> <u>${Number(item.total || 0).toFixed(2)}</u></p>
                      </div>
                    ))
                  ) : (
                    <p>No hay desglose de impuestos registrado.</p>
                  )}
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="3">
                <Accordion.Header>
                <div className="d-flex justify-content-between align-items-center w-100">
                  <span>Cargos Extra</span>
                  <Badge className="total-solapa">Total: ${Number(cotizacion.cargos?.[0]?.total_cargos_extra  || 0).toFixed(2)}</Badge>
                </div>
                </Accordion.Header>
                <Accordion.Body>
                  {cotizacion.cargos && cotizacion.cargos.length > 0 ? (
                    cotizacion.cargos.map((cargo, index) => (
                      <div key={index}>
                        <p><strong>Almacenajes:</strong> ${Number(cargo.almacenajes || 0).toFixed(2)}</p>
                        <p><strong>Demoras:</strong> ${Number(cargo.demoras || 0).toFixed(2)}</p>
                        <p><strong>Pernocta:</strong> ${Number(cargo.pernocta || 0).toFixed(2)}</p>
                        <p><strong>Burreo:</strong> ${Number(cargo.burreo || 0).toFixed(2)}</p>
                        <p><strong>Flete Falso:</strong> ${Number(cargo.flete_falso || 0).toFixed(2)}</p>
                        <p><strong>Servicio No Realizado:</strong> ${Number(cargo.servicio_no_realizado || 0).toFixed(2)}</p>
                        <p><strong>Seguro:</strong> ${Number(cargo.seguro || 0).toFixed(2)}</p>
                        <p className='detalle-subformulario'><strong>Total Cargos Extra:</strong> ${Number(cargo.total_cargos_extra || 0).toFixed(2)}</p>
                      </div>
                    ))
                  ) : (
                    <p>No hay cargos extra registrados.</p>
                  )}
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="4">
                <Accordion.Header>
                <div className="d-flex justify-content-between align-items-center w-100">
                  <span>Servicios</span>
                  <Badge className="total-solapa">Total: ${Number(cotizacion.servicios?.[0]?.total_servicios  || 0).toFixed(2)}</Badge>
                </div>
                </Accordion.Header>
                <Accordion.Body>
                  {cotizacion.servicios && cotizacion.servicios.length > 0 ? (
                    cotizacion.servicios.map((servicio, index) => (
                      <div key={index}>
                        <p><strong>Maniobras:</strong> ${Number(servicio.maniobras || 0).toFixed(2)}</p>
                        <p><strong>Revalidación:</strong> ${Number(servicio.revalidacion || 0).toFixed(2)}</p>
                        <p><strong>Gestión Contenedores Destino:</strong> ${Number(servicio.gestion_destino || 0).toFixed(2)}</p>
                        <p><strong>Inspección y Peritaje:</strong> ${Number(servicio.inspeccion_peritaje || 0).toFixed(2)}</p>
                        <p><strong>Documentación de Importación:</strong> ${Number(servicio.documentacion_importacion || 0).toFixed(2)}</p>
                        <p><strong>Garantía de Contenedores:</strong> ${Number(servicio.garantia_contenedores || 0).toFixed(2)}</p>
                        <p><strong>Distribución:</strong> ${Number(servicio.distribucion || 0).toFixed(2)}</p>
                        <p><strong>Serenty PREMIUM:</strong> ${Number(servicio.serenty_premium || 0).toFixed(2)}</p>
                        <p className='detalle-subformulario'><strong>Total Servicios:</strong> <u>${Number(servicio.total_servicios || 0).toFixed(2)}</u></p>
                      </div>
                    ))
                  ) : (
                    <p>No hay servicios registrados.</p>
                  )}
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="5">
                <Accordion.Header>
                <div className="d-flex justify-content-between align-items-center w-100">
                  <span>Cuenta de Gastos</span>
                  <Badge className="total-solapa">Total: ${Number(cotizacion.cuentaGastos?.[0]?.total  || 0).toFixed(2)}</Badge>
                </div>
                </Accordion.Header>
                <Accordion.Body>
                  {cotizacion.cuentaGastos && cotizacion.cuentaGastos.length > 0 ? (
                    cotizacion.cuentaGastos.map((gasto, index) => (
                      <div key={index}>
                        <p><strong>Honorarios:</strong> ${Number(gasto.honorarios || 0).toFixed(2)}</p>
                        <p><strong>Padrón:</strong> ${Number(gasto.padron || 0).toFixed(2)}</p>
                        <p><strong>Servicios Complementarios:</strong> ${Number(gasto.servicios_complementarios || 0).toFixed(2)}</p>
                        <p><strong>Manejo de Carga:</strong> ${Number(gasto.manejo_carga || 0).toFixed(2)}</p>
                        <p><strong>Subtotal:</strong> ${Number(gasto.subtotal || 0).toFixed(2)}</p>
                        <p><strong>IVA (16%):</strong> ${(Number(gasto.subtotal || 0) * 0.16).toFixed(2)}</p>
                        <p className='detalle-subformulario'><strong>Total:</strong> <u>${Number(gasto.total || 0).toFixed(2)}</u></p>
                      </div>
                    ))
                  ) : (
                    <p>No hay cuenta de gastos registrada.</p>
                  )}
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="6">
              <Accordion.Header>
                <div className="d-flex justify-content-between align-items-center w-100">
                  <span>Pedimento</span>
                  <Badge className="total-solapa">Total: ${Number(cotizacion.pedimento.total || 0).toFixed(2)}</Badge>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                {cotizacion.pedimento ? (
                  <div>
                    <p><strong>Tipo de Cambio:</strong> ${Number(cotizacion.pedimento.tipo_cambio || 0).toFixed(2)}</p>
                    <p><strong>Peso Bruto:</strong> {Number(cotizacion.pedimento.peso_bruto || 0).toFixed(2)} kg</p>
                    <p><strong>Valor Aduana:</strong> ${Number(cotizacion.pedimento.valor_aduana || 0).toFixed(2)}</p>
                    <p><strong>DTA:</strong> ${Number(cotizacion.pedimento.dta || 0).toFixed(2)}</p>
                    <p><strong>IVA-PRV:</strong> ${Number(cotizacion.pedimento.iva_prv || 0).toFixed(2)}</p>
                    <p><strong>IGI-IGE:</strong> ${Number(cotizacion.pedimento.igi_ige || 0).toFixed(2)}</p>
                    <p><strong>PRV:</strong> ${Number(cotizacion.pedimento.prv || 0).toFixed(2)}</p>
                    <p><strong>IVA:</strong> ${Number(cotizacion.pedimento.iva || 0).toFixed(2)}</p>
                    <p className='detalle-subformulario'><strong><u>Total:</u></strong> <u>${Number(cotizacion.pedimento.total || 0).toFixed(2)}</u></p>
                  </div>
                ) : (
                  <p>No hay pedimento registrado.</p>
                )}
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
          <Button variant="primary" onClick={handlePrint}>
            <BsPrinter className="me-2" /> Imprimir
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