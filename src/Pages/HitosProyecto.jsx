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
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1e293b 0%,rgb(0, 0, 0) 100%)',
            py: 3
        }}>
            <Container maxWidth="lg">
                {/* Header con botón volver */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <IconButton
                        onClick={handleVolver}
                        sx={{
                            mr: 2,
                            color: 'white',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                        }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TimelineIcon sx={{ color: '#60a5fa', fontSize: 32 }} />
                        <Typography
                            variant="h4"
                            sx={{
                                color: 'white',
                                fontWeight: 'bold',
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                            }}
                        >
                            Avances del Proyecto
                        </Typography>
                    </Box>
                </Box>

                {/* Alertas */}
                {exito && (
                    <Alert
                        severity="success"
                        sx={{
                            mb: 3,
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            color: '#22c55e'
                        }}
                    >
                        {exito}
                    </Alert>
                )}
                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 3,
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444'
                        }}
                    >
                        {error}
                    </Alert>
                )}

                {/* Botón flotante para agregar */}
                <Fab
                    color="primary"
                    onClick={() => setOpenDialog(true)}
                    sx={{
                        position: 'fixed',
                        bottom: 32,
                        right: 32,
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                        },
                        boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                    }}
                >
                    <AddIcon />
                </Fab>

                {/* Grid de hitos */}
                <Grid container spacing={3}>
                    {hitos.length === 0 ? (
                        <Grid item xs={12}>
                            <Paper
                                elevation={3}
                                sx={{
                                    p: 6,
                                    textAlign: 'center',
                                    backgroundColor: 'rgba(30, 41, 59, 0.6)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: 3
                                }}
                            >
                                <TimelineIcon sx={{ fontSize: 64, color: '#64748b', mb: 2 }} />
                                <Typography variant="h6" sx={{ color: '#94a3b8', mb: 1 }}>
                                    No hay avances registrados
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b' }}>
                                    Haz clic en el botón + para agregar tu primer avance
                                </Typography>
                            </Paper>
                        </Grid>
                    ) : (
                        hitos.map((hito) => (
                            <Grid item xs={12} md={6} lg={4} key={hito.id}>
                                <Card
                                    elevation={6}
                                    sx={{
                                        height: '100%',
                                        background: 'rgba(30, 41, 59, 0.8)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: 3,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.3)',
                                            border: '1px solid rgba(96, 165, 250, 0.3)'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ pb: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <CalendarTodayIcon sx={{ color: '#60a5fa', mr: 1, fontSize: 20 }} />
                                            <Chip
                                                label={hito.fecha.toDate().toLocaleDateString()}
                                                size="small"
                                                sx={{
                                                    backgroundColor: 'rgba(96, 165, 250, 0.2)',
                                                    color: '#60a5fa',
                                                    border: '1px solid rgba(96, 165, 250, 0.3)'
                                                }}
                                            />
                                        </Box>

                                        <Typography
                                            variant="h6"
                                            sx={{
                                                color: 'white',
                                                fontWeight: 'bold',
                                                mb: 2,
                                                lineHeight: 1.3
                                            }}
                                        >
                                            {hito.titulo}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#cbd5e1',
                                                mb: 2,
                                            }}
                                        >
                                            {hito.descripcion}
                                        </Typography>

                                        {hito.evidenciasURL && hito.evidenciasURL.length > 0 && (
                                            <Box sx={{ mt: 2 }}>
                                                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />
                                                <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 1 }}>
                                                    Evidencias:
                                                </Typography>
                                                {hito.evidenciasURL.map((url, i) => (
                                                    <Box key={i} sx={{ mb: 1 }}>
                                                        <Button
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            startIcon={<AttachFileIcon />}
                                                            size="small"
                                                            sx={{
                                                                color: '#60a5fa',
                                                                textTransform: 'none',
                                                                '&:hover': {
                                                                    backgroundColor: 'rgba(96, 165, 250, 0.1)'
                                                                }
                                                            }}
                                                        >
                                                            Evidencia {i + 1}
                                                        </Button>
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </CardContent>

                                    <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                                        <IconButton
                                            onClick={() => editarHito(hito)}
                                            sx={{
                                                color: '#60a5fa',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(96, 165, 250, 0.1)'
                                                }
                                            }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => eliminarHito(hito.id)}
                                            sx={{
                                                color: '#ef4444',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(239, 68, 68, 0.1)'
                                                }
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>

                {/* Dialog para agregar/editar hito */}
                <Dialog
                    open={openDialog}
                    onClose={() => { setOpenDialog(false); setEditandoId(null); }}
                    fullWidth
                    maxWidth="md"
                    PaperProps={{
                        sx: {
                            backgroundColor: '#1e293b',
                            backgroundImage: 'none',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }
                    }}
                >
                    <DialogTitle sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        {editandoId ? 'Editar avance' : 'Registrar nuevo avance'}
                    </DialogTitle>
                    <DialogContent sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Título del avance"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            margin="normal"
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                    '&:hover fieldset': { borderColor: 'rgba(96, 165, 250, 0.5)' },
                                    '&.Mui-focused fieldset': { borderColor: '#60a5fa' }
                                },
                                '& .MuiInputLabel-root': { color: '#94a3b8' }
                            }}
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
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                    '&:hover fieldset': { borderColor: 'rgba(96, 165, 250, 0.5)' },
                                    '&.Mui-focused fieldset': { borderColor: '#60a5fa' }
                                },
                                '& .MuiInputLabel-root': { color: '#94a3b8' }
                            }}
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
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                    '&:hover fieldset': { borderColor: 'rgba(96, 165, 250, 0.5)' },
                                    '&.Mui-focused fieldset': { borderColor: '#60a5fa' }
                                },
                                '& .MuiInputLabel-root': { color: '#94a3b8' }
                            }}
                        />
                        <Box sx={{ mt: 3 }}>
                            <Typography sx={{ color: '#94a3b8', mb: 1 }}>
                                Subir evidencias (documentos o fotos):
                            </Typography>
                            <input
                                type="file"
                                multiple
                                onChange={(e) => setEvidencias(Array.from(e.target.files))}
                                accept=".pdf,image/*"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: '4px',
                                    color: 'white'
                                }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', pt: 2 }}>
                        <Button
                            onClick={() => { setOpenDialog(false); setEditandoId(null); }}
                            sx={{ color: '#94a3b8' }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleGuardarHito}
                            variant="contained"
                            sx={{
                                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                                }
                            }}
                        >
                            {editandoId ? 'Actualizar' : 'Registrar'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default HitosProyecto;