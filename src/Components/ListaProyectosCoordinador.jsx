import React, { useEffect, useState } from 'react';
import {
  collection, getDocs, updateDoc, doc, addDoc, query, orderBy
} from 'firebase/firestore';
import {
  Box, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Tooltip, Alert, Grid
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { db, auth } from '../Firebase/Firebase';
import { generarPDFGeneral } from './GenerarPdfs';
import './ListaProyectosCoordinador.css'; // ✅ Estilos responsivos externos
import HistoryIcon from '@mui/icons-material/History';

const ListaProyectosCoordinador = () => {
  const [proyectos, setProyectos] = useState([]);
  const [filteredProyectos, setFilteredProyectos] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [observacion, setObservacion] = useState('');
  const [historial, setHistorial] = useState([]);
  const [openHistorial, setOpenHistorial] = useState(false);
  const [tituloHistorial, setTituloHistorial] = useState('');
  const [openDetalle, setOpenDetalle] = useState(false);

  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroArea, setFiltroArea] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroInstitucion, setFiltroInstitucion] = useState('');

  // 🔄 Cargar proyectos al iniciar
  const fetchProyectos = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'proyectos'));
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        fechaInicio: doc.data().fechaInicio?.toDate().toISOString().split('T')[0],
      }));
      setProyectos(lista);
      setFilteredProyectos(lista);
    } catch (error) {
      setErrorMsg('Error al cargar los proyectos');
    }
  };

  useEffect(() => {
    fetchProyectos();
  }, []);

  // 🔍 Filtro múltiple en tiempo real
  useEffect(() => {
    let filtrados = proyectos;
    if (filtroNombre)
      filtrados = filtrados.filter(p => p.nombreProyecto?.toLowerCase().includes(filtroNombre.toLowerCase()));
    if (filtroArea)
      filtrados = filtrados.filter(p => p.areaConocimiento === filtroArea);
    if (filtroEstado)
      filtrados = filtrados.filter(p => p.estado === filtroEstado);
    if (filtroInstitucion)
      filtrados = filtrados.filter(p => p.institucion?.toLowerCase().includes(filtroInstitucion.toLowerCase()));
    setFilteredProyectos(filtrados);
  }, [filtroNombre, filtroArea, filtroEstado, filtroInstitucion, proyectos]);

  const handleAbrirDialogo = (row) => {
    setProyectoSeleccionado(row);
    setNuevoEstado(row.estado || '');
    setObservacion('');
    setOpenDialog(true);
  };

  const abrirHistorial = async (proyecto) => {
    try {
      const ref = collection(db, 'proyectos', proyecto.id, 'historialEstados');
      const q = query(ref, orderBy('fechaCambio', 'desc'));
      const snapshot = await getDocs(q);
      const cambios = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        fechaCambio: doc.data().fechaCambio?.toDate().toLocaleString(),
      }));
      setHistorial(cambios);
      setTituloHistorial(proyecto.nombreProyecto);
      setOpenHistorial(true);
    } catch (error) {
      setErrorMsg('No se pudo cargar el historial');
    }
  };

  const handleGuardarEstado = async () => {
    if (!nuevoEstado || !observacion) {
      setErrorMsg('Debes seleccionar un estado y escribir una observación');
      return;
    }
    try {
      const ref = doc(db, 'proyectos', proyectoSeleccionado.id);
      const historialRef = collection(ref, 'historialEstados');
      await addDoc(historialRef, {
        estadoAnterior: proyectoSeleccionado.estado,
        nuevoEstado,
        observacion,
        fechaCambio: new Date(),
        realizadoPor: auth.currentUser?.uid || 'desconocido',
      });
      await updateDoc(ref, {
        estado: nuevoEstado,
        observacionCambioEstado: observacion,
      });
      setSuccessMsg('Estado actualizado correctamente');
      setOpenDialog(false);
      fetchProyectos();
    } catch (error) {
      setErrorMsg('Error al actualizar el estado');
    }
  };

  const handleVerDetalle = (row) => {
    setProyectoSeleccionado(row);
    setOpenDetalle(true);
  };

  const columns = [
    { field: 'nombreProyecto', headerName: 'Nombre', flex: 1 },
    { field: 'areaConocimiento', headerName: 'Área', flex: 1 },
    { field: 'institucion', headerName: 'Institución', flex: 1 },
    { field: 'fechaInicio', headerName: 'Inicio', flex: 1 },
    { field: 'estado', headerName: 'Estado', flex: 1 },
    {
      field: 'acciones',
      headerName: 'Acciones',
      flex: 1,
      minWidth: 200, // ✅ asegura quepan los 3 botones
      disableColumnMenu: true, // ✅ elimina el menú de los 3 puntos
      sortable: false, // ✅ opcional: desactiva ordenamiento innecesario
      renderCell: (params) => (
        <>
          <Tooltip title="Cambiar estado">
            <IconButton onClick={() => handleAbrirDialogo(params.row)}>
              <AssignmentTurnedInIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ver historial">
            <IconButton onClick={() => abrirHistorial(params.row)}>
              <HistoryIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ver detalles">
            <IconButton onClick={() => handleVerDetalle(params.row)}>
              <DescriptionIcon />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];


  return (
    <Box className="lista-proyectos-container">
      <Typography variant="h4" className="lista-proyectos-header">Gestión de Proyectos</Typography>

      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

      {/* 🔍 Filtros de búsqueda */}
      <Grid container spacing={2} className="lista-proyectos-filtros">
        <Grid item xs={12} sm={3}>
          <TextField fullWidth label="Buscar por nombre" value={filtroNombre} onChange={(e) => setFiltroNombre(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField select fullWidth label="Área" value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)}>
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="Ciencias">Ciencias</MenuItem>
            <MenuItem value="Tecnología">Tecnología</MenuItem>
            <MenuItem value="Matemáticas">Matemáticas</MenuItem>
            <MenuItem value="Ciencias Sociales">Ciencias Sociales</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField select fullWidth label="Estado" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="Activo">Activo</MenuItem>
            <MenuItem value="Inactivo">Inactivo</MenuItem>
            <MenuItem value="Formulación">Formulación</MenuItem>
            <MenuItem value="Evaluación">Evaluación</MenuItem>
            <MenuItem value="Finalizado">Finalizado</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField fullWidth label="Buscar por institución" value={filtroInstitucion} onChange={(e) => setFiltroInstitucion(e.target.value)} />
        </Grid>
      </Grid>

      {/* 📤 Exportación PDF */}
      <Box className="lista-proyectos-toolbar">
        <Button
          variant="contained"
          startIcon={<PictureAsPdfIcon />}
          onClick={() => generarPDFGeneral(filteredProyectos)}
        >
          Exportar PDF General
        </Button>
      </Box>

      {/* 🧾 Tabla de proyectos */}
      <Box className="lista-proyectos-grid">
        <DataGrid
          rows={filteredProyectos}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
        />
      </Box>

      {/* 📝 Diálogo de cambio de estado */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>Cambiar estado del proyecto</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Proyecto: <strong>{proyectoSeleccionado?.nombreProyecto}</strong>
          </Typography>
          <TextField fullWidth select label="Nuevo estado" value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)} margin="normal">
            <MenuItem value="Formulación">Formulación</MenuItem>
            <MenuItem value="Evaluación">Evaluación</MenuItem>
            <MenuItem value="Activo">Activo</MenuItem>
            <MenuItem value="Inactivo">Inactivo</MenuItem>
            <MenuItem value="Finalizado">Finalizado</MenuItem>
          </TextField>
          <TextField fullWidth label="Observación" value={observacion} onChange={(e) => setObservacion(e.target.value)} margin="normal" multiline rows={3} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleGuardarEstado} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* 📚 Diálogo de historial */}
      <Dialog open={openHistorial} onClose={() => setOpenHistorial(false)} fullWidth maxWidth="md">
        <DialogTitle>Historial de cambios – {tituloHistorial}</DialogTitle>
        <DialogContent>
          {historial.length === 0 ? (
            <Typography>No hay registros de cambios aún.</Typography>
          ) : (
            historial.map((h, i) => (
              <Box key={i} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
                <Typography><strong>Estado anterior:</strong> {h.estadoAnterior}</Typography>
                <Typography><strong>Nuevo estado:</strong> {h.nuevoEstado}</Typography>
                <Typography><strong>Observación:</strong> {h.observacion}</Typography>
                <Typography><strong>Fecha:</strong> {h.fechaCambio}</Typography>
                <Typography><strong>Responsable:</strong> {h.realizadoPor}</Typography>
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistorial(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* 🔍 Detalles del proyecto */}
      <Dialog open={openDetalle} onClose={() => setOpenDetalle(false)} fullWidth>
        <DialogTitle>Detalles del Proyecto</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Nombre del proyecto" value={proyectoSeleccionado?.nombreProyecto || ''} disabled margin="normal" />
          <TextField fullWidth label="Descripción" value={proyectoSeleccionado?.descripcion || ''} disabled margin="normal" multiline rows={3} />
          <TextField fullWidth label="Objetivos" value={proyectoSeleccionado?.objetivos || ''} disabled margin="normal" multiline rows={2} />
          <TextField fullWidth label="Institución" value={proyectoSeleccionado?.institucion || ''} disabled margin="normal" />
          <TextField fullWidth label="Presupuesto" value={proyectoSeleccionado?.presupuesto || ''} disabled margin="normal" />
          <TextField fullWidth label="Observaciones" value={proyectoSeleccionado?.observaciones || ''} disabled margin="normal" multiline rows={2} />
          <TextField fullWidth label="Área de conocimiento" value={proyectoSeleccionado?.areaConocimiento || ''} disabled margin="normal" />
          <TextField fullWidth label="Fecha de inicio" value={proyectoSeleccionado?.fechaInicio || ''} disabled margin="normal" />
          <TextField fullWidth label="Estado" value={proyectoSeleccionado?.estado || ''} disabled margin="normal" />
          {proyectoSeleccionado?.cronogramaURL && (
            <Box mt={2}>
              <Typography>Cronograma:</Typography>
              <a href={proyectoSeleccionado.cronogramaURL} target="_blank" rel="noopener noreferrer">Ver archivo</a>
            </Box>
          )}
          {proyectoSeleccionado?.integrantes?.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle1">Integrantes del equipo:</Typography>
              {proyectoSeleccionado.integrantes.map((int, i) => (
                <Typography key={i} variant="body2" sx={{ ml: 2 }}>
                  - {int.nombre} {int.apellido} | ID: {int.id} | Grado: {int.grado}
                </Typography>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetalle(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ListaProyectosCoordinador;
