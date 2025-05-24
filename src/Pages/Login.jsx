// // src/Pages/Login.jsx
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Link as MuiLink, Alert } from '@mui/material'; // Se agregó Alert
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../Firebase/Firebase';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Nuevo estado para manejar el error
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError(""); // Limpia errores anteriores
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const userDoc = await getDoc(doc(db, 'users', uid));
      const userData = userDoc.data();
      if (userData.rol === 'coordinador') navigate('/coordinador');
      else if (userData.rol === 'docente') navigate('/docente');
      else navigate('/estudiante');
    } catch (error) {
      setError('Error al iniciar sesión Usuario o Contraseña Incorrecta: ');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url("/fondo.png")',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      {/* Capa borrosa encima de la imagen */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backdropFilter: 'blur(5px)',
          backgroundColor: 'rgba(0, 0, 0, 0.67)',
          zIndex: 1,
        }}
      />

      <Paper
        elevation={6}
        sx={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 1000,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          overflow: 'hidden',
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            flex: 1,
            p: 4,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
          }}
        >
          <Typography variant="h2" gutterBottom>
            Bienvenido
          </Typography>
          <Typography variant="h5">
            📲 Inicia sesión para gestionar y hacer seguimiento a los proyectos escolares de investigación.
          </Typography>
        </Box>

        <Box sx={{ flex: 1, p: 4, bgcolor: 'white' }}>
          <Typography variant="h5" gutterBottom>Iniciar sesión</Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Correo electrónico"
              margin="normal"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              required
            />
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              margin="normal"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              required
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Ingresar</Button>
          </form>

          <Box mt={2} textAlign="center">
            <MuiLink href="/registro" underline="hover">¿No tienes cuenta? Regístrate</MuiLink>
          </Box>
        </Box>
      </Paper>
    </Box>

  );
};

export default Login;
