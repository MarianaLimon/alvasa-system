import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Card, Spinner } from 'react-bootstrap';
import { BsArrowLeft } from 'react-icons/bs';

const VerProcesoOperativo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proceso, setProceso] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProceso = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5050/procesos-operativos/${id}`);
        setProceso(data);
      } catch (error) {
        console.error('Error al obtener proceso operativo:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProceso();
  }, [id]);

 const formatoFecha = (fechaStr) => {
  if (!fechaStr) return '—';
  const fecha = new Date(fechaStr);
  if (isNaN(fecha.getTime())) return '—';

  const dia = fecha.getUTCDate().toString().padStart(2, '0');
  const mes = fecha.getUTCMonth(); // 0-indexed
  const anio = fecha.getUTCFullYear();

  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${dia} ${meses[mes]} ${anio}`;
};

  if (loading) return <div className="text-center my-4"><Spinner animation="border" /></div>;
  if (!proceso) return <div className="text-center mt-4">Proceso no encontrado</div>;

  return (
    <div className="container mt-4">
        <Button variant="secondary" className="mb-3" onClick={() => navigate(-1)}>
        <BsArrowLeft /> Volver
        </Button>

        {/* Primera fila: 3 columnas */}
        <div className="row">
        <div className="col-md-4 mb-3">
            <Card>
            <Card.Header><strong>Datos Generales</strong></Card.Header>
            <Card.Body>
                <p><strong>Folio:</strong> {proceso.folio_proceso}</p>
                <p><strong>Cliente ID:</strong> {proceso.cliente_id}</p>
                <p><strong>Fecha Alta:</strong> {formatoFecha(proceso.fecha_alta)}</p>
                <p><strong>Mercancía:</strong> {proceso.mercancia}</p>
                <p><strong>Tipo de importación:</strong> {proceso.tipo_importacion}</p>
                <p><strong>ETD:</strong> {formatoFecha(proceso.etd)}</p>
                <p><strong>Observaciones:</strong> {proceso.observaciones}</p>
            </Card.Body>
            </Card>
        </div>

        <div className="col-md-4 mb-3">
            <Card>
            <Card.Header><strong>Información del Embarque</strong></Card.Header>
            <Card.Body>
                <p><strong>Contenedor:</strong> {proceso.informacion_embarque?.no_contenedor}</p>
                <p><strong>HBL:</strong> {proceso.informacion_embarque?.hbl}</p>
                <p><strong>Naviera:</strong> {proceso.informacion_embarque?.naviera}</p>
                <p><strong>Shipper:</strong> {proceso.informacion_embarque?.shipper}</p>
                <p><strong>País Origen:</strong> {proceso.informacion_embarque?.pais_origen}</p>
                <p><strong>País Destino:</strong> {proceso.informacion_embarque?.pais_destino}</p>
            </Card.Body>
            </Card>
        </div>

        <div className="col-md-4 mb-3">
            <Card>
            <Card.Header><strong>Proceso de Revalidación</strong></Card.Header>
            <Card.Body>
                <p><strong>MBL:</strong> {proceso.proceso_revalidacion?.mbl}</p>
                <p><strong>ETA:</strong> {formatoFecha(proceso.proceso_revalidacion?.eta)}</p>
                <p><strong>Descarga:</strong> {formatoFecha(proceso.proceso_revalidacion?.descarga)}</p>
                <p><strong>Terminal:</strong> {proceso.proceso_revalidacion?.terminal}</p>
                <p><strong>Revalidación:</strong> {formatoFecha(proceso.proceso_revalidacion?.revalidacion)}</p>
                <p><strong>Recepción/envío docs:</strong> {formatoFecha(proceso.proceso_revalidacion?.recepcion_envio_docs)}</p>
            </Card.Body>
            </Card>
        </div>
        </div>

        {/* Segunda fila: 2 columnas */}
        <div className="row">
        <div className="col-md-6 mb-3">
            <Card>
            <Card.Header><strong>Datos de Pedimento</strong></Card.Header>
            <Card.Body>
                <p><strong>Pedimento:</strong> {proceso.datos_pedimento?.pedimento}</p>
                <p><strong>Pago Pedimento:</strong> {formatoFecha(proceso.datos_pedimento?.pago_pedimento)}</p>
                <p><strong>Régimen:</strong> {proceso.datos_pedimento?.regimen}</p>
                <p><strong>AA Despacho:</strong> {proceso.datos_pedimento?.aa_despacho}</p>
                <p><strong>Agente Aduanal:</strong> {proceso.datos_pedimento?.agente_aduanal}</p>
            </Card.Body>
            </Card>
        </div>

        <div className="col-md-6 mb-3">
            <Card>
            <Card.Header><strong>Salida y Retorno del Contenedor</strong></Card.Header>
            <Card.Body>
                <p><strong>Salida Aduana:</strong> {proceso.salida_retorno_contenedor?.salida_aduana}</p>
                <p><strong>Entrega:</strong> {proceso.salida_retorno_contenedor?.entrega}</p>
                <p><strong>Fecha Máx:</strong> {formatoFecha(proceso.salida_retorno_contenedor?.f_max)}</p>
                <p><strong>Entrega Vacío:</strong> {proceso.salida_retorno_contenedor?.entrega_vacio}</p>
                <p><strong>Condiciones Contenedor:</strong> {proceso.salida_retorno_contenedor?.condiciones_contenedor}</p>
                <p><strong>Terminal Vacío:</strong> {proceso.salida_retorno_contenedor?.terminal_vacio}</p>
            </Card.Body>
            </Card>
        </div>
        </div>
    </div>
    );

};

export default VerProcesoOperativo;
