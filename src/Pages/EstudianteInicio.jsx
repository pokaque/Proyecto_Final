import * as React from 'react';
import { createTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { Box, Typography, Button, Fade } from '@mui/material';
import { auth } from '../Firebase/Firebase';
import { useNavigate } from 'react-router-dom';
import ListaProyectosAsignados from '../Components/ListaProyectosAsignados';
import SchoolIcon from '@mui/icons-material/School';

const NAVIGATION = [
  {
    kind: 'header',
    title: 'Estudiante',
  },
  {
    segment: 'inicio',
    title: 'Inicio',
    icon: <DashboardIcon />,
  },
  {
    segment: 'proyectos-asignados',
    title: 'Mis Proyectos',
    icon: <ListAltIcon />,
  },
  {
    segment: 'cerrar-sesion',
    title: 'Cerrar sesión',
    icon: <LogoutIcon />,
  },
];

const demoTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3b82f6',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

function useDemoRouter(initialPath) {
  const [pathname, setPathname] = React.useState(initialPath);

  const router = React.useMemo(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => {
        if (path === '/cerrar-sesion') {
          auth.signOut();
          window.location.href = '/login';
        } else {
          setPathname(String(path));
        }
      },
    };
  }, [pathname]);

  return router;
}

function EstudianteInicio() {
  const router = useDemoRouter('/inicio');

  return (
    <AppProvider navigation={NAVIGATION} router={router} theme={demoTheme}>
      <DashboardLayout>
        <PageContainer>
          {router.pathname === '/inicio' && (
            <Fade in timeout={500}>
              <Box
                sx={{
                  minHeight: '75vh',
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  background: 'linear-gradient(to right, #0f172a, #1e293b)',
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: 8,
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    backgroundImage: 'url("/img/estudiante-banner.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: 300,
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    },
                  }}
                />
                <Box
                  sx={{
                    flex: 2,
                    color: 'white',
                    p: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    backdropFilter: 'blur(10px)',
                    transition: 'background 0.3s ease',
                  }}
                >
                  <Typography variant="h3" fontWeight="bold" gutterBottom>
                    Bienvenido, Estudiante
                  </Typography>
                  <Typography variant="h6" sx={{ maxWidth: 600 }}>
                    Aquí podrás <strong>consultar el estado de tus proyectos</strong>, revisar los avances y mantenerte al día con tus actividades escolares.
                  </Typography>
                  <Box mt={4}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<ListAltIcon />}
                      onClick={() => router.navigate('/proyectos-asignados')}
                    >
                      Ver Mis Proyectos
                    </Button>
                  </Box>
                  <Box mt={5} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <SchoolIcon sx={{ fontSize: 40, color: '#3b82f6' }} />
                    <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                      "La educación es el arma más poderosa que puedes usar para cambiar el mundo." — Nelson Mandela
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Fade>
          )}

          {router.pathname === '/proyectos-asignados' && (
            <Box p={2}>
              <Typography variant="h5" gutterBottom>Mis Proyectos Asignados</Typography>
              <ListaProyectosAsignados />
            </Box>
          )}

        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}

export default EstudianteInicio;
