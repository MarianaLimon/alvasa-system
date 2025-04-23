import React from 'react';

const DetallesCliente = ({ cliente }) => {
  return (
    <div>
      <h2>Detalles del Cliente</h2>
      {cliente ? (
        <div>
          <p><strong>Nombre:</strong> {cliente.nombre}</p>
          <p><strong>Dirección:</strong> {cliente.direccion}</p>
          <p><strong>Teléfono:</strong> {cliente.telefono}</p>
          <p><strong>Email:</strong> {cliente.email}</p>
        </div>
      ) : (
        <p>No se encontró el cliente.</p>
      )}
    </div>
  );
};

export default DetallesCliente;
