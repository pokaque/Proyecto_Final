import * as React from 'react';
import { createTheme, styled } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import LogoutIcon from '@mui/icons-material/Logout';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { Box, Typography, Button } from '@mui/material';
import { auth } from '../Firebase/Firebase';
import ListaUsuarios from '../Components/ListaUsuarios';
import ListaProyectosCoordinador from '../Components/ListaProyectosCoordinador';
import SchoolIcon from '@mui/icons-material/School';

const NAVIGATION = [
  { kind: 'header', title: 'Coordinador' },
  { segment: 'inicio', title: 'Inicio', icon: <DashboardIcon /> },
  { segment: 'usuarios', title: 'Gestión de Usuarios', icon: <GroupIcon /> },
  { segment: 'proyectos', title: 'Proyectos', icon: <AssignmentTurnedInIcon /> },
  { segment: 'cerrar-sesion', title: 'Cerrar sesión', icon: <LogoutIcon /> },
];

const demoTheme = createTheme({
  colorSchemes: { light: true, dark: true },
  cssVariables: { colorSchemeSelector: 'class' },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 600, lg: 1200, xl: 1536 },
  },
});

function useDemoRouter(initialPath) {
  const [pathname, setPathname] = React.useState(initialPath);

  const router = React.useMemo(() => ({
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
  }), [pathname]);

  return router;
}

const Skeleton = styled('div')(({ theme, height }) => ({
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
  height,
  content: '" "',
}));

export default function CoordinadorInicio(props) {
  const router = useDemoRouter('/inicio');

  return (
    <AppProvider navigation={NAVIGATION} router={router} theme={demoTheme}>
      <DashboardLayout>
        <PageContainer>

          {/* INICIO */}
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
              <Box
                sx={{
                  flex: 1,
                  backgroundImage: 'url("https://diariodelcaqueta.com/wp-content/uploads/2020/11/118616050_1179924225724878_5318037865065320266_n.jpg")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  minHeight: 300,
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
                  backdropFilter: 'blur(10px)',
                  backgroundColor: 'rgba(15, 23, 42, 0.7)',
                }}
              >
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  🧑‍💼 ¡Bienvenido, Coordinador!
                </Typography>

                <Typography variant="h6" sx={{ maxWidth: 600 }}>
                  Desde este panel puedes supervisar todos los proyectos escolares, gestionar usuarios, y cambiar el estado de los proyectos con observaciones.
                </Typography>

                <Box mt={5} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <SchoolIcon sx={{ fontSize: 40, color: '#60a5fa' }} />
                  <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                    "Dirigir no es imponer, es orientar con sabiduría." — Anónimo
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* GESTIÓN DE USUARIOS */}
          {router.pathname === '/usuarios' && (
            <Box p={2}>
              <Typography variant="h5" gutterBottom>Gestión de Usuarios</Typography>
              <ListaUsuarios />
            </Box>
          )}

          {/* GESTIÓN DE PROYECTOS */}
          {router.pathname === '/proyectos' && (
            <Box p={2}>
              <Typography variant="h5" gutterBottom>Gestión de Proyectos</Typography>
              <ListaProyectosCoordinador />
            </Box>
          )}

        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}
