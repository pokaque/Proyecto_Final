import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Link as MuiLink, Alert } from '@mui/material';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../Firebase/Firebase';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import GoogleIcon from '@mui/icons-material/Google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const userDoc = await getDoc(doc(db, 'users', uid));
      const userData = userDoc.data();
      redirectByRole(userData?.rol);
    } catch (error) {
      setError('Usuario o contraseña incorrecta.');
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

  const redirectByRole = (rol) => {
    if (rol === 'coordinador') navigate('/coordinador');
    else if (rol === 'docente') navigate('/docente');
    else navigate('/estudiante');
  };

  const createUserIfNotExists = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        nombre: user.displayName,
        correo: user.email,
        rol: 'estudiante' // rol por defecto
      });
    }
    return getDoc(userRef);
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const userDoc = await createUserIfNotExists(result.user);
      const userData = userDoc.data();
      redirectByRole(userData?.rol);
    } catch (error) {
      setError('Error al iniciar sesión con Google.');
    }
  };

  // const handleFacebookLogin = async () => {
  //   try {
  //     setError('');
  //     const result = await signInWithPopup(auth, new FacebookAuthProvider());
  //     const userDoc = await createUserIfNotExists(result.user);
  //     const userData = userDoc.data();
  //     redirectByRole(userData?.rol);
  //   } catch (error) {
  //     setError('Error al iniciar sesión con Facebook.');
  //   }
  // };

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
        <Box sx={{ flex: 1, p: 4, backgroundColor: 'rgba(0, 0, 0, 0.9)', color: 'white' }}>
          <Typography variant="h2" gutterBottom>Bienvenido</Typography>
          <Typography variant="h5">
            📲 Inicia sesión para gestionar y hacer seguimiento a los proyectos escolares de investigación.
          </Typography>
        </Box>

        <Box sx={{ flex: 1, p: 4, bgcolor: 'white' }}>
          <Typography variant="h5" gutterBottom>Iniciar sesión</Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Correo electrónico"
              type="email"
              autoComplete="email"
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
              autoComplete="current-password"
              margin="normal"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              required
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
              Ingresar
            </Button>
          </form>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mt: 3,
              mb: 2,
            }}
          >
            <Box sx={{ flex: 1, height: '1px', backgroundColor: 'gray' }} />
            <Typography sx={{ px: 2, color: 'gray' }}>o</Typography>
            <Box sx={{ flex: 1, height: '1px', backgroundColor: 'gray' }} />
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Button
              variant="outlined"
              color="info"
              onClick={handleGoogleLogin}
              sx={{
                borderRadius: 2,
              }}
            >
              <GoogleIcon />
            </Button>

          </Box>


          <Button onClick={handleGoogleLogin} variant="outlined" fullWidth sx={{ mt: 2 }}>
            Iniciar sesión con Google
          </Button>

          {/* <Button onClick={handleFacebookLogin} variant="outlined" fullWidth sx={{ mt: 1 }}>
            Iniciar sesión con Facebook
          </Button> */}

          <Box mt={2} textAlign="center">
            <MuiLink href="/registro" underline="hover">
              ¿No tienes cuenta? Regístrate
            </MuiLink>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
