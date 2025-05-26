import React, { useEffect, useState } from 'react';
import {
  collection, query, getDocs
} from 'firebase/firestore';
import { db, auth } from '../Firebase/Firebase';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box, Typography, TextField, Grid, Tooltip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import TimelineIcon from '@mui/icons-material/Timeline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useNavigate } from 'react-router-dom';
import { generarPDF } from './GenerarPdfs.jsx';
import './ListaProyectoEstudiante.css';

const ListaProyectoEstudiante = () => {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState([]);
  const [filteredProyectos, setFilteredProyectos] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroInstitucion, setFiltroInstitucion] = useState('');
  const [openDetalle, setOpenDetalle] = useState(false);
  const [detalleProyecto, setDetalleProyecto] = useState(null);

  const fetchProyectos = async () => {
    const snapshot = await getDocs(collection(db, 'proyectos'));
    const uid = auth.currentUser?.uid;

    const asignados = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaInicio: doc.data().fechaInicio?.toDate().toISOString().split('T')[0] || '',
      }))
      .filter(p => Array.isArray(p.integrantes) && p.integrantes.some(i => i.id === uid));

    setProyectos(asignados);
    setFilteredProyectos(asignados);
  };

  const handleVerDetalle = (row) => {
    setDetalleProyecto(row);
    setOpenDetalle(true);
  };

  useEffect(() => {
    fetchProyectos();
  }, []);

  useEffect(() => {
    let filtrados = proyectos;
    if (filtroNombre) {
      filtrados = filtrados.filter(p => p.nombreProyecto?.toLowerCase().includes(filtroNombre.toLowerCase()));
    }
    if (filtroInstitucion) {
      filtrados = filtrados.filter(p => p.institucion?.toLowerCase().includes(filtroInstitucion.toLowerCase()));
    }
    setFilteredProyectos(filtrados);
  }, [filtroNombre, filtroInstitucion, proyectos]);

  const columns = [
    { field: 'nombreProyecto', headerName: 'Nombre', flex: 1 },
    { field: 'institucion', headerName: 'Institución', flex: 1 },
    { field: 'areaConocimiento', headerName: 'Área', flex: 1 },
    { field: 'estado', headerName: 'Estado', flex: 1 },
    { field: 'fechaInicio', headerName: 'Inicio', flex: 1 },
    {
      field: 'acciones',
      headerName: 'Acciones',
      flex: 1,
      minWidth: 200,
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params) => (
        <>
          <Tooltip title="Ver detalles">
            <IconButton onClick={() => handleVerDetalle(params.row)}>
              <DescriptionIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ver avances">
            <IconButton onClick={() => navigate(`/proyecto/${params.row.id}/hitos`)}>
              <TimelineIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Descargar PDF">
            <IconButton onClick={async () => {
              const ref = collection(db, 'proyectos', params.row.id, 'avances');
              const snapshot = await getDocs(ref);
              const hitos = snapshot.docs.map(doc => ({
                ...doc.data(),
                fecha: doc.data().fecha?.toDate().toLocaleDateString() || '',
                descripcion: doc.data().descripcion || ''
              }));
              generarPDF(params.row, hitos);
            }}>
              <PictureAsPdfIcon />
            </IconButton>
          </Tooltip>
        </>
      )
    }
  ];

  return (
    <Box className="lista-estudiante-container">
      <Grid container spacing={2} className="lista-estudiante-filtros">
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Buscar por nombre" value={filtroNombre} onChange={(e) => setFiltroNombre(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Buscar por institución" value={filtroInstitucion} onChange={(e) => setFiltroInstitucion(e.target.value)} />
        </Grid>
      </Grid>

      <Box className="lista-estudiante-grid">
        <DataGrid
          rows={filteredProyectos.map(p => ({ ...p, fechaInicio: p.fechaInicio?.toString() }))}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          sx={{ minWidth: 700, height: 500 }}
        />
      </Box>

      <Dialog open={openDetalle} onClose={() => setOpenDetalle(false)} fullWidth>
        <DialogTitle>Detalles del Proyecto</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Nombre del proyecto" value={detalleProyecto?.nombreProyecto || ''} disabled margin="normal" />
          <TextField fullWidth label="Descripción" value={detalleProyecto?.descripcion || ''} disabled margin="normal" multiline rows={3} />
          <TextField fullWidth label="Objetivos" value={detalleProyecto?.objetivos || ''} disabled margin="normal" multiline rows={2} />
          <TextField fullWidth label="Institución" value={detalleProyecto?.institucion || ''} disabled margin="normal" />
          <TextField fullWidth label="Observaciones" value={detalleProyecto?.observaciones || ''} disabled margin="normal" multiline rows={2} />
          <TextField fullWidth label="Área de conocimiento" value={detalleProyecto?.areaConocimiento || ''} disabled margin="normal" />
          <TextField fullWidth label="Fecha de inicio" value={detalleProyecto?.fechaInicio || ''} disabled margin="normal" />
          <TextField fullWidth label="Estado" value={detalleProyecto?.estado || ''} disabled margin="normal" />

          {detalleProyecto?.cronogramaURL && (
            <Box mt={2}>
              <Typography>📎 Cronograma:</Typography>
              <a href={detalleProyecto.cronogramaURL} target="_blank" rel="noopener noreferrer">
                Ver archivo
              </a>
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

export default ListaProyectoEstudiante;