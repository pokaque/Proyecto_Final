import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link as MuiLink,
  MenuItem,
  Alert,
} from '@mui/material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../Firebase/Firebase';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('estudiante');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email,
        rol,
        nombre,
      });

      alert('Usuario registrado correctamente');
      navigate('/login');
    } catch (error) {
      setError('Error al registrar: ' + error.message);
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
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h2" gutterBottom>
            Únete a la plataforma
          </Typography>
          <Typography variant="h5">
            Crea tu cuenta para empezar a registrar tus proyectos escolares de investigación.
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            p: 4,
            bgcolor: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',  // CENTRAR verticalmente el formulario dentro de este Box
          }}

        >
          <Typography variant="h5" gutterBottom>Registrarse</Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleRegister}>
            <TextField
              fullWidth
              label="Nombre completo"
              margin="normal"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                setError('');
              }}
              required
            />
            <TextField
              fullWidth
              label="Correo electrónico"
              margin="normal"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
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
                setError('');
              }}
              required
            />
            <TextField
              select
              label="Rol"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              fullWidth
              margin="normal"
            >
              <MenuItem value="estudiante">Estudiante</MenuItem>
              <MenuItem value="docente">Docente</MenuItem>
              <MenuItem value="coordinador">Coordinador</MenuItem>
            </TextField>
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
              Registrarse
            </Button>
          </form>

          <Box mt={2} textAlign="center">
            <MuiLink href="/login" underline="hover">
              ¿Ya tienes cuenta? Inicia sesión
            </MuiLink>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register