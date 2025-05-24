import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '../Firebase/Firebase';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Tooltip,
  IconButton
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import TimelineIcon from '@mui/icons-material/Timeline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useNavigate } from 'react-router-dom';
import { generarPDF } from './GenerarPdfs.jsx';

const ListaProyectoEstudiante = () => {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState([]);
  const [filteredProyectos, setFilteredProyectos] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroInstitucion, setFiltroInstitucion] = useState('');

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
      renderCell: (params) => (
        <>
          <Tooltip title="Ver detalles">
            <IconButton onClick={() => navigate(`/proyecto/${params.row.id}/detalle`)}>
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
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Mis Proyectos Asignados</Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Buscar por nombre" value={filtroNombre} onChange={(e) => setFiltroNombre(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Buscar por institución" value={filtroInstitucion} onChange={(e) => setFiltroInstitucion(e.target.value)} />
        </Grid>
      </Grid>

      <DataGrid
        rows={filteredProyectos.map(p => ({ ...p, fechaInicio: p.fechaInicio?.toString() }))}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        sx={{ height: 500 }}
      />
    </Box>
  );
};

export default ListaProyectoEstudiante;
