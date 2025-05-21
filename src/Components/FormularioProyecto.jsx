import React, { useState } from 'react';
import {
    TextField,
    Button,
    Box,
    MenuItem,
    Alert,
    Typography,
    IconButton
} from '@mui/material';
import { AddCircleOutline, Delete } from '@mui/icons-material';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
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
    const [integrantes, setIntegrantes] = useState([{ nombre: '', apellido: '', id: '', grado: '' }]);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [cronogramaArchivo, setCronogramaArchivo] = useState(null);



    const handleIntegranteChange = (index, field, value) => {
        const nuevosIntegrantes = [...integrantes];
        nuevosIntegrantes[index][field] = value;
        setIntegrantes(nuevosIntegrantes);
    };

    const agregarIntegrante = () => {
        setIntegrantes([...integrantes, { nombre: '', apellido: '', id: '', grado: '' }]);
    };

    const eliminarIntegrante = (index) => {
        const nuevos = integrantes.filter((_, i) => i !== index);
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
          let urlPresupuesto = '';
      
          if (cronogramaArchivo) {
            urlCronograma = await subirArchivo(cronogramaArchivo, 'cronogramas');
          }

      
          const proyecto = {
            nombreProyecto: nombre,
            descripcion,
            objetivos,
            institucion,
            presupuesto: presupuesto,
            cronograma: cronograma,
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
      
          // Limpiar formulario
          setNombre('');
          setDescripcion('');
          setObjetivos('');
          setInstitucion('');
          setPresupuesto('');
          setCronograma('');
          setObservaciones('');
          setArea('');
          setFecha('');
          setIntegrantes([{ nombre: '', apellido: '', id: '', grado: '' }]);
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
            {/* <TextField fullWidth label="Cronograma (resumen)" margin="normal" value={cronograma} onChange={(e) => setCronograma(e.target.value)} /> */}
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
                <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setCronogramaArchivo(e.target.files[0])}
                />
            </Box>

            <Box mt={2}>
                <Typography variant="h6" gutterBottom>Integrantes del equipo</Typography>
                {integrantes.map((int, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                        <TextField label="Nombre" value={int.nombre} onChange={(e) => handleIntegranteChange(index, 'nombre', e.target.value)} size="small" />
                        <TextField label="Apellido" value={int.apellido} onChange={(e) => handleIntegranteChange(index, 'apellido', e.target.value)} size="small" />
                        <TextField label="ID" value={int.id} onChange={(e) => handleIntegranteChange(index, 'id', e.target.value)} size="small" />
                        <TextField label="Grado" value={int.grado} onChange={(e) => handleIntegranteChange(index, 'grado', e.target.value)} size="small" />
                        {integrantes.length > 1 && (
                            <IconButton color="error" onClick={() => eliminarIntegrante(index)}>
                                <Delete />
                            </IconButton>
                        )}
                    </Box>
                ))}
                <Button variant="outlined" startIcon={<AddCircleOutline />} onClick={agregarIntegrante}>
                    Agregar integrante
                </Button>
            </Box>

            <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
                Crear Proyecto
            </Button>
        </Box>
    );
};

export default FormularioProyecto;
