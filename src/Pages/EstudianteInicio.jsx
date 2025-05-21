import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { auth } from '../Firebase/Firebase';
import { useNavigate } from 'react-router-dom';

const EstudianteInicio = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Bienvenido, Estudiante</Typography>
      <Typography>Esta es tu página de inicio. Aquí verás tus proyectos asignados.</Typography>
      <Button variant="outlined" onClick={handleLogout} sx={{ mt: 2 }}>Cerrar sesión</Button>
    </Box>
  );
};

export default EstudianteInicio;
