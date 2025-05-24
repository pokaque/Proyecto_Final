import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, TextField, Button, Alert, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, List, ListItem, ListItemText, Stack
} from '@mui/material';
import { addDoc, collection, query, where, getDocs, Timestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, storage, auth } from '../Firebase/Firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

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

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Avances del Proyecto</Typography>
            {exito && <Alert severity="success" sx={{ mb: 2 }}>{exito}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
                    Registrar nuevo avance
                </Button>
            </Box>

            <List sx={{ border: '1px solid #ddd', borderRadius: 2 }}>
                {hitos.map((hito) => (
                    <ListItem
                        key={hito.id}
                        secondaryAction={
                            <Stack direction="row" spacing={1}>
                                <IconButton edge="end" color="primary" onClick={() => editarHito(hito)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton edge="end" color="error" onClick={() => eliminarHito(hito.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Stack>
                        }
                    >
                        <ListItemText
                            primary={<strong>{hito.titulo} - {hito.fecha.toDate().toLocaleDateString()}</strong>}
                            secondary={
                                <>
                                    {hito.descripcion}<br />
                                    {hito.evidenciasURL?.map((url, i) => (
                                        <div key={i}><a href={url} target="_blank" rel="noopener noreferrer">📎 Evidencia {i + 1}</a></div>
                                    ))}
                                </>
                            }
                        />
                    </ListItem>
                ))}
            </List>

            <Dialog open={openDialog} onClose={() => { setOpenDialog(false); setEditandoId(null); }} fullWidth>
                <DialogTitle>{editandoId ? 'Editar avance' : 'Registrar nuevo avance'}</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="Título del avance" value={titulo} onChange={(e) => setTitulo(e.target.value)} margin="normal" required />
                    <TextField fullWidth label="Descripción" multiline rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} margin="normal" required />
                    <TextField fullWidth type="date" label="Fecha" InputLabelProps={{ shrink: true }} value={fecha} onChange={(e) => setFecha(e.target.value)} margin="normal" required />
                    <Typography mt={2}>Subir evidencias (documentos o fotos):</Typography>
                    <input type="file" multiple onChange={(e) => setEvidencias(Array.from(e.target.files))} accept=".pdf,image/*" />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setOpenDialog(false); setEditandoId(null); }}>Cancelar</Button>
                    <Button onClick={handleGuardarHito} variant="contained">{editandoId ? 'Actualizar' : 'Registrar'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default HitosProyecto;
