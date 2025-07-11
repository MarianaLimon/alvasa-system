import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Spinner, Card, Form, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import { BsBoxSeam, BsCalendar, BsPerson, BsPlusCircle, BsDashCircle } from 'react-icons/bs';
import './ListaPagosProveedores.css';
import ModalPago from './ModalPago';

const ListaPagosProveedores = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [gruposAbiertos, setGruposAbiertos] = useState({});
  const [girosAbiertosPorGrupo, setGirosAbiertosPorGrupo] = useState({});
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null);
  const navigate = useNavigate();

  const fetchPagos = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5050/pagos-proveedores');
      
      const pagos = res.data;

      setPagos(pagos);
    } catch (error) {
      console.error('Error al cargar la lista de pagos:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchPagos();
  }, []);

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

  const pagosFiltrados = pagos.filter((p) =>
    p.cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.proveedor?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.numero_control?.toString().includes(busqueda)
  );

  const pagosAgrupados = pagosFiltrados.reduce((acc, pago) => {
    const [parte1, parte2] = pago.numero_control.split('-');
    const grupo = `${parte1}-${parte2}`;
    if (!acc[grupo]) acc[grupo] = [];
    acc[grupo].push(pago);
    return acc;
  }, {});

  return (
    <Card className="mt-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <strong>Lista de Pagos a Proveedores</strong>
        <Form style={{ maxWidth: '300px' }}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Buscar por cliente o proveedor..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </InputGroup>
        </Form>
      </Card.Header>

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

              return (
                <Card key={grupo} className="m-3">
                  <Card.Header
                    onClick={() => toggleGrupo(grupo)}
                    style={{ cursor: 'pointer', background: '#5751AB', color: '#fff'}}
                  >
                     <strong>{grupo}</strong>
                      <span className="mx-3">|</span>
                      <BsBoxSeam className="me-3" />
                      {contenedor}
                      <span className="mx-3">|</span>
                      <BsPerson className="me-3" />
                      {cliente}
                      <span className="mx-3">|</span>
                      <BsCalendar className="me-3" />
                      {fecha}
                    <span style={{ float: 'right' }}>{abierto ? '▼' : '▶'}</span>
                  </Card.Header>
                  <div className={`collapse-wrapper ${abierto ? 'expanded' : 'collapsed'}`}>
                    <Table bordered responsive className="mb-0 custom-pagos-table">
                      <thead>
                        <tr className="listapagos-titles">
                          <th># Control</th>
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

                            return (
                            <React.Fragment key={clave}>
                                <tr onClick={() => toggleGiro(grupo, giro)}>
                                <td colSpan="10" className="giro-header-cell">
                                    <strong>{giro}</strong>
                                    <span style={{ float: 'right' }}>
                                    {abiertoGiro ? <BsDashCircle color="#414180" /> : <BsPlusCircle color="#414180" />}
                                    </span>
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
                                        className="btn btn-sm btn-success me-1"
                                        onClick={() =>
                                            abrirModalPago(pago.numero_control, parseFloat(pago.saldo))
                                        }
                                        >
                                        Pagar
                                        </button>
                                        <button
                                        className="btn btn-sm btn-outline-primary"
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
