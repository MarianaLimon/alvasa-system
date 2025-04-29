import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Card, Spinner } from 'react-bootstrap';

const EditarCotizacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    folio: '',
    cliente: '',
    empresa: '',
    fecha: '',
    mercancia: '',
    monto_comisionista: 0,
    estatus: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerCotizacion = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/cotizaciones/${id}`);
        setForm(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener cotización:', error);
        setLoading(false);
      }
    };
    obtenerCotizacion();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'monto_comisionista' ? parseFloat(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/cotizaciones/${id}`, form);
      alert('Cotización actualizada exitosamente ✅');
      navigate('/cotizaciones');
    } catch (error) {
      console.error('Error al actualizar cotización:', error);
      alert('Hubo un error al actualizar la cotización ❌');
    }
  };

  if (loading) return <div className="text-center my-4"><Spinner animation="border" /></div>;

  return (
    <Card className="container mt-4">
      <Card.Body>
        <h3 className="mb-4">Editar Cotización</h3>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Folio</Form.Label>
            <Form.Control type="text" name="folio" value={form.folio} disabled />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Cliente</Form.Label>
            <Form.Control type="text" name="cliente" value={form.cliente} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Empresa</Form.Label>
            <Form.Control type="text" name="empresa" value={form.empresa} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fecha</Form.Label>
            <Form.Control type="date" name="fecha" value={form.fecha.split('T')[0]} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mercancía</Form.Label>
            <Form.Control type="text" name="mercancia" value={form.mercancia} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Comisión</Form.Label>
            <Form.Control type="number" step="0.01" name="monto_comisionista" value={form.monto_comisionista} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Estatus</Form.Label>
            <Form.Select name="estatus" value={form.estatus} onChange={handleChange}>
              <option value="">Seleccionar...</option>
              <option value="Autorizada">Autorizada</option>
              <option value="En negociación">En negociación</option>
              <option value="Entregado a cliente">Entregado a cliente</option>
              <option value="Declinada">Declinada</option>
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-center mt-4">
            <Button type="submit" variant="success">
              Actualizar Cotización
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default EditarCotizacion;