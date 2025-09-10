import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Spinner, Card, Form, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import { BsBoxSeam, BsCalendar, BsPerson, BsPlusCircle, BsDashCircle, BsCashStack, BsSearch } from 'react-icons/bs';
import './styles/ListaPagosProveedores.css';
import ModalPago from './ModalPago';
import FiltrosPagosProveedores from './FiltrosPagosProveedores';


const ListaPagosProveedores = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [gruposAbiertos, setGruposAbiertos] = useState({});
  const [girosAbiertosPorGrupo, setGirosAbiertosPorGrupo] = useState({});
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null);
  const [proveedoresUnicos, setProveedoresUnicos] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');
  const [giroSeleccionado, setGiroSeleccionado] = useState('');
  const [conceptoSeleccionado, setConceptoSeleccionado] = useState('');
  const [filtroEstatus, setFiltroEstatus] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [totalesGenerales, setTotalesGenerales] = useState([]);

  const navigate = useNavigate();

  const fetchPagos = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5050/pagos-proveedores';

      if (proveedorSeleccionado) {
        url += `?proveedor=${encodeURIComponent(proveedorSeleccionado)}`;
      }

      const res = await axios.get(url);
      const pagos = res.data;

      setPagos(pagos);

      const proveedores = [...new Set(pagos.map((p) => p.proveedor))].filter(Boolean);
      setProveedoresUnicos(proveedores);
    } catch (error) {
      console.error('Error al cargar la lista de pagos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotales = async () => {
    try {
      const res = await axios.get('http://localhost:5050/pagos-proveedores/totales');
      setTotalesGenerales(res.data); // ← esto asume que ya recibes array de objetos con número_control_general, monto_total_en_pesos, etc.
    } catch (error) {
      console.error('Error al obtener totales generales:', error);
    }
  };

  useEffect(() => {
    fetchPagos();
    fetchTotales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proveedorSeleccionado]);

  const toggleGrupo = (grupo) => {
    setGruposAbiertos((prev) => ({
      ...prev,
      [grupo]: !prev[grupo],
    }));
  };

  const toggleGiro = (grupo, giro) => {
    const clave = `${grupo}|${giro}`;
    setGirosAbiertosPorGrupo((prev) => ({
      ...prev,
      [clave]: !prev[clave],
    }));
  };

  const abrirModalPago = (numeroControl, saldo) => {
    setPagoSeleccionado({ numeroControl, saldo });
    setMostrarModalPago(true);
  };

  const cerrarModalPago = () => {
    setMostrarModalPago(false);
    setPagoSeleccionado(null);
  };

  const guardarPago = async (pago) => {
    try {
      if (parseFloat(pago.abono) > parseFloat(pago.saldo_restante)) {
        return alert('El abono no puede ser mayor al saldo restante');
      }

      await axios.post('http://localhost:5050/pagos-proveedores/abonos', {
        numero_control: pago.numero_control,
        abono: pago.abono,
        fecha_pago: pago.fecha_pago,
        tipo_transaccion: pago.tipo_transaccion
      });

      cerrarModalPago();
      alert('Pago guardado correctamente');
      
      await fetchPagos(); // 🔄 Refrescar la lista de pagos

    } catch (error) {
      console.error('Error al guardar el abono:', error);
      alert('Error al guardar el abono');
    }
  };

  const pagosFiltrados = pagos
  
    .filter((p) =>
      p.cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.proveedor?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.numero_control?.toString().includes(busqueda)
    )
    .filter((p) => !filtroEstatus || p.estatus === filtroEstatus)
    .filter((p) => !proveedorSeleccionado || p.proveedor === proveedorSeleccionado)
    .filter((p) => {
      if (!fechaDesde && !fechaHasta) return true;

      const fechaPago = new Date(p.fecha.replace(/(\d{2}) (\w+) (\d{4})/, (m, d, mes, y) => {
        const meses = {
          'Enero': '01', 'Febrero': '02', 'Marzo': '03', 'Abril': '04',
          'Mayo': '05', 'Junio': '06', 'Julio': '07', 'Agosto': '08',
          'Septiembre': '09', 'Octubre': '10', 'Noviembre': '11', 'Diciembre': '12'
        };
        return `${y}-${meses[mes]}-${d}`;
      }));

      const desde = fechaDesde ? new Date(fechaDesde) : null;
      const hasta = fechaHasta ? new Date(fechaHasta) : null;

      if (desde && fechaPago < desde) return false;
      if (hasta && fechaPago > hasta) return false;
      return true;
    })
    .filter((p) => !giroSeleccionado || p.giro === giroSeleccionado)
    .filter((p) => !conceptoSeleccionado || p.concepto === conceptoSeleccionado)

  const totalFiltradoPesos = pagosFiltrados.reduce((acc, p) => acc + (parseFloat(p.pesos) || 0), 0);
  const totalFiltradoAbonado = pagosFiltrados.reduce((acc, p) => {
    const abono = parseFloat(p.pesos) || 0;
    const saldo = parseFloat(p.saldo) || 0;
    return acc + (abono - saldo);
  }, 0);
  const totalFiltradoSaldo = pagosFiltrados.reduce((acc, p) => acc + (parseFloat(p.saldo) || 0), 0);


  const pagosAgrupados = pagosFiltrados.reduce((acc, pago) => {
    const [parte1, parte2] = pago.numero_control.split('-');
    const grupo = `${parte1}-${parte2}`;
    if (!acc[grupo]) acc[grupo] = [];
    acc[grupo].push(pago);
    return acc;
  }, {});

  return (
    <Card className="mt-4">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <h5 className="mb-2 mb-md-0">Lista de proveedores</h5>
          <InputGroup style={{ maxWidth: '250px' }}>
            <InputGroup.Text><BsSearch /></InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Buscar"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </InputGroup>
        </div>
      </Card.Header>

      <FiltrosPagosProveedores
        proveedorSeleccionado={proveedorSeleccionado}
        setProveedorSeleccionado={setProveedorSeleccionado}
        proveedoresUnicos={proveedoresUnicos}
        filtroEstatus={filtroEstatus}
        setFiltroEstatus={setFiltroEstatus}
        fechaDesde={fechaDesde}
        setFechaDesde={setFechaDesde}
        fechaHasta={fechaHasta}
        setFechaHasta={setFechaHasta}
        giroSeleccionado={giroSeleccionado}
        setGiroSeleccionado={setGiroSeleccionado}
        conceptoSeleccionado={conceptoSeleccionado}
        setConceptoSeleccionado={setConceptoSeleccionado}
        conceptosPorGiro={Object.fromEntries(
          Object.entries(pagos.reduce((acc, p) => {
            if (!acc[p.giro]) acc[p.giro] = new Set();
            acc[p.giro].add(p.concepto);
            return acc;
          }, {})).map(([g, conceptos]) => [g, [...conceptos]])
        )}
        girosUnicos={[...new Set(pagos.map(p => p.giro).filter(Boolean))]}
        onLimpiarFiltros={() => {
          setBusqueda('');
          setFiltroEstatus('');
          setProveedorSeleccionado('');
          setFechaDesde('');
          setFechaHasta('');
          setGiroSeleccionado('');
          setConceptoSeleccionado('');
        }}
        onGenerarPDF={() => alert('Generar PDF con filtros (pendiente)')}
      />

      {/* Totales generales después de aplicar filtros */}
      <div className="totales-pagos-container">
        <div className="totales-pagos-box">
          <div className="totales-pagos-item">
            Total en pesos: <span className="text-primary total-filter">${totalFiltradoPesos.toFixed(2)}</span>
          </div>
          <div className="totales-pagos-item">
            Total abonado: <span className="text-success total-filter">${totalFiltradoAbonado.toFixed(2)}</span>
          </div>
          <div className="totales-pagos-item">
            Saldo total: <span className="text-danger total-filter">${totalFiltradoSaldo.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Card.Body className="p-0">
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
         ) : (
          <div>
            {Object.entries(pagosAgrupados).map(([grupo, pagosGrupo]) => {
              const abierto = gruposAbiertos[grupo] || false;
              const { cliente, contenedor, fecha } = pagosGrupo[0];
              
              const totalesGrupo = totalesGenerales.find(t => t.numero_control_general === grupo);

              const totalPesosGrupo = parseFloat(totalesGrupo?.monto_total_en_pesos) || 0;
              const saldoGrupo = parseFloat(totalesGrupo?.saldo_total) || 0;

              const estatusGrupo = totalesGrupo?.estatus_general || 'Pendiente';

              return (
                <Card key={grupo} className="m-3">
                  <Card.Header
                    onClick={() => toggleGrupo(grupo)}
                    style={{ cursor: 'pointer', background: '#5751AB', color: '#fff', fontSize: '.9rem'}}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{grupo}</strong>
                        <span className="mx-3">|</span>
                        <BsBoxSeam className="me-2" />
                        {contenedor}
                        <span className="mx-3">|</span>
                        <BsPerson className="me-2" />
                        {cliente}
                        <span className="mx-3">|</span>
                        <BsCalendar className="me-2" />
                        {fecha}
                        <span className="mx-3">|</span>
                        <span className="fw-bold" style={{ fontSize: '1.1rem', color: 'rgb(26, 224, 255)' }}>
                        <BsCashStack className="me-1" />
                        ${totalPesosGrupo.toFixed(2)}
                      </span>
                      </div>
                      
                      <div className="d-flex align-items-center gap-3">
                        Saldo total:
                        <span className="fw-bold" style={{ fontSize: '1.1rem', color: '#ffc107' }}>
                           ${saldoGrupo.toFixed(2)}
                        </span>
                        <span className={`badge ${estatusGrupo === 'Saldado' ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {estatusGrupo}
                        </span>
                        <span>{abierto ? '▼' : '▶'}</span>
                      </div>

                    </div>
                  </Card.Header>

                  <div className={`collapse-wrapper ${abierto ? 'expanded' : 'collapsed'}`}>
                    <Table bordered responsive className="mb-0 custom-pagos-table">
                      <thead>
                        <tr className="listapagos-titles">
                          <th style={{ minWidth: 120 }}># Control</th>
                          <th>Giro</th>
                          <th>Proveedor</th>
                          <th>Concepto de Pago</th>
                          <th>Monto</th>
                          <th className="col-moneda">T. Moneda</th>
                          <th className="col-cambio">T. Cambio</th>
                          <th>Pesos</th>
                          <th>Saldo</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>

                      <tbody>
                        {Object.entries(
                            pagosGrupo.reduce((acc, pago) => {
                            if (!acc[pago.giro]) acc[pago.giro] = [];
                            acc[pago.giro].push(pago);
                            return acc;
                            }, {})
                        ).map(([giro, pagosPorGiro]) => {
                            const clave = `${grupo}|${giro}`;
                            const abiertoGiro = girosAbiertosPorGrupo[clave] || false;

                            const totalPesosGiro = pagosPorGiro.reduce((acc, p) => acc + (parseFloat(p.pesos) || 0), 0);
                            const saldoGiro = pagosPorGiro.reduce((acc, p) => acc + (parseFloat(p.saldo) || 0), 0);
                            const estatusGiro = saldoGiro === 0 ? 'Saldado' : 'Pendiente';


                            return (
                            <React.Fragment key={clave}>
                                
                                <tr onClick={() => toggleGiro(grupo, giro)}>
                                  <td colSpan="10" className="giro-header-cell">
                                    <div className="d-flex justify-content-between align-items-center">
                                      {/* Giro y total */}
                                      <div className="d-flex align-items-center gap-3">
                                        <strong className="text-dark">{giro}</strong> | 
                                        <span className="fw-bold" style={{ fontSize: '1.2rem', color: '#5751AB' }}>
                                          <BsCashStack className="me-1" />
                                          ${totalPesosGiro.toFixed(2)}
                                        </span>
                                      </div>

                                      {/* Saldo total + estatus + toggle */}
                                      <div className="d-flex align-items-center gap-3">
                                        Saldo total:<span className="fw-bold" style={{ fontSize: '1.2rem', color: 'rgb(108, 7, 255)' }}>
                                           ${saldoGiro.toFixed(2)}
                                        </span>
                                        <span className={`badge ${estatusGiro === 'Saldado' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                          {estatusGiro}
                                        </span>
                                        <span>{abiertoGiro ? <BsDashCircle color="#414180" /> : <BsPlusCircle color="#414180" />}</span>
                                      </div>
                                    </div>
                                  </td>
                                </tr>

                                {abiertoGiro &&
                                pagosPorGiro.map((pago, idx) => (
                                    <tr key={`${pago.numero_control}-${idx}`}>
                                    <td>{pago.numero_control}</td>
                                    <td>{pago.giro}</td>
                                    <td>{pago.proveedor}</td>
                                    <td>{pago.concepto}</td>
                                    <td>${parseFloat(pago.monto).toFixed(2)}</td>

                                    <td>
                                        <input
                                        type="text"
                                        className="form-control form-control-sm text-uppercase"
                                        value={pago.tipo_moneda || ''}
                                        onChange={(e) => {
                                            const nuevoValor = e.target.value.toUpperCase();
                                            setPagos((prevPagos) =>
                                            prevPagos.map((p) =>
                                                p.numero_control === pago.numero_control
                                                ? { ...p, tipo_moneda: nuevoValor }
                                                : p
                                            )
                                            );
                                        }}
                                        onBlur={async (e) => {
                                            const nuevoValor = e.target.value.toUpperCase();
                                            try {
                                            await axios.put(`http://localhost:5050/pagos-proveedores/estado/${pago.numero_control}`, {
                                                tipo_moneda: nuevoValor,
                                                tipo_cambio: pago.tipo_cambio,
                                            });
                                            await fetchPagos(); // 🔄 Ya no se dispara mientras escribes, solo al salir del campo
                                            } catch (error) {
                                            console.error('Error al actualizar tipo de moneda:', error);
                                            }
                                        }}
                                        />
                                    </td>

                                    <td>
                                    <InputGroup size="sm">
                                        <InputGroup.Text>$</InputGroup.Text>
                                        <Form.Control
                                        type="number"
                                        className="form-control-sm"
                                        value={
                                            pago.tipo_cambio === null || pago.tipo_cambio === undefined || pago.tipo_cambio === 0
                                            ? ''
                                            : parseFloat(pago.tipo_cambio).toFixed(2)
                                        }
                                        placeholder="—"
                                        step="1.00"
                                        min="0"
                                        onChange={(e) => {
                                            const nuevoValor = e.target.value;
                                            setPagos((prevPagos) =>
                                            prevPagos.map((p) =>
                                                p.numero_control === pago.numero_control
                                                ? { ...p, tipo_cambio: nuevoValor }
                                                : p
                                            )
                                            );
                                        }}
                                        onBlur={async (e) => {
                                            const nuevoValor = parseFloat(e.target.value) || 0;
                                            try {
                                            await axios.put(`http://localhost:5050/pagos-proveedores/estado/${pago.numero_control}`, {
                                                tipo_moneda: pago.tipo_moneda,
                                                tipo_cambio: nuevoValor,
                                            });
                                            await fetchPagos();
                                            } catch (error) {
                                            console.error('Error al actualizar tipo de cambio:', error);
                                            }
                                        }}
                                        />
                                    </InputGroup>
                                    </td>

                                    <td>$
                                    {!isNaN(Number(pago.pesos))
                                        ? Number(pago.pesos).toFixed(2)
                                        : '0.00'}
                                    </td>

                                    <td>
                                        ${parseFloat(pago.saldo).toFixed(2)}{' '}
                                        {pago.estatus === 'Saldado' ? (
                                        <span className="badge bg-success ms-2">Saldado</span>
                                        ) : (
                                        <span className="badge bg-warning text-dark ms-2">Pendiente</span>
                                        )}
                                    </td>

                                    <td>
                                        <button
                                        className="btn btn-sm btn-success me-1 btn-action mb-1"
                                        onClick={() =>
                                            abrirModalPago(pago.numero_control, parseFloat(pago.saldo))
                                        }
                                        >
                                        Pagar
                                        </button>
                                        <button
                                        className="btn btn-sm btn-primary btn-action mb-1"
                                        onClick={() =>
                                            navigate(`/pagos-proveedores/${pago.numero_control}`)
                                        }
                                        >
                                        Pagos
                                        </button>
                                    </td>
                                    </tr>
                                ))}
                            </React.Fragment>
                            );
                        })}
                        </tbody>

                    </Table>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card.Body>
      {pagoSeleccionado && (
        <ModalPago
          mostrar={mostrarModalPago}
          onCerrar={cerrarModalPago}
          numeroControl={pagoSeleccionado.numeroControl}
          saldo={pagoSeleccionado.saldo}
          onGuardar={guardarPago}
        />
      )}
    </Card>
  );
};

export default ListaPagosProveedores;
