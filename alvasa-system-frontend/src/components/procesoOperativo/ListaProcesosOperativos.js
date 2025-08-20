import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Form, InputGroup, Toast, ToastContainer } from 'react-bootstrap';
import { BsEye, BsPencil, BsSearch, BsPrinter } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const ListaProcesosOperativos = () => {
  const [procesos, setProcesos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [ejecutivoSeleccionado, setEjecutivoSeleccionado] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const [filtroAsignacion, setFiltroAsignacion] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerProcesos = async () => {
      try {
        const { data } = await axios.get('http://localhost:5050/procesos-operativos');
        console.log('Primer proceso:', data[0]); 
        const ordenados = data.sort((a, b) => b.id - a.id);
        setProcesos(ordenados);
      } catch (error) {
        console.error('Error al obtener procesos operativos:', error);
      }
    };
    obtenerProcesos();
  }, []);

  const manejarVer = id => navigate(`/procesos-operativos/${id}`);
  const manejarEditar = id => navigate(`/procesos-operativos/editar/${id}`);

  /*
  const manejarEliminar = async id => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este proceso?')) return;
    try {
      await axios.delete(`http://localhost:5050/procesos-operativos/${id}`);
      setProcesos(prev => prev.filter(p => p.id !== id));
      setToastVariant('success');
      setToastMsg('Proceso eliminado correctamente');
      setShowToast(true);
    } catch (error) {
      console.error(error);
      setToastVariant('danger');
      setToastMsg('Error al eliminar el proceso');
      setShowToast(true);
    }
  };
  */

  const renderTooltip = (msg) => (
    <Tooltip className='tooltip-lista'>{msg}</Tooltip>
  );

  const manejarImprimir = async (id) => {
    try {
      const url = `http://localhost:5050/procesos-operativos/pdf/${id}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      setToastVariant('danger');
      setToastMsg('Error al generar PDF del proceso');
      setShowToast(true);
    }
  };

  const clientesUnicos = [...new Set(procesos.map(p => p.cliente).filter(Boolean))];
  const ejecutivosUnicos = [...new Set(procesos.map(p => p.ejecutivo_cuenta).filter(Boolean))];

  const procesosFiltrados = procesos.filter(proc => {
    const coincideTexto =
      proc.cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
      proc.folio_proceso?.toLowerCase().includes(busqueda.toLowerCase());

    const coincideCliente =
      clienteSeleccionado === '' || proc.cliente === clienteSeleccionado;

    const coincideEjecutivo =
      ejecutivoSeleccionado === '' || proc.ejecutivo_cuenta === ejecutivoSeleccionado;

    const coincideAsignacion =
      filtroAsignacion === ''
        ? true
        : filtroAsignacion === 'con'
          ? proc.tiene_asignacion === 1
          : proc.tiene_asignacion === 0;

    return coincideTexto && coincideCliente && coincideEjecutivo && coincideAsignacion;
  });

  const formatoFechaBonita = (fechaStr) => {
    if (!fechaStr) return '—';
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return '—';

    const dia = fecha.getUTCDate().toString().padStart(2, '0');
    const mes = fecha.getUTCMonth();
    const año = fecha.getUTCFullYear();

    const mesNombres = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    return `${dia} ${mesNombres[mes]} ${año}`;
  };

  return (
    <div className="container mt-4">
      <h1 className='title-procesos'>Alta de Embarques</h1>
      {/* Fila de botones */}
      <div className="d-flex mb-3 gap-2">
        <Button variant="primary" onClick={() => navigate('/procesos-operativos/nuevo')}>
          + Nuevo Proceso
        </Button>
        <Button variant="success" onClick={() => navigate('/asignacion-costos/nuevo')}>
          + Asignar Costos
        </Button>
      </div>

      {/* Fila de filtros */}
      <div className="d-flex mb-2 gap-3 flex-wrap align-items-center">
        <Form.Select
          value={clienteSeleccionado}
          onChange={e => setClienteSeleccionado(e.target.value)}
          className="w-auto"
        >
          <option value="">Todos los clientes</option>
          {clientesUnicos.map(cliente => (
            <option key={cliente} value={cliente}>{cliente}</option>
          ))}
        </Form.Select>

        <Form.Select
          value={ejecutivoSeleccionado}
          onChange={e => setEjecutivoSeleccionado(e.target.value)}
          className="w-auto"
        >
          <option value="">Todos los ejecutivos</option>
          {ejecutivosUnicos.map(ej => (
            <option key={ej} value={ej}>{ej}</option>
          ))}
        </Form.Select>

        <Form.Select
          value={filtroAsignacion}
          onChange={e => setFiltroAsignacion(e.target.value)}
          className="w-auto"
        >
          <option value="">Asignaciones</option>
          <option value="con">Con asignación</option>
          <option value="sin">Sin asignación</option>
        </Form.Select>

        <InputGroup className="w-auto">
          <Form.Control
            type="text"
            placeholder="Buscar por cliente o folio"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <InputGroup.Text style={{ backgroundColor: '#3e3f42', color: 'white', border: '1px solid #555' }}>
            <BsSearch />
          </InputGroup.Text>
        </InputGroup>
      </div>

      <Table className='tabla-procesos'>
        <thead>
          <tr>
            <th>Folio</th>
            <th>Cliente</th>
            <th>Ejecutivo</th>
            <th>Mercancía</th>
            <th>Contenedor</th>
            <th>Fecha</th>
            <th>Acciones Proceso</th>
            <th>Acciones Costos</th>
          </tr>
        </thead>
        <tbody>
          {procesosFiltrados.map(proc => (
            <tr key={proc.id}>
              <td>{proc.folio_proceso}</td>
              <td>{proc.cliente}</td>
              <td>{proc.ejecutivo_cuenta || '—'}</td>
              <td>{proc.mercancia}</td>
              <td>{proc.no_contenedor}</td>
              <td>{formatoFechaBonita(proc.fecha_alta)}</td>

              {/* Acciones del proceso */}
              <td className="text-center">
                <Button variant="primary" size="sm" className="me-2" onClick={() => manejarVer(proc.id)}><BsEye /></Button>
                <Button variant="primary" size="sm" className="me-2" onClick={() => manejarEditar(proc.id)}><BsPencil /></Button>
                <Button variant="secondary" size="sm" className="me-2" onClick={() => manejarImprimir(proc.id)}><BsPrinter /></Button>
              </td>

              {/* Acciones de asignación de costos */}
              <td className="text-center">
                {proc.tiene_asignacion ? (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2"
                      onClick={() => navigate(`/asignacion-costos/ver/${proc.folio_proceso}`)}
                    >
                      <BsEye />
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2"
                      onClick={() => navigate(`/asignacion-costos/editar/${proc.folio_proceso}`)}
                    >
                      <BsPencil />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={async () => {
                        try {
                          const res = await axios.get(`http://localhost:5050/asignacion-costos/proceso/${proc.id}`);
                          const asignacionId = res.data.id;

                          window.open(`http://localhost:5050/asignacion-costos/pdf/${asignacionId}`, '_blank');
                        } catch (error) {
                          console.error('Error al obtener ID de asignación:', error);
                          setToastVariant('danger');
                          setToastMsg('Error al generar PDF de asignación');
                          setShowToast(true);
                        }
                      }}
                    >
                      <BsPrinter />
                    </Button>
                  </>
                ) : (
                  <>
                    <OverlayTrigger placement="top" overlay={renderTooltip('Sin asignación de costos')}>
                      <span className="d-inline-block me-2" style={{ opacity: 0.5 }}>
                        <Button variant="success" size="sm" disabled style={{ pointerEvents: 'none' }}>
                          <BsEye />
                        </Button>
                      </span>
                    </OverlayTrigger>
                    <OverlayTrigger placement="top" overlay={renderTooltip('Sin asignación de costos')}>
                      <span className="d-inline-block me-2" style={{ opacity: 0.5 }}>
                        <Button variant="success" size="sm" disabled style={{ pointerEvents: 'none' }}>
                          <BsPencil />
                        </Button>
                      </span>
                    </OverlayTrigger>
                    <OverlayTrigger placement="top" overlay={renderTooltip('Sin asignación de costos')}>
                      <span className="d-inline-block" style={{ opacity: 0.5 }}>
                        <Button variant="secondary" size="sm" disabled style={{ pointerEvents: 'none' }}>
                          <BsPrinter />
                        </Button>
                      </span>
                    </OverlayTrigger>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>


      <ToastContainer position="top-end" className="p-3">
        <Toast bg={toastVariant} onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
          <Toast.Body className="text-white">{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default ListaProcesosOperativos;