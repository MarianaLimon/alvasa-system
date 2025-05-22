import React, { useEffect, useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const InformacionEmbarque = ({ onChange, datos = {} }) => {
  const [form, setForm] = useState({
    hbl: '',
    noContenedor: '',
    shipper: '',
    icoterm: '',
    consignatario: '',
    forwarde: '',
    tipo: '',
    pesoBL: '',
    pesoReal: '',
    vessel: '',
    naviera: '',
    pol: '',
    paisOrigen: '',
    pod: '',
    paisDestino: '',
  });

  useEffect(() => {
    if (datos && Object.keys(datos).length > 0) {
      setForm(prev => ({ ...prev, ...datos }));
    }
  }, [datos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nuevoValor = value.toUpperCase();
    const nuevoForm = { ...form, [name]: nuevoValor };
    setForm(nuevoForm);
    if (onChange) onChange(nuevoForm);
  };

  return (
    <div className="container-subform">
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>HBL</Form.Label>
            <Form.Control name="hbl" value={form.hbl} onChange={handleChange} className="text-uppercase" />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>No Contenedor</Form.Label>
            <Form.Control name="noContenedor" value={form.noContenedor} onChange={handleChange} className="text-uppercase" />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>SHIPPER</Form.Label>
            <Form.Control name="shipper" value={form.shipper} onChange={handleChange} className="text-uppercase" />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>ICOTERM</Form.Label>
            <Form.Control name="icoterm" value={form.icoterm} onChange={handleChange} className="text-uppercase" />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Consignatario</Form.Label>
            <Form.Control name="consignatario" value={form.consignatario} onChange={handleChange} className="text-uppercase" />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>FORWARDE</Form.Label>
            <Form.Control name="forwarde" value={form.forwarde} onChange={handleChange} className="text-uppercase" />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Tipo</Form.Label>
            <Form.Select name="tipo" value={form.tipo} onChange={handleChange} className="text-uppercase">
              <option value="">Seleccionar</option>
              <option value="53">53</option>
              <option value="20">20</option>
              <option value="40">40</option>
              <option value="N/A">N/A</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Peso BL</Form.Label>
            <Form.Control name="pesoBL" value={form.pesoBL} onChange={handleChange} className="text-uppercase" />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Peso Real</Form.Label>
            <Form.Control name="pesoReal" value={form.pesoReal} onChange={handleChange} className="text-uppercase" />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>VESSEL</Form.Label>
            <Form.Control name="vessel" value={form.vessel} onChange={handleChange} className="text-uppercase" />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Naviera</Form.Label>
            <Form.Select name="naviera" value={form.naviera} onChange={handleChange} className="text-uppercase">
              <option value="">Seleccionar</option>
              {['CMA','MSC','ONE','PIL','HMM','MAERSK','EVERGREEN','ZIM','HAPAG','LLOYD','COSCO','YANG MING','BAL','EMIRATES SKYCARGO'].map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>POL</Form.Label>
            <Form.Select name="pol" value={form.pol} onChange={handleChange} className="text-uppercase">
              <option value="">Seleccionar</option>
              {['SHEKOU','TIANJIN','KEELUNG TAIWAN','YANTIAN','QUINGDAO','SHANGAI','XINGANG','QINGDAO','NINGBO','PORT KLANG','ZHONGSHAN','FUZHOU','N/A','LB','GÖTEBORG','SHENZHEN','DALIAN','YANGON','XIAMEN','SANTOS','HAIPHONG','NAGOYA','BUSAN','HONG KONG'].map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>País Origen</Form.Label>
            <Form.Select name="paisOrigen" value={form.paisOrigen} onChange={handleChange} className="text-uppercase">
              <option value="">Seleccionar</option>
              {['CHINA','MALAYSIA','GUANGDONG','N/A','USA','SUECIA','AUSTRALIA','MYANMAR','BRASIL','VIETNAM','JAPÓN','COREA'].map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>POD</Form.Label>
            <Form.Select name="pod" value={form.pod} onChange={handleChange} className="text-uppercase">
              <option value="">Seleccionar</option>
              {['LZC','N/A','CDMX','PUEBLA','TOLUCA','SAN DIEGO','GUANAJUATO','LB','LA','VERACRUZ'].map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>País Destino</Form.Label>
            <Form.Select name="paisDestino" value={form.paisDestino} onChange={handleChange} className="text-uppercase">
              <option value="">Seleccionar</option>
              {['MEX','USA','N/A'].map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};

export default InformacionEmbarque;