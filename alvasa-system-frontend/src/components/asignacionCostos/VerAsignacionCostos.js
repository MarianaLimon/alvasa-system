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
const manejarVerCotizacion = async () => {
  try {
    const folioCotizacion = asignacion.despacho?.cotizacion_folio;
    if (!folioCotizacion) return;
    const res = await axios.get(`http://localhost:5050/cotizaciones/folio/${folioCotizacion}`);
    console.log('📦 RES.DATA:', res.data);
    const id = res.data?.id;
    if (!id) throw new Error('No se encontró el ID de la cotización');
    navigate(`/cotizaciones/${id}`);
  } catch (err) {
    console.error('Error al obtener ID de la cotización:', err);
    alert('No se pudo cargar la cotización.');
  }
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
                <p className="detalle-title">Detalle de Costos: {asignacion.folio_proceso}</p>
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
                <div className="container-menu-detalle d-flex flex-column gap-2">
                    <Button variant="primary" className="w-100" onClick={manejarImprimir}>
                    <BsPrinter className="me-2" /> Imprimir
                    </Button>
                    <Button variant="success" className="w-100 btn-editar-asignacion" onClick={() => navigate(`/asignacion-costos/editar/${folio}`)}>
                    <BsPencil className="me-2" /> Editar Costos
                    </Button>
                    <Button variant="info" className="w-100" onClick={() => navigate(`/procesos-operativos/${asignacion.proceso_operativo_id}`)}>
                    <BsEye className="me-2" /> Ver Proceso
                    </Button>
                    {asignacion.despacho?.cotizacion_folio && (
                    <Button variant="warning" className="w-100" onClick={manejarVerCotizacion}>
                        <BsEye className="me-2" /> Ver cotización
                    </Button>
                    )}
                    <Button variant="secondary" className="w-100" onClick={() => navigate('/procesos-operativos')}>
                    <BsArrowLeft className="me-2" /> Volver a la lista
                    </Button>
                </div>
          </Col>
          <Col md={8}>
            <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header>Despacho</Accordion.Header>
                <Accordion.Body>
                    <Table bordered size="sm">
                    <thead className="thead-ver-asignacion">
                        <tr>
                        <th className="text-center">Folio Cotización</th>
                        <th className="text-center">Comisión Intermediario</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <td className="text-center">{asignacion.despacho?.cotizacion_folio || '—'}</td>
                        <td className="text-center">{formatoMoneda(asignacion.despacho?.comision_intermediario)}</td>
                        </tr>
                    </tbody>
                    </Table>
                    <Table bordered size="sm">
                    <thead className="thead-ver-asignacion">
                        <tr>
                        <th className="text-center">Facturación</th>
                        <th className="text-center">Comisión Socio</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <td className="text-center">{formatoMoneda(asignacion.despacho?.facturacion)}</td>
                        <td className="text-center">{formatoMoneda(asignacion.despacho?.comision_socio)}</td>
                        </tr>
                    </tbody>
                    </Table>
                    
                    
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>AA Despacho</Accordion.Header>
                <Accordion.Body>
                    <p><strong>Nom. Proveedor:</strong> {asignacion.aa_despacho?.aa_despacho}</p>
                    <Table bordered size="sm">
                        <thead className='thead-ver-asignacion'>
                            <tr>
                                <th className="text-center">Servicios</th>
                                <th className="text-center">Costo</th>
                                <th className="text-center">Venta</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="text-center">IMPORTACIÓN</td>
                                <td className="text-center">{formatoMoneda(asignacion.aa_despacho?.importacion_costo)}</td>
                                <td className="text-center">{formatoMoneda(asignacion.aa_despacho?.importacion_venta)}</td>
                            </tr>
                            <tr>
                                <td className="text-center">ALMACENAJES</td>
                                <td className="text-center">{formatoMoneda(asignacion.aa_despacho?.almacenajes_costo)}</td>
                                <td className="text-center">{formatoMoneda(asignacion.aa_despacho?.almacenajes_venta)}</td>
                            </tr>
                            <tr>
                                <td className="text-center">SERV. PRG. MO EJEC.</td>
                                <td className="text-center">{formatoMoneda(asignacion.aa_despacho?.servicio_costo)}</td>
                                <td className="text-center">{formatoMoneda(asignacion.aa_despacho?.servicio_venta)}</td>
                            </tr>
                        </tbody>
                    </Table>
                    <Table bordered size="sm">
                        <thead className='thead-ver-asignacion'>
                            <tr>
                                <th className="text-center">Servicios Adicionales</th>
                                <th className="text-center">Costo</th>
                                <th className="text-center">Venta</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="text-center">{asignacion.aa_despacho?.tipo_servicio1 || '—'}</td>
                                <td className="text-center">{formatoMoneda(asignacion.aa_despacho?.costo_servicio1)}</td>
                                <td className="text-center">{formatoMoneda(asignacion.aa_despacho?.venta_servicio1)}</td>
                            </tr>
                            <tr>
                                <td className="text-center">{asignacion.aa_despacho?.tipo_servicio2 || '—'}</td>
                                <td className="text-center">{formatoMoneda(asignacion.aa_despacho?.costo_servicio2)}</td>
                                <td className="text-center">{formatoMoneda(asignacion.aa_despacho?.venta_servicio2)}</td>
                            </tr>
                        </tbody>
                    </Table>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="2">
                <Accordion.Header>Forwarder</Accordion.Header>
                <Accordion.Body>
                    <Row className="mb-2">
                        <Col md={6}><strong>Forwarder:</strong> {asignacion.forwarder?.forwarder}</Col>
                        <Col md={6}><strong>¿A quién pagamos?</strong> {asignacion.forwarder?.asignado_por}</Col>
                    </Row>
                    <Row className="mb-2">
                        <Col md={6}><strong>Consignatario:</strong> {asignacion.forwarder?.consignatario}</Col>
                        <Col md={6}><strong>Naviera:</strong> {asignacion.forwarder?.naviera}</Col>
                    </Row>
                    <Table bordered size="sm">
                        <thead className='thead-ver-asignacion'>
                            <tr>
                                <th className="text-center">Servicios</th>
                                <th className="text-center">Costo</th>
                                <th className="text-center">Venta</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="text-center">Flete Internacional</td>
                                <td className="text-center">{formatoMoneda(asignacion.forwarder?.flete_internacional_costo)}</td>
                                <td className="text-center">{formatoMoneda(asignacion.forwarder?.flete_internacional_venta)}</td>
                            </tr>
                            <tr>
                                <td className="text-center">Cargos Locales</td>
                                <td className="text-center">{formatoMoneda(asignacion.forwarder?.cargos_locales_costo)}</td>
                                <td className="text-center">{formatoMoneda(asignacion.forwarder?.cargos_locales_venta)}</td>
                            </tr>
                            <tr>
                                <td className="text-center">Demoras</td>
                                <td className="text-center">{formatoMoneda(asignacion.forwarder?.demoras_costo)}</td>
                                <td className="text-center">{formatoMoneda(asignacion.forwarder?.demoras_venta)}</td>
                            </tr>
                        </tbody>
                    </Table>
                    <p><strong>Servicio Extra</strong></p>
                    <Table bordered size="sm">
                    <thead className="thead-ver-asignacion">
                        <tr>
                        <th className="text-center">Servicio</th>
                        <th className="text-center">Costo</th>
                        <th className="text-center">Venta</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <td className="text-center">{asignacion.forwarder?.tipo_servicio_extra || '—'}</td>
                        <td className="text-center">{formatoMoneda(asignacion.forwarder?.costo_servicio_extra)}</td>
                        <td className="text-center">{formatoMoneda(asignacion.forwarder?.venta_servicio_extra)}</td>
                        </tr>
                    </tbody>
                    </Table>
                    
                    <p><strong>Garantias</strong></p>
                    <Table bordered size="sm">
                        <thead className='thead-ver-asignacion'>
                            <tr>
                                <th className="text-center">Abonado</th>
                                <th className="text-center">Fecha Abono</th>
                                <th className="text-center">Reembolsado</th>
                                <th className="text-center">Fecha Reembolso</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="text-center">{formatoMoneda(asignacion.forwarder?.abonado)}</td>
                                <td className="text-center">{asignacion.forwarder?.fecha_abon?.split('T')[0]}</td>
                                <td className="text-center">{formatoMoneda(asignacion.forwarder?.rembolsado)}</td>
                                <td className="text-center">{asignacion.forwarder?.fecha_remb?.split('T')[0]}</td>
                            </tr>
                        </tbody>
                    </Table>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="3">
                <Accordion.Header>Flete Terrestre</Accordion.Header>
                <Accordion.Body>
                    <p><strong>Nom. Proveedor: :</strong> {asignacion.flete_terrestre?.proveedor}</p>
                    <Table bordered size="sm">
                        <thead className='thead-ver-asignacion'>
                            <tr>
                                <th className="text-center">Servicios</th>
                                <th className="text-center">Costo</th>
                                <th className="text-center">Venta</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="text-center">Flete</td>
                                <td className="text-center">{formatoMoneda(asignacion.flete_terrestre?.flete)}</td>
                                <td className="text-center">{formatoMoneda(asignacion.flete_terrestre?.flete_venta)}</td>
                            </tr>
                            <tr>
                                <td className="text-center">Estadía</td>
                                <td className="text-center">{formatoMoneda(asignacion.flete_terrestre?.estadia)}</td>
                                <td className="text-center">{formatoMoneda(asignacion.flete_terrestre?.estadia_venta)}</td>
                            </tr>
                            <tr>
                                <td className="text-center">Burreo</td>
                                <td className="text-center">{formatoMoneda(asignacion.flete_terrestre?.burreo)}</td>
                                <td className="text-center">{formatoMoneda(asignacion.flete_terrestre?.burreo_venta)}</td>
                            </tr>
                            <tr>
                                <td className="text-center">Sobrepeso</td>
                                <td className="text-center">{formatoMoneda(asignacion.flete_terrestre?.sobrepeso)}</td>
                                <td className="text-center">{formatoMoneda(asignacion.flete_terrestre?.sobrepeso_venta)}</td>
                            </tr>
                            <tr>
                                <td className="text-center">Apoyo</td>
                                <td className="text-center">{formatoMoneda(asignacion.flete_terrestre?.apoyo)}</td>
                                <td className="text-center">{formatoMoneda(asignacion.flete_terrestre?.apoyo_venta)}</td>
                            </tr>
                            <tr>
                                <td className="text-center">Pernocta</td>
                                <td className="text-center">{formatoMoneda(asignacion.flete_terrestre?.pernocta)}</td>
                                <td className="text-center">{formatoMoneda(asignacion.flete_terrestre?.pernocta_venta)}</td>
                            </tr>
                        </tbody>
                    </Table>
                    {asignacion.flete_terrestre?.extras?.length > 0 && (
                    <>
                        <Table bordered size="sm">
                        <thead className="thead-ver-asignacion">
                            <tr>
                            <th className="text-center">Servicios Extras</th>
                            <th className="text-center">Costo</th>
                            <th className="text-center">Venta</th>
                            </tr>
                        </thead>
                        <tbody>
                            {asignacion.flete_terrestre.extras.map((extra, idx) => (
                            <tr key={idx}>
                                <td className="text-center">{extra.concepto}</td>
                                <td className="text-center">{formatoMoneda(extra.costo)}</td>
                                <td className="text-center">{formatoMoneda(extra.venta)}</td>
                            </tr>
                            ))}
                        </tbody>
                        </Table>
                    </>
                    )}
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="4">
                <Accordion.Header>Custodia</Accordion.Header>
                <Accordion.Body>
                    <p><strong>Proveedor:</strong> {asignacion.custodia?.custodia_proveedor}</p>
                    <Table bordered size="sm">
                        <thead className="thead-ver-asignacion">
                            <tr>
                            <th className="text-center">Servicio</th>
                            <th className="text-center">Costo</th>
                            <th className="text-center">Venta</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                            <td className="text-center">Servicio Base</td>
                            <td className="text-center">{formatoMoneda(asignacion.custodia?.custodia_costo)}</td>
                            <td className="text-center">{formatoMoneda(asignacion.custodia?.custodia_venta)}</td>
                            </tr>
                            <tr>
                            <td className="text-center">Pernocta</td>
                            <td className="text-center">{formatoMoneda(asignacion.custodia?.custodia_pernocta_costo)}</td>
                            <td className="text-center">{formatoMoneda(asignacion.custodia?.custodia_pernocta_venta)}</td>
                            </tr>
                            <tr>
                            <td className="text-center">Falso</td>
                            <td className="text-center">{formatoMoneda(asignacion.custodia?.custodia_falso_costo)}</td>
                            <td className="text-center">{formatoMoneda(asignacion.custodia?.custodia_falso_venta)}</td>
                            </tr>
                            <tr>
                            <td className="text-center">Cancelación</td>
                            <td className="text-center">{formatoMoneda(asignacion.custodia?.custodia_cancelacion_costo)}</td>
                            <td className="text-center">{formatoMoneda(asignacion.custodia?.custodia_cancelacion_venta)}</td>
                            </tr>
                        </tbody>
                        </Table>
                        {/*<h6 className="mt-3"><strong>Almacenaje</strong></h6>
                         <Table bordered size="sm">
                            <thead className="thead-ver-asignacion">
                                <tr>
                                <th className="text-center">Días</th>
                                <th className="text-center">Costo</th>
                                <th className="text-center">Días</th>
                                <th className="text-center">Venta</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                <td className="text-center">{asignacion.custodia?.custodia_dias_costo}</td>
                                <td className="text-center">{formatoMoneda(asignacion.custodia?.custodia_costo_almacenaje)}</td>
                                <td className="text-center">{asignacion.custodia?.custodia_dias_venta}</td>
                                <td className="text-center">{formatoMoneda(asignacion.custodia?.custodia_venta_almacenaje)}</td>
                                </tr>
                            </tbody>
                        </Table> */}
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="5">
                <Accordion.Header>Paquetería</Accordion.Header>
                <Accordion.Body>
                    <Table bordered size="sm">
                        <thead className="thead-ver-asignacion">
                            <tr>
                            <th className="text-center">Empresa</th>
                            <th className="text-center">Costo</th>
                            <th className="text-center">Venta</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                            <td className="text-center">{asignacion.paqueteria?.empresa}</td>
                            <td className="text-center">{formatoMoneda(asignacion.paqueteria?.costo)}</td>
                            <td className="text-center">{formatoMoneda(asignacion.paqueteria?.venta)}</td>
                            </tr>
                        </tbody>
                    </Table>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="6">
                <Accordion.Header>Aseguradora</Accordion.Header>
                <Accordion.Body>
                    <p><strong>Valor Mercancía:</strong> {formatoMoneda(asignacion.aseguradora?.valor_mercancia)}</p>
                    <Table bordered size="sm">
                        <thead className="thead-ver-asignacion">
                            <tr>
                            <th className="text-center">Aseguradora</th>
                            <th className="text-center">Costo</th>
                            <th className="text-center">Venta</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                            <td className="text-center">{asignacion.aseguradora?.aseguradora}</td>
                            <td className="text-center">{formatoMoneda(asignacion.aseguradora?.costo)}</td>
                            <td className="text-center">{formatoMoneda(asignacion.aseguradora?.venta)}</td>
                            </tr>
                        </tbody>
                    </Table>
                </Accordion.Body>
              </Accordion.Item>
              
            </Accordion>
          </Col>
        </Row>
        
        
      </Card.Body>
    </Card>
  );
};
export default VerAsignacionCostos;