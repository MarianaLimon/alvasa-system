import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Clientes from './components/clientes/Clientes';

function App() {
  return (
    <div className="App">
      <div className="p-4">
        <h1 className="titulo-principal">ALVASA SYSTEM</h1>
        <h2 className="subtitulo">Clientes</h2>
      </div>
      <Clientes />
    </div>
  );
}

export default App;