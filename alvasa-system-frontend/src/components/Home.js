import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Row, Col } from 'react-bootstrap';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Home = () => {
  const [clientsCount, setClientsCount] = useState(0);
  const [quotesCount, setQuotesCount] = useState(0);
  const [negotiationCount, setNegotiationCount] = useState(0);
  const [authorizedCount, setAuthorizedCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [clientesRes, cotizacionesRes] = await Promise.all([
          axios.get(`${API_URL}/clientes`),
          axios.get(`${API_URL}/cotizaciones`),
        ]);

        const clientes = Array.isArray(clientesRes.data) ? clientesRes.data : [];
        const cotizaciones = Array.isArray(cotizacionesRes.data) ? cotizacionesRes.data : [];

        setClientsCount(clientes.length);
        setQuotesCount(cotizaciones.length);
        setNegotiationCount(
          cotizaciones.filter(c => c.estatus === 'En negociación').length
        );
        setAuthorizedCount(
          cotizaciones.filter(c => c.estatus === 'Autorizada').length
        );
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Dashboard</h1>

      {/* Primera fila: Clientes */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card>
            <Card.Body className="text-center">
              <Card.Title>Clientes</Card.Title>
              <Card.Text className="display-4">{clientsCount}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Segunda fila: Cotizaciones, En negociación, Autorizadas */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card>
            <Card.Body className="text-center">
              <Card.Title>Cotizaciones</Card.Title>
              <Card.Text className="display-4">{quotesCount}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card>
            <Card.Body className="text-center">
              <Card.Title>En negociación</Card.Title>
              <Card.Text className="display-4">{negotiationCount}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card>
            <Card.Body className="text-center">
              <Card.Title>Autorizadas</Card.Title>
              <Card.Text className="display-4">{authorizedCount}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tercera fila: Contenedores */}
      <Row className="g-4">
        <Col md={3}>
          <Card>
            <Card.Body className="text-center">
              <Card.Title>Contenedores</Card.Title>
              <Card.Text className="text-muted">Próximamente</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;