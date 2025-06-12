import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Row, Col } from 'react-bootstrap';
import { BsCalculator, BsClipboard, BsPeople, BsCurrencyDollar } from 'react-icons/bs';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

const Home = () => {
  const [clientsCount, setClientsCount] = useState(0);
  const [quotesCount, setQuotesCount] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [negotiationCount, setNegotiationCount] = useState(0);
  const [authorizedCount, setAuthorizedCount] = useState(0);
  const [procesosCount, setProcesosCount] = useState(0);
  const [procesos, setProcesos] = useState([]);
  const [asignacionesCount, setAsignacionesCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [clientesRes, cotizacionesRes, procesosRes, asignacionesRes] = await Promise.all([
          axios.get(`${API_URL}/clientes`),
          axios.get(`${API_URL}/cotizaciones`),
          axios.get(`${API_URL}/procesos-operativos`),
          axios.get(`${API_URL}/asignacion-costos`)
        ]);

        const clientes = Array.isArray(clientesRes.data) ? clientesRes.data : [];
        const cotizaciones = Array.isArray(cotizacionesRes.data) ? cotizacionesRes.data : [];
        const procesos = Array.isArray(procesosRes.data) ? procesosRes.data : [];
        const asignaciones = Array.isArray(asignacionesRes.data) ? asignacionesRes.data : [];

        setClientsCount(clientes.length);
        setQuotesCount(cotizaciones.length);
        setProcesos(procesos);
        setProcesosCount(procesos.length);

        setDeliveredCount(cotizaciones.filter(c => c.estatus === 'Entregado a cliente').length);
        setNegotiationCount(cotizaciones.filter(c => c.estatus === 'En negociación').length);
        setAuthorizedCount(cotizaciones.filter(c => c.estatus === 'Autorizada').length);

        setAsignacionesCount(asignaciones.length);

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
              <div className="col-md-4"><BsCalculator className="icon" /></div>
              <div className="col-md-8">
                <Card.Title className="dashboard-card-key-title">Cotizaciones</Card.Title>
                <Card.Text className="dashboard-card-key-number">{quotesCount}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="dashboard-card border-delivered">
            <Card.Body className="d-flex align-items-center">
              <div className="col-md-6"><Card.Title className="dashboard-card-title">Entregado a cliente</Card.Title></div>
              <div className="col-md-6"><Card.Text className="dashboard-card-number">{deliveredCount}</Card.Text></div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="dashboard-card border-negociacion">
            <Card.Body className="d-flex align-items-center">
              <div className="col-md-6"><Card.Title className="dashboard-card-title">En negociación</Card.Title></div>
              <div className="col-md-6"><Card.Text className="dashboard-card-number">{negotiationCount}</Card.Text></div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="dashboard-card border-autorizadas">
            <Card.Body className="d-flex align-items-center">
              <div className="col-md-6"><Card.Title className="dashboard-card-title">Autorizadas</Card.Title></div>
              <div className="col-md-6"><Card.Text className="dashboard-card-number">{authorizedCount}</Card.Text></div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Segunda fila: Columna izquierda (Clientes y Procesos) + derecha (Ejecutivos) */}
      <Row className="g-4 mt-4">
        <Col md={3}>
          <Row className="g-4">
            <Col md={12}>
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

            <Col md={12}>
              <Card className="dashboard-card border-procesos">
                <Card.Body className="d-flex align-items-center">
                  <div className="col-md-4"><BsClipboard className="icon" /></div>
                  <div className="col-md-8">
                    <Card.Title className="dashboard-card-key-title">Procesos</Card.Title>
                    <Card.Text className="dashboard-card-key-number">{procesosCount}</Card.Text>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={12}>
              <Card className="dashboard-card border-asignaciones">
                <Card.Body className="d-flex align-items-center">
                  <div className="col-md-4"><BsCurrencyDollar className="icon" /></div>
                  <div className="col-md-8">
                    <Card.Title className="dashboard-card-key-title">Asignaciones</Card.Title>
                    <Card.Text className="dashboard-card-key-number">{asignacionesCount}</Card.Text>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>

        <Col md={9}>
          <div className='cont-ejecutivos'>
            <h5 className="mb-3 cont-ejecutivos-title">Procesos por ejecutivo</h5>
            <Row className="g-3">
              {Object.entries(
                procesos.reduce((acc, proc) => {
                  const ejecutivo = proc.ejecutivo_cuenta || '—';
                  acc[ejecutivo] = (acc[ejecutivo] || 0) + 1;
                  return acc;
                }, {})
              ).map(([ejecutivo, count], idx) => {
                const colores = ['#17a2b8', '#ffc107', '#198754', '#5751ab'];
                const color = colores[idx % colores.length];
                return (
                  <Col xs={12} sm={6} md={6} lg={3} key={ejecutivo}>
                    <Card style={{ backgroundColor: color, border: 'none', color: 'white' }}>
                      <Card.Body className="text-center">
                        <div className="img-ejecutivo mx-auto mb-2">
                          <BsPeople />
                        </div>
                        <div className="fw-bold">{ejecutivo}</div>
                        <div>{count} proceso(s)</div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
