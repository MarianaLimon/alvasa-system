import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, Table } from 'react-bootstrap';

const ListaAbonos = () => {
  const { numero_control } = useParams();
  const [abonos, setAbonos] = useState([]);
  const [montoOriginal, setMontoOriginal] = useState(0);

  useEffect(() => {
    const fetchAbonos = async () => {
      try {
        const res = await axios.get(`http://localhost:5050/pagos-proveedores/abonos/${numero_control}`);
        setAbonos(res.data);
      } catch (error) {
        console.error('Error al obtener abonos:', error);
      }
    };

    const fetchMontoOriginal = async () => {
      try {
        const res = await axios.get('http://localhost:5050/pagos-proveedores');
        const fila = res.data.find(row => row.numero_control === numero_control);
        if (fila) setMontoOriginal(parseFloat(fila.monto));
      } catch (error) {
        console.error('Error al obtener monto original:', error);
      }
    };

    fetchAbonos();
    fetchMontoOriginal();
  }, [numero_control]);

  const totalAbonado = abonos.reduce((sum, abono) => sum + parseFloat(abono.abono), 0);
  const saldo = montoOriginal - totalAbonado;

  return (
    <div className="container mt-4">
      <Card className="mb-4">
        <Card.Body>
          <h5><strong>Número de control:</strong> {numero_control}</h5>
          <p><strong>Monto original:</strong> ${montoOriginal.toFixed(2)}</p>
          <p><strong>Total abonado:</strong> ${totalAbonado.toFixed(2)}</p>
          <p><strong>Saldo:</strong> ${saldo.toFixed(2)}</p>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header><strong>Lista de Abonos</strong></Card.Header>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Monto</th>
                <th>Fecha de Pago</th>
                <th>Tipo de Transacción</th>
              </tr>
            </thead>
            <tbody>
              {abonos.length === 0 ? (
                <tr><td colSpan="3">No hay abonos registrados.</td></tr>
              ) : (
                abonos.map((abono, i) => (
                  <tr key={i}>
                    <td>${parseFloat(abono.abono).toFixed(2)}</td>
                    <td>{new Date(abono.fecha_pago).toLocaleDateString('es-MX')}</td>
                    <td>{abono.tipo_transaccion}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ListaAbonos;