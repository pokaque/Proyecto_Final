import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box, Typography, TextField, Button, Alert, IconButton, List, ListItem, ListItemText
} from '@mui/material';
import { addDoc, collection, query, where, getDocs, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { db, storage, auth } from '../Firebase/Firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const HitosProyecto = () => {


    const { id } = useParams(); // ID del proyecto
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fecha, setFecha] = useState('');
    const [archivo, setArchivo] = useState(null);
    const [hitos, setHitos] = useState([]);
    const [exito, setExito] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
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
        const archivoRef = ref(storage, `hitos/${file.name}`);
        await uploadBytes(archivoRef, file);
        return await getDownloadURL(archivoRef);
    };

    const handleCrearHito = async (e) => {
        e.preventDefault();
        setExito('');
        setError('');

        if (!titulo || !descripcion || !fecha) {
            setError('Todos los campos son obligatorios.');
            return;
        }

        try {
            let url = '';
            if (archivo) {
                url = await subirArchivo(archivo);
            }

            await addDoc(collection(db, 'hitos'), {
                proyectoId: id,
                titulo,
                descripcion,
                fecha: Timestamp.fromDate(new Date(fecha)),
                evidenciaURL: url,
                creadoPor: auth.currentUser.uid
            });

            setTitulo('');
            setDescripcion('');
            setFecha('');
            setArchivo(null);
            setExito('Avance registrado correctamente.');
            cargarHitos();
        } catch (err) {
            setError('Error al registrar avance: ' + err.message);
        }
    };

    const eliminarHito = async (hitoId) => {
        if (window.confirm('¿Eliminar este avance?')) {
            await deleteDoc(doc(db, 'hitos', hitoId));
            cargarHitos();
        }
    };

    return (

        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Registro de Avances del Proyecto</Typography>
            {exito && <Alert severity="success">{exito}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}

            <Box component="form" onSubmit={handleCrearHito} sx={{ mt: 2 }}>
                <TextField fullWidth label="Título del avance" value={titulo} onChange={(e) => setTitulo(e.target.value)} margin="normal" required />
                <TextField fullWidth label="Descripción" multiline rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} margin="normal" required />
                <TextField fullWidth type="date" label="Fecha" InputLabelProps={{ shrink: true }} value={fecha} onChange={(e) => setFecha(e.target.value)} margin="normal" required />
                <Typography mt={2}>📎 Subir evidencia (opcional):</Typography>
                <input type="file" onChange={(e) => setArchivo(e.target.files[0])} accept=".pdf,image/*" />

                <Button type="submit" variant="contained" sx={{ mt: 2 }}>Registrar Avance</Button>
                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/docente')}
                    sx={{ mt: 2 }}>
                    Volver al panel
                </Button>
            </Box>

            <Box mt={4}>
                <Typography variant="h6">Avances registrados</Typography>
                <List>
                    {hitos.map((hito) => (
                        <ListItem key={hito.id} secondaryAction={
                            <IconButton edge="end" color="error" onClick={() => eliminarHito(hito.id)}>
                                <DeleteIcon />
                            </IconButton>
                        }>
                            <ListItemText
                                primary={`${hito.titulo} - ${hito.fecha.toDate().toLocaleDateString()}`}
                                secondary={
                                    <>
                                        {hito.descripcion}
                                        {hito.evidenciaURL && (
                                            <><br /><a href={hito.evidenciaURL} target="_blank" rel="noopener noreferrer">Ver evidencia</a></>
                                        )}
                                    </>
                                }
                            />
                        </ListItem>
                    ))}
                </List>

            </Box>

        </Box>

    );
};

export default HitosProyecto;
