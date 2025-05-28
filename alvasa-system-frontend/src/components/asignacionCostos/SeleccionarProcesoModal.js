// src/components/asignacionCostos/SeleccionarProcesoModal.js
import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SeleccionarProcesoModal = ({ mostrar, onSeleccionar }) => {
  const [procesos, setProcesos] = useState([]);
  const [idSeleccionado, setIdSeleccionado] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (mostrar) {
      axios.get('http://localhost:5050/procesos-operativos')
        .then(res => {
          const procesosOrdenados = res.data.sort((a, b) => {
            const numA = parseInt(a.folio_proceso.match(/\d+/)?.[0] || '0');
            const numB = parseInt(b.folio_proceso.match(/\d+/)?.[0] || '0');
            return numB - numA;
          });
          setProcesos(procesosOrdenados);
        })
        .catch(err => {
          console.error('Error al obtener procesos:', err);
        });
    }
  }, [mostrar]);

  const handleSeleccionar = () => {
    if (idSeleccionado) {
      onSeleccionar(idSeleccionado);
    }
  };

  const handleCerrar = () => {
    navigate('/procesos-operativos');
  };

  return (
    <Modal show={mostrar} backdrop="static" centered>
      <Modal.Header>
        <Modal.Title>Selecciona un Proceso Operativo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Folio de Proceso</Form.Label>
          <Form.Select
            value={idSeleccionado}
            onChange={(e) => setIdSeleccionado(e.target.value)}
          >
            <option value="">Seleccionar folio...</option>
            {procesos.map(proceso => (
              <option key={proceso.id} value={proceso.id}>
                {proceso.folio_proceso} - {proceso.cliente_nombre}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCerrar}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleSeleccionar}
          disabled={!idSeleccionado}
        >
          Continuar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SeleccionarProcesoModal;
