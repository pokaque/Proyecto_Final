import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import Register from './Pages/Register';
import EstudianteInicio from './Pages/EstudianteInicio';
import DocenteInicio from './Pages/DocenteInicio';
import CoordinadorInicio from './Pages/CoordinadorInicio';
import HitosProyecto from './Pages/HitosProyecto';
import CompletarRegistro from './Pages/CompletarRegistro';
import './App.css';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/estudiante" element={<EstudianteInicio />} />
      <Route path="/docente" element={<DocenteInicio />} />
      <Route path="/coordinador" element={<CoordinadorInicio />} />
      <Route path="/proyecto/:id/hitos" element={<HitosProyecto />} />
      <Route path="/completar-registro" element={<CompletarRegistro />} />

    </Routes>
  </Router>
);

export default App;
