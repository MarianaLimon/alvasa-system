import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { BsDownload } from 'react-icons/bs';
import './styles/data-export.css';

const API = process.env.REACT_APP_API || 'http://localhost:5050';

const endpoints = {
  operaciones: `${API}/reportes/csv/operaciones-cargos-extra`,
  proveedores: `${API}/reportes/csv/pagos-proveedores`,
  // 👇 NUEVO
  proveedoresRealizados: `${API}/reportes/csv/pagos-proveedores-realizados`,
  clientesServicios: `${API}/reportes/csv/cobros-data-servicios`,
  clientesPagos: `${API}/reportes/csv/cobros-data-pagos`,
  procesosAsignacion: `${API}/reportes/csv/procesos-asignacion-detalle`,
};

function TileButton({ href, title, caption = 'CSV', color = 'is-cyan' }) {
  return (
    <a
      className={`export-btn ${color}`}
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      <span className="icon-bubble">
        <BsDownload size={22} />
      </span>
      <span className="btn-title uppercase">{title}</span>
      <span className="btn-caption">{caption}</span>
    </a>
  );
}

export default function DataExport() {
  return (
    <div className="container-page data-export">
      <div className="header-row">
        <h3 className="title-export">Data Export</h3>
      </div>

      <Row xs={1} md={3} className="g-3">
        {/* Col 1: Operaciones y cargos extra */}
        <Col>
          <Card className="export-card shadow-sm">
            <Card.Body>
              <h5 className="section-title">Operaciones y cargos extra</h5>
              <TileButton
                href={endpoints.procesosAsignacion}
                title="Procesos + Asignación (detalle)"
                caption="CSV"
                color="is-cyan"
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Col 2: Pagos a Proveedores */}
        <Col>
          <Card className="export-card shadow-sm">
            <Card.Body>
              <h5 className="section-title">Pagos a Proveedores</h5>
              <div className="btn-grid-vertical">
                <TileButton
                  href={endpoints.proveedores}
                  title="General (todos)"
                  caption="CSV"
                  color="is-amber"
                />
                {/* 👇 NUEVO botón */}
                <TileButton
                  href={endpoints.proveedoresRealizados}
                  title="Solo pagos realizados"
                  caption="CSV"
                  color="is-coco"
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Col 3: Pagos de Clientes */}
        <Col>
          <Card className="export-card shadow-sm">
            <Card.Body>
              <h5 className="section-title">Pagos de Clientes</h5>
              <div className="btn-grid-vertical">
                <TileButton
                  href={endpoints.clientesServicios}
                  title="Data servicios"
                  caption="CSV"
                  color="is-indigo"
                />
                <TileButton
                  href={endpoints.clientesPagos}
                  title="Data pagos"
                  caption="CSV"
                  color="is-green"
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
