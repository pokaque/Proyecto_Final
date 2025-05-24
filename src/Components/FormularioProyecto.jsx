import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Box,
    MenuItem,
    Alert,
    Typography,
    IconButton,
    Autocomplete
} from '@mui/material';
import { AddCircleOutline, Delete } from '@mui/icons-material';
import { addDoc, collection, Timestamp, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../Firebase/Firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../Firebase/Firebase';

const FormularioProyecto = () => {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [objetivos, setObjetivos] = useState('');
    const [institucion, setInstitucion] = useState('');
    const [presupuesto, setPresupuesto] = useState('');
    const [cronograma, setCronograma] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [area, setArea] = useState('');
    const [fecha, setFecha] = useState('');
    const [integrantes, setIntegrantes] = useState([]);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [cronogramaArchivo, setCronogramaArchivo] = useState(null);
    const [estudiantes, setEstudiantes] = useState([]);

    useEffect(() => {
        const cargarEstudiantes = async () => {
            const q = query(collection(db, 'users'), where('rol', '==', 'estudiante'));
            const snapshot = await getDocs(q);
            const lista = snapshot.docs.map(doc => ({
                uid: doc.id,
                nombre: doc.data().nombre,
                email: doc.data().email
            }));
            setEstudiantes(lista);
        };
        cargarEstudiantes();
    }, []);

    const agregarIntegrante = (estudiante) => {
        if (!integrantes.some(i => i.id === estudiante.uid)) {
            setIntegrantes([...integrantes, {
                nombre: estudiante.nombre,
                apellido: '',
                id: estudiante.uid,
                grado: ''
            }]);
        }
    };

    const eliminarIntegrante = (index) => {
        const nuevos = integrantes.filter((_, i) => i !== index);
        setIntegrantes(nuevos);
    };

    const handleIntegranteChange = (index, field, value) => {
        const nuevos = [...integrantes];
        nuevos[index][field] = value;
        setIntegrantes(nuevos);
    };

    const subirArchivo = async (archivo, ruta) => {
        const archivoRef = ref(storage, `${ruta}/${archivo.name}`);
        await uploadBytes(archivoRef, archivo);
        return await getDownloadURL(archivoRef);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setExito('');

        if (!nombre || !descripcion || !area || !fecha || !objetivos || !institucion) {
            setError('Por favor, completa todos los campos obligatorios.');
            return;
        }

        try {
            let urlCronograma = '';

            if (cronogramaArchivo) {
                urlCronograma = await subirArchivo(cronogramaArchivo, 'cronogramas');
            }

            const proyecto = {
                nombreProyecto: nombre,
                descripcion,
                objetivos,
                institucion,
                presupuesto,
                cronograma,
                cronogramaURL: urlCronograma,
                observaciones,
                integrantes,
                areaConocimiento: area,
                fechaInicio: Timestamp.fromDate(new Date(fecha)),
                estado: 'Inactivo',
                creadoPor: auth.currentUser.uid,
            };

            await addDoc(collection(db, 'proyectos'), proyecto);
            setExito('Proyecto creado correctamente.');

            setNombre('');
            setDescripcion('');
            setObjetivos('');
            setInstitucion('');
            setPresupuesto('');
            setCronograma('');
            setObservaciones('');
            setArea('');
            setFecha('');
            setIntegrantes([]);
            setCronogramaArchivo(null);
        } catch (error) {
            setError('Error al crear proyecto: ' + error.message);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {exito && <Alert severity="success" sx={{ mb: 2 }}>{exito}</Alert>}

            <TextField fullWidth label="Nombre del proyecto" margin="normal" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            <TextField fullWidth label="Descripción" margin="normal" multiline rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
            <TextField fullWidth label="Objetivos" margin="normal" multiline rows={3} value={objetivos} onChange={(e) => setObjetivos(e.target.value)} required />
            <TextField fullWidth label="Institución" margin="normal" value={institucion} onChange={(e) => setInstitucion(e.target.value)} required />
            <TextField fullWidth label="Presupuesto estimado" margin="normal" value={presupuesto} onChange={(e) => setPresupuesto(e.target.value)} />
            <TextField fullWidth label="Observaciones adicionales" margin="normal" multiline rows={2} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
            <TextField select fullWidth label="Área de conocimiento" value={area} onChange={(e) => setArea(e.target.value)} margin="normal" required>
                <MenuItem value="Ciencias">Ciencias</MenuItem>
                <MenuItem value="Tecnología">Tecnología</MenuItem>
                <MenuItem value="Matemáticas">Matemáticas</MenuItem>
                <MenuItem value="Ciencias Sociales">Ciencias Sociales</MenuItem>
            </TextField>
            <TextField fullWidth label="Fecha de inicio" type="date" margin="normal" InputLabelProps={{ shrink: true }} value={fecha} onChange={(e) => setFecha(e.target.value)} required />

            <Box mt={2}>
                <Typography variant="subtitle1">Subir cronograma (PDF o imagen):</Typography>
                <input type="file" accept=".pdf,image/*" onChange={(e) => setCronogramaArchivo(e.target.files[0])} />
            </Box>

            <Box mt={3}>
                <Typography variant="h6" gutterBottom>Agregar estudiante al proyecto</Typography>
                <Autocomplete
                    options={estudiantes}
                    getOptionLabel={(option) => `${option.nombre} (${option.email})`}
                    renderInput={(params) => <TextField {...params} label="Buscar estudiante" margin="normal" />}
                    onChange={(event, value) => value && agregarIntegrante(value)}
                />

                {integrantes.map((int, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                        <TextField label="Nombre" value={int.nombre} disabled size="small" />
                        <TextField label="ID" value={int.id} disabled size="small" />
                        <TextField label="Grado" value={int.grado} onChange={(e) => handleIntegranteChange(index, 'grado', e.target.value)} size="small" />
                        <IconButton color="error" onClick={() => eliminarIntegrante(index)}><Delete /></IconButton>
                    </Box>
                ))}
            </Box>

            <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>Crear Proyecto</Button>
        </Box>
    );
};

export default FormularioProyecto;
