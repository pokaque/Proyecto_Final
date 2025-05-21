import React, { useEffect, useState } from 'react';
import {
    collection,
    getDocs,
    updateDoc,
    doc,
    addDoc,
    query,
    orderBy,
} from 'firebase/firestore';
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Tooltip,
  Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { db } from '../Firebase/Firebase';
import { auth } from '../Firebase/Firebase';

const ListaProyectosCoordinador = () => {
  const [proyectos, setProyectos] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [observacion, setObservacion] = useState('');
  const [historial, setHistorial] = useState([]);
const [openHistorial, setOpenHistorial] = useState(false);
const [tituloHistorial, setTituloHistorial] = useState('');


  const fetchProyectos = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'proyectos'));
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        fechaInicio: doc.data().fechaInicio?.toDate().toISOString().split('T')[0],
      }));
      setProyectos(lista);
    } catch (error) {
      setErrorMsg('Error al cargar los proyectos');
    }
  };

  useEffect(() => {
    fetchProyectos();
  }, []);

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
      console.error('Error al cargar historial:', error);
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
  
      // 1. Guardar el historial de estado
      const historialRef = collection(ref, 'historialEstados');
      await addDoc(historialRef, {
        estadoAnterior: proyectoSeleccionado.estado,
        nuevoEstado: nuevoEstado,
        observacion: observacion,
        fechaCambio: new Date(),
        realizadoPor: auth.currentUser?.uid || 'desconocido'
      });
  
      // 2. Actualizar el estado actual del proyecto
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
  }
  const columns = [
    { field: 'nombreProyecto', headerName: 'Nombre', flex: 1 },
    { field: 'areaConocimiento', headerName: 'Área', flex: 1 },
    { field: 'fechaInicio', headerName: 'Inicio', flex: 1 },
    { field: 'estado', headerName: 'Estado', flex: 1 },
    {
      field: 'acciones',
      headerName: 'Acciones',
      flex: 1,
      renderCell: (params) => (
        <>
          <Tooltip title="Cambiar estado">
            <IconButton onClick={() => handleAbrirDialogo(params.row)}>
              <AssignmentTurnedInIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ver historial">
            <IconButton onClick={() => abrirHistorial(params.row)}>
              📜
            </IconButton>
          </Tooltip>
        </>
      ),
      
    },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>Gestión de Proyectos</Typography>

      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={proyectos}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
        />
      </Box>

      {/* Diálogo para cambiar estado */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>Cambiar estado del proyecto</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Proyecto: <strong>{proyectoSeleccionado?.nombreProyecto}</strong>
          </Typography>

          <TextField
            fullWidth
            select
            label="Nuevo estado"
            value={nuevoEstado}
            onChange={(e) => setNuevoEstado(e.target.value)}
            margin="normal"
          >
            <MenuItem value="Formulación">Formulación</MenuItem>
            <MenuItem value="Evaluación">Evaluación</MenuItem>
            <MenuItem value="Activo">Activo</MenuItem>
            <MenuItem value="Inactivo">Inactivo</MenuItem>
            <MenuItem value="Finalizado">Finalizado</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Observación"
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleGuardarEstado} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openHistorial} onClose={() => setOpenHistorial(false)} fullWidth maxWidth="md">
  <DialogTitle>📜 Historial de cambios – {tituloHistorial}</DialogTitle>
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

    </Box>
  );
};

export default ListaProyectosCoordinador;
