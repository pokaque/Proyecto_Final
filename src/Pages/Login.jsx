import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Link as MuiLink, Alert } from '@mui/material'; // Se agregó Alert
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../Firebase/Firebase';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup, GithubAuthProvider } from 'firebase/auth';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';

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
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const uid = result.user.uid;
      const userDoc = await getDoc(doc(db, 'users', uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.rol === 'coordinador') navigate('/coordinador');
        else if (userData.rol === 'docente') navigate('/docente');
        else navigate('/estudiante');
      } else {
        // Usuario nuevo, redirigir a completar registro
        navigate('/completar-registro', {
          state: {
            uid,
            email: result.user.email,
            nombre: result.user.displayName,
          },
        });
      }
    } catch (error) {
      setError('Error al iniciar sesión con Google.');
    }
  };

  const handleGitHubLogin = async () => {
    const provider = new GithubAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const uid = result.user.uid;
      const userDoc = await getDoc(doc(db, 'users', uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.rol === 'coordinador') navigate('/coordinador');
        else if (userData.rol === 'docente') navigate('/docente');
        else navigate('/estudiante');
      } else {
        // Usuario nuevo, redirigir a completar registro
        navigate('/completar-registro', {
          state: {
            uid,
            email: result.user.email,
            nombre: result.user.displayName,
          },
        });
      }
    } catch (error) {
      setError('Error al iniciar sesión con GitHub.');
      console.error(error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url("/fondo.png")',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundAttachment: { xs: 'scroll', md: 'fixed' }, // Cambiado para móviles
        position: 'relative',
      }}
    >
      {/* Fondo borroso que crece con el contenido */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          minHeight: '100%',
          height: '100%',
          backdropFilter: 'blur(5px)',
          backgroundColor: 'rgba(0, 0, 0, 0.67)',
          zIndex: 1,
        }}
      />

      {/* Contenedor scrollable con contenido */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center', // Centrado en todos los dispositivos
          px: { xs: 1, sm: 2 },
          py: { xs: 2, sm: 4, md: 6 },
          minHeight: '100vh',
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: '100%',
            maxWidth: { xs: '100%', sm: 500, md: 1000 }, // Responsive maxWidth
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            overflow: 'hidden',
            borderRadius: { xs: 2, md: 3 }, // Bordes más pequeños en móvil
            margin: 0, // Sin margen para que se centre perfectamente
          }}
        >
          <Box
            sx={{
              flex: 1,
              p: { xs: 1.5, sm: 2, md: 4 }, // Padding más pequeño en móvil
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              color: 'white',
              minHeight: { xs: 'auto', md: 'auto' },
            }}
          >
            <Typography
              variant="h4" // Cambiado de h2 a h4 para móviles
              sx={{
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                mb: { xs: 1, md: 2 }
              }}
            >
              Bienvenido
            </Typography>
            <Typography
              variant="h6" // Cambiado de h5 a h6
              sx={{
                fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' },
                lineHeight: { xs: 1.3, md: 1.5 }
              }}
            >
              📲 Inicia sesión para gestionar y hacer seguimiento a los proyectos escolares de investigación.
            </Typography>
          </Box>

          <Box sx={{
            flex: 1,
            p: { xs: 1.5, sm: 2, md: 4 }, // Padding más pequeño en móvil
            bgcolor: 'white'
          }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.5rem' },
                mb: { xs: 1, md: 2 }
              }}
            >
              Iniciar sesión
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: { xs: 1, md: 2 } }}>
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
                size="small" // Tamaño más pequeño para móviles
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '0.9rem', md: '1rem' }
                  }
                }}
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
                size="small" // Tamaño más pequeño para móviles
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '0.9rem', md: '1rem' }
                  }
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  mt: { xs: 1.5, md: 2 },
                  py: { xs: 1, md: 1.5 },
                  fontSize: { xs: '0.9rem', md: '1rem' }
                }}
              >
                Ingresar
              </Button>
            </form>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mt: { xs: 2, md: 3 },
                mb: { xs: 1.5, md: 2 },
              }}
            >
              <Box sx={{ flex: 1, height: '1px', backgroundColor: 'gray' }} />
              <Typography sx={{ px: 2, color: 'gray', fontSize: { xs: '0.8rem', md: '1rem' } }}>o</Typography>
              <Box sx={{ flex: 1, height: '1px', backgroundColor: 'gray' }} />
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: { xs: 2, md: 3 },
              }}
            >
              <Button
                variant="outlined"
                color="info"
                onClick={handleGoogleLogin}
                sx={{
                  borderRadius: 2,
                  minWidth: { xs: '45px', md: 'auto' },
                  p: { xs: 1, md: 1.5 }
                }}
              >
                <GoogleIcon fontSize={window.innerWidth < 600 ? "small" : "medium"} />
              </Button>
              <Button
                variant="outlined"
                color="info"
                onClick={handleGitHubLogin}
                sx={{
                  borderRadius: 2,
                  minWidth: { xs: '45px', md: 'auto' },
                  p: { xs: 1, md: 1.5 }
                }}
              >
                <GitHubIcon fontSize={window.innerWidth < 600 ? "small" : "medium"} />
              </Button>
            </Box>

            <Box
              mt={{ xs: 1.5, md: 2 }}
              textAlign="center"
            >
              <MuiLink
                href="/registro"
                underline="hover"
                sx={{ fontSize: { xs: '0.85rem', md: '1rem' } }}
              >
                ¿No tienes cuenta? Regístrate
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );

};

export default Login;
