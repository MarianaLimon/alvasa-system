import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Row, Col } from 'react-bootstrap';
import { BsClipboard, BsPeople, BsBox } from 'react-icons/bs';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

const Home = () => {
  const [clientsCount, setClientsCount] = useState(0);
  const [quotesCount, setQuotesCount] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);
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
        setDeliveredCount(
          cotizaciones.filter(c => c.estatus === 'Entregado a cliente').length
        );
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
    <div className="container container-cards">
      {/* Primera fila: Cotizaciones y estados */}
      <Row className="g-4 mb-4 align-items-center">
        <Col md={3}>
          <Card className="dashboard-card border-cotizaciones">
            <Card.Body className="d-flex align-items-center">
              <div className="col-md-4"><BsClipboard className="icon" /></div>
              <div className="col-md-8">
                <Card.Title className="dashboard-card-key-title">Cotizaciones</Card.Title>
                <Card.Text className="dashboard-card-key-number">{quotesCount}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Separator 
        <Col md="auto" className="d-flex justify-content-center">
          <div className="separator" />
        </Col>*/}

        <Col md={3}>
          <Card className="dashboard-card border-delivered">
            <Card.Body className="d-flex align-items-center">
              <div className="col-md-9"><Card.Title className="dashboard-card-title">Entregado a cliente</Card.Title></div>
              <div className="col-md-3"><Card.Text className="dashboard-card-number">{deliveredCount}</Card.Text></div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="dashboard-card border-negociacion">
            <Card.Body className="d-flex align-items-center">
              <div className="col-md-9"><Card.Title className="dashboard-card-title">En negociación</Card.Title></div>
              <div className="col-md-3"><Card.Text className="dashboard-card-number">{negotiationCount}</Card.Text></div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="dashboard-card border-autorizadas">
            <Card.Body className="d-flex align-items-center">
              <div className="col-md-9"><Card.Title className="dashboard-card-title">Autorizadas</Card.Title></div>
              <div className="col-md-3"><Card.Text className=" dashboard-card-number">{authorizedCount}</Card.Text></div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Segunda fila: Clientes */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="dashboard-card border-clientes">
            <Card.Body className="d-flex align-items-center">
              <div className="col-md-4"><BsPeople className="icon" /></div>
              <div className="col-md-8">
                <Card.Title className="dashboard-card-key-title">Clientes</Card.Title>
                <Card.Text className="dashboard-card-key-number">{clientsCount}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tercera fila: Contenedores */}
      <Row className="g-4">
        <Col md={3}>
          <Card className="dashboard-card border-proximamente">
            <Card.Body className="d-flex align-items-center">
              <div className="col-md-4"><BsBox className="icon" /></div>
              <div className="col-md-8">
                <Card.Title className="dashboard-card-key-title">Contenedores</Card.Title>
                <Card.Text className="text-muted">Próximamente</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
