import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Alert, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Card, CardContent, CardActions, Grid, Chip,
  Fab, Paper, Divider, Container
} from '@mui/material';
import { addDoc, collection, query, where, getDocs, Timestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, storage, auth } from '../Firebase/Firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import TimelineIcon from '@mui/icons-material/Timeline';
import './HitosProyecto.css';

const HitosProyecto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [evidencias, setEvidencias] = useState([]);
  const [hitos, setHitos] = useState([]);
  const [exito, setExito] = useState('');
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const cargarHitos = async () => {
    const q = query(collection(db, 'hitos'), where('proyectoId', '==', id));
    const snap = await getDocs(q);
    const resultados = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setHitos(resultados);
  };

  useEffect(() => {
    cargarHitos();
  }, [id]);

  const subirArchivo = async (file) => {
    const archivoRef = ref(storage, `hitos/${Date.now()}_${file.name}`);
    await uploadBytes(archivoRef, file);
    return await getDownloadURL(archivoRef);
  };

  const handleGuardarHito = async (e) => {
    e.preventDefault();
    setExito('');
    setError('');

    if (!titulo || !descripcion || !fecha) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    try {
      const urls = [];
      for (const file of evidencias) {
        const url = await subirArchivo(file);
        urls.push(url);
      }

      if (editandoId) {
        const ref = doc(db, 'hitos', editandoId);
        await updateDoc(ref, {
          titulo,
          descripcion,
          fecha: Timestamp.fromDate(new Date(fecha)),
          evidenciasURL: urls
        });
        setExito('Avance actualizado correctamente.');
      } else {
        await addDoc(collection(db, 'hitos'), {
          proyectoId: id,
          titulo,
          descripcion,
          fecha: Timestamp.fromDate(new Date(fecha)),
          evidenciasURL: urls,
          creadoPor: auth.currentUser.uid
        });
        setExito('Avance registrado correctamente.');
      }

      setTitulo('');
      setDescripcion('');
      setFecha('');
      setArchivo(null);
      setEvidencias([]);
      setEditandoId(null);
      setOpenDialog(false);
      cargarHitos();
    } catch (err) {
      setError('Error al guardar avance: ' + err.message);
    }
  };

  const eliminarHito = async (hitoId) => {
    if (window.confirm('¿Eliminar este avance?')) {
      await deleteDoc(doc(db, 'hitos', hitoId));
      cargarHitos();
    }
  };

  const editarHito = (hito) => {
    setTitulo(hito.titulo);
    setDescripcion(hito.descripcion);
    setFecha(hito.fecha.toDate().toISOString().split('T')[0]);
    setEditandoId(hito.id);
    setArchivo(null);
    setEvidencias([]);
    setOpenDialog(true);
  };

  const handleVolver = () => {
    navigate(-1);
  };

  return (
    <Box className="hitos-container">
      <Container maxWidth="lg">
        <Box className="hitos-header">
          <IconButton onClick={handleVolver}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TimelineIcon style={{ color: '#60a5fa', fontSize: 32 }} />
            <Typography variant="h4" className="hitos-title">
              Avances del Proyecto
            </Typography>
          </Box>
        </Box>

        {exito && <Alert className="hitos-alert-success">{exito}</Alert>}
        {error && <Alert className="hitos-alert-error">{error}</Alert>}

        <Fab className="fab-add-hito" onClick={() => setOpenDialog(true)}>
          <AddIcon />
        </Fab>

        <Grid container spacing={3}>
          {hitos.length === 0 ? (
            <Grid item xs={12}>
              <Paper className="empty-message">
                <TimelineIcon style={{ fontSize: 64, color: '#64748b', marginBottom: 16 }} />
                <Typography variant="h6" style={{ color: '#94a3b8', marginBottom: 8 }}>
                  No hay avances registrados
                </Typography>
                <Typography variant="body2" style={{ color: '#64748b' }}>
                  Haz clic en el botón + para agregar tu primer avance
                </Typography>
              </Paper>
            </Grid>
          ) : (
            hitos.map((hito) => (
              <Grid item xs={12} md={6} lg={4} key={hito.id}>
                <Card className="card-hito">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                      <CalendarTodayIcon style={{ color: '#60a5fa', marginRight: 8, fontSize: 20 }} />
                      <Chip label={hito.fecha.toDate().toLocaleDateString()} size="small" />
                    </Box>
                    <Typography variant="h6" style={{ color: 'white', fontWeight: 'bold', marginBottom: 16 }}>
                      {hito.titulo}
                    </Typography>
                    <Typography variant="body2" style={{ color: '#cbd5e1', marginBottom: 16 }}>
                      {hito.descripcion}
                    </Typography>
                    {hito.evidenciasURL && hito.evidenciasURL.length > 0 && (
                      <Box>
                        <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', marginBottom: 16 }} />
                        <Typography variant="subtitle2" style={{ color: '#94a3b8', marginBottom: 8 }}>
                          Evidencias:
                        </Typography>
                        {hito.evidenciasURL.map((url, i) => (
                          <Box key={i} style={{ marginBottom: 8 }}>
                            <Button href={url} target="_blank" rel="noopener noreferrer" startIcon={<AttachFileIcon />} size="small">
                              Evidencia {i + 1}
                            </Button>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                  <CardActions style={{ justifyContent: 'flex-end' }}>
                    <IconButton onClick={() => editarHito(hito)} style={{ color: '#60a5fa' }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => eliminarHito(hito.id)} style={{ color: '#ef4444' }}>
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        <Dialog open={openDialog} onClose={() => { setOpenDialog(false); setEditandoId(null); }} fullWidth maxWidth="md">
          <DialogTitle style={{ color: 'white' }}>
            {editandoId ? 'Editar avance' : 'Registrar nuevo avance'}
          </DialogTitle>
          <DialogContent className="dialog-content">
            <TextField
              fullWidth
              label="Título del avance"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={4}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              type="date"
              label="Fecha"
              InputLabelProps={{ shrink: true }}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              margin="normal"
              required
            />
            <Box style={{ marginTop: 24 }}>
              <Typography style={{ color: '#94a3b8', marginBottom: 8 }}>
                Subir evidencias (documentos o fotos):
              </Typography>
              <input
                type="file"
                multiple
                onChange={(e) => setEvidencias(Array.from(e.target.files))}
                accept=".pdf,image/*"
              />
            </Box>
          </DialogContent>
          <DialogActions className="dialog-actions">
            <Button onClick={() => { setOpenDialog(false); setEditandoId(null); }} style={{ color: '#94a3b8' }}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarHito} variant="contained">
              {editandoId ? 'Actualizar' : 'Registrar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default HitosProyecto;
