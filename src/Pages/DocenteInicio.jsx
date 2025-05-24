import * as React from 'react';
import { createTheme, styled } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import Grid from '@mui/material/Grid';
import { Box, Typography, Button } from '@mui/material';
import { auth } from '../Firebase/Firebase';
import { useNavigate } from 'react-router-dom';
import FormularioProyecto from '../Components/FormularioProyecto';
import ListaProyectos from '../Components/ListaProyectos';
import SchoolIcon from '@mui/icons-material/School';

const NAVIGATION = [
  {
    kind: 'header',
    title: 'Docente',
  },
  {
    segment: 'inicio',
    title: 'Inicio',
    icon: <DashboardIcon />,
  },
  {
    segment: 'crear-proyecto',
    title: 'Crear Proyecto',
    icon: <AddCircleOutlineIcon />,
  },
  {
    segment: 'mis-proyectos',
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
  colorSchemes: { light: true, dark: true },
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
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

const Skeleton = styled('div')(({ theme, height }) => ({
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
  height,
  content: '" "',
}));

export default function DocenteInicio(props) {
  const router = useDemoRouter('/inicio');

  return (
    <AppProvider navigation={NAVIGATION} router={router} theme={demoTheme}>
      <DashboardLayout>
        <PageContainer>
          {router.pathname === '/inicio' && (
            <Box
              sx={{
                minHeight: '75vh',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                background: 'linear-gradient(to right, #0f172a, #1e293b)',
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: 5,
              }}
            >
              {/* Imagen decorativa */}
              <Box
                sx={{
                  flex: 1,
                  backgroundImage: 'url("/docente.png")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  minHeight: 300,
                }}
              />

              {/* Contenido del panel */}
              <Box
                sx={{
                  flex: 1,
                  color: 'white',
                  p: 5,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  backgroundColor: 'rgba(15, 23, 42, 0.7)',
                }}
              >
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  👨‍🏫 ¡Bienvenido, Docente!
                </Typography>

                <Typography variant="h6" sx={{ maxWidth: 600 }}>
                  Esta plataforma te permite <strong>crear, gestionar y acompañar</strong> los proyectos escolares de investigación con facilidad. ¡Activa el aprendizaje colaborativo!
                </Typography>

                <Box mt={4} display="flex" gap={3} flexWrap="wrap">
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => router.navigate('/crear-proyecto')}
                  >
                    Crear Proyecto
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<ListAltIcon />}
                    sx={{ borderColor: 'white', color: 'white' }}
                    onClick={() => router.navigate('/mis-proyectos')}
                  >
                    Mis Proyectos
                  </Button>
                </Box>

                {/* Mensaje inspiracional */}
                <Box mt={5} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <SchoolIcon sx={{ fontSize: 40, color: '#60a5fa' }} />
                  <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                    "La educación es el arma más poderosa que puedes usar para cambiar el mundo." — Nelson Mandela
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}


          {router.pathname === '/crear-proyecto' && (
            <Box p={2}>
              <Typography variant="h5" gutterBottom>Crear nuevo proyecto</Typography>
              <FormularioProyecto />
            </Box>
          )}


          {router.pathname === '/mis-proyectos' && (
            <Box p={2}>
              <Typography variant="h5" gutterBottom>Mis Proyectos</Typography>
              <ListaProyectos />
            </Box>
          )}

        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}
