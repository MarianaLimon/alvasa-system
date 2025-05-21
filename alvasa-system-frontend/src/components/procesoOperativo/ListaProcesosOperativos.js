import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Form, InputGroup, Toast, ToastContainer } from 'react-bootstrap';
import { BsEye, BsPencil, BsTrash, BsSearch } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

const ListaProcesosOperativos = () => {
  const [procesos, setProcesos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerProcesos = async () => {
      try {
        const { data } = await axios.get('http://localhost:5050/procesos-operativos');
        setProcesos(data);
      } catch (error) {
        console.error('Error al obtener procesos operativos:', error);
      } 
    };
    obtenerProcesos();
  }, []);

  const manejarVer = id => navigate(`/procesos-operativos/${id}`);
  const manejarEditar = id => navigate(`/procesos-operativos/editar/${id}`);

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

  const procesosFiltrados = procesos.filter(proc =>
    proc.cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
    proc.folio_proceso?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const formatoFechaBonita = (fechaStr) => {
    if (!fechaStr) return '—';
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return '—';

    const dia = fecha.getUTCDate().toString().padStart(2, '0');
    const mes = fecha.getUTCMonth(); // 0-based
    const año = fecha.getUTCFullYear();

    const mesNombres = [
        'enero','febrero','marzo','abril','mayo','junio',
        'julio','agosto','septiembre','octubre','noviembre','diciembre'
    ];

    return `${dia} ${mesNombres[mes]} ${año}`;
    };

  return (
    <div className="container mt-4">
      <div className="d-flex mb-3 align-items-center">
        <InputGroup className="w-auto">
          <Form.Control
            type="text"
            placeholder="Buscar por cliente o folio"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <InputGroup.Text><BsSearch /></InputGroup.Text>
        </InputGroup>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Folio</th>
            <th>Cliente</th>
            <th>Naviera</th>
            <th>Contenedor</th>
            <th>País Origen</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {procesosFiltrados.map(proc => (
            <tr key={proc.id}>
              <td>{proc.folio_proceso}</td>
              <td>{proc.cliente}</td>
              <td>{proc.naviera}</td>
              <td>{proc.no_contenedor}</td>
              <td>{proc.pais_origen}</td>
              <td>{formatoFechaBonita(proc.fecha_alta)}</td>
              <td className="text-center">
                <Button variant="info" size="sm" className="me-2" onClick={() => manejarVer(proc.id)}><BsEye /></Button>
                <Button variant="warning" size="sm" className="me-2" onClick={() => manejarEditar(proc.id)}><BsPencil /></Button>
                <Button variant="danger" size="sm" onClick={() => manejarEliminar(proc.id)}><BsTrash /></Button>
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