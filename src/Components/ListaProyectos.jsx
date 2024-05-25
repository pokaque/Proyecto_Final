// ListaProyectos.jsx actualizado con mejoras responsive
import React, { useEffect, useState } from 'react';
import {
    collection, query, where, getDocs, deleteDoc, doc, updateDoc
} from 'firebase/firestore';
import { db, auth } from '../Firebase/Firebase';
import { DataGrid } from '@mui/x-data-grid';
import {
    Box, Typography, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, Button, TextField, MenuItem, Tooltip, Alert, Grid, Autocomplete
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TimelineIcon from '@mui/icons-material/Timeline';
import { useNavigate } from 'react-router-dom';
import { generarPDF, generarPDFGeneral } from './GenerarPdfs.jsx';
import './ListaProyectos.css';

const ListaProyectos = () => {
    const navigate = useNavigate();
    const [proyectos, setProyectos] = useState([]);
    const [filteredProyectos, setFilteredProyectos] = useState([]);
    const [selectedProyecto, setSelectedProyecto] = useState(null);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDetalle, setOpenDetalle] = useState(false);
    const [detalleProyecto, setDetalleProyecto] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [estudiantes, setEstudiantes] = useState([]);
    const [filtroNombre, setFiltroNombre] = useState('');
    const [filtroArea, setFiltroArea] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroInstitucion, setFiltroInstitucion] = useState('');

    const fetchProyectos = async () => {
        const proyectosRef = collection(db, 'proyectos');
        const q = query(proyectosRef, where('creadoPor', '==', auth.currentUser.uid));
        const snapshot = await getDocs(q);
        const lista = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            fechaInicio: doc.data().fechaInicio instanceof Object
                ? doc.data().fechaInicio.toDate().toISOString().split('T')[0]
                : '',
        }));
        setProyectos(lista);
        setFilteredProyectos(lista);
    };

    const fetchEstudiantes = async () => {
        const q = query(collection(db, 'users'), where('rol', '==', 'estudiante'));
        const snapshot = await getDocs(q);
        const lista = snapshot.docs.map(doc => ({
            uid: doc.id,
            nombre: doc.data().nombre,
            email: doc.data().email
        }));
        setEstudiantes(lista);
    };

    useEffect(() => {
        fetchProyectos();
        fetchEstudiantes();
    }, []);

    useEffect(() => {
        let filtrados = proyectos;
        if (filtroNombre) filtrados = filtrados.filter(p => p.nombreProyecto.toLowerCase().includes(filtroNombre.toLowerCase()));
        if (filtroArea) filtrados = filtrados.filter(p => p.areaConocimiento === filtroArea);
        if (filtroEstado) filtrados = filtrados.filter(p => p.estado === filtroEstado);
        if (filtroInstitucion) filtrados = filtrados.filter(p => p.institucion.toLowerCase().includes(filtroInstitucion.toLowerCase()));
        setFilteredProyectos(filtrados);
    }, [filtroNombre, filtroArea, filtroEstado, filtroInstitucion, proyectos]);

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este proyecto?')) {
            await deleteDoc(doc(db, 'proyectos', id));
            setSuccessMsg('Proyecto eliminado exitosamente.');
            fetchProyectos();
        }
    };

    const handleEditClick = (row) => {
        setSelectedProyecto({ ...row });
        setOpenEdit(true);
    };

    const handleVerDetalle = (row) => {
        setDetalleProyecto(row);
        setOpenDetalle(true);
    };

    const handleIntegranteChange = (index, field, value) => {
        const nuevos = [...selectedProyecto.integrantes];
        nuevos[index][field] = value;
        setSelectedProyecto({ ...selectedProyecto, integrantes: nuevos });
    };

    const agregarIntegrante = (estudiante) => {
        if (!selectedProyecto.integrantes.some(i => i.id === estudiante.uid)) {
            const nuevos = [...selectedProyecto.integrantes, {
                nombre: estudiante.nombre,
                apellido: '',
                id: estudiante.uid,
                grado: ''
            }];
            setSelectedProyecto({ ...selectedProyecto, integrantes: nuevos });
        }
    };

    const eliminarIntegrante = (index) => {
        const nuevos = selectedProyecto.integrantes.filter((_, i) => i !== index);
        setSelectedProyecto({ ...selectedProyecto, integrantes: nuevos });
    };

    const handleUpdate = async () => {
        const ref = doc(db, 'proyectos', selectedProyecto.id);
        await updateDoc(ref, {
            nombreProyecto: selectedProyecto.nombreProyecto,
            descripcion: selectedProyecto.descripcion,
            objetivos: selectedProyecto.objetivos,
            institucion: selectedProyecto.institucion,
            presupuesto: selectedProyecto.presupuesto,
            observaciones: selectedProyecto.observaciones,
            areaConocimiento: selectedProyecto.areaConocimiento,
            fechaInicio: new Date(selectedProyecto.fechaInicio),
            integrantes: selectedProyecto.integrantes,
        });
        setOpenEdit(false);
        setSuccessMsg('Proyecto actualizado correctamente.');
        fetchProyectos();
    };

    const columns = [
        { field: 'nombreProyecto', headerName: 'Nombre', flex: 1 },
        { field: 'areaConocimiento', headerName: 'Área', flex: 1 },
        { field: 'fechaInicio', headerName: 'Inicio', flex: 1 },
        { field: 'estado', headerName: 'Estado', flex: 1 },
        {
            field: 'acciones',
            headerName: 'Acciones',
            flex: 1,
            minWidth: 250,
            disableColumnMenu: true,
            sortable: false,
            renderCell: (params) => (
                <>
                    <Tooltip title="Editar"><IconButton onClick={() => handleEditClick(params.row)}><EditIcon /></IconButton></Tooltip>
                    <Tooltip title="Eliminar"><IconButton color="error" onClick={() => handleDelete(params.row.id)}><DeleteIcon /></IconButton></Tooltip>
                    <Tooltip title="Ver detalles"><IconButton onClick={() => handleVerDetalle(params.row)}><DescriptionIcon /></IconButton></Tooltip>
                    <Tooltip title="Ver hitos"><IconButton onClick={() => navigate(`/proyecto/${params.row.id}/hitos`)}><TimelineIcon /></IconButton></Tooltip>
                    <Tooltip title="Generar PDF"><IconButton onClick={async () => {
                        const ref = collection(db, 'proyectos', params.row.id, 'avances');
                        const snapshot = await getDocs(ref);
                        const hitos = snapshot.docs.map(doc => ({
                            ...doc.data(),
                            fecha: doc.data().fecha?.toDate().toLocaleDateString() || '',
                            descripcion: doc.data().descripcion || ''
                        }));
                        generarPDF(params.row, hitos);
                    }}><PictureAsPdfIcon /></IconButton></Tooltip>
                </>
            )
        }
    ];

    return (
        <Box className="lista-proyectos-container">
            <Typography variant="h6">Proyectos creados por ti</Typography>
            {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

            {/* Filtros */}
            <Grid container spacing={2} className="lista-proyectos-filtros">
                <Grid item xs={12} sm={3}><TextField fullWidth label="Buscar por nombre" value={filtroNombre} onChange={(e) => setFiltroNombre(e.target.value)} /></Grid>
                <Grid item xs={12} sm={3}><TextField select fullWidth label="Área" value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)}><MenuItem value="">Todas</MenuItem><MenuItem value="Ciencias">Ciencias</MenuItem><MenuItem value="Tecnología">Tecnología</MenuItem><MenuItem value="Matemáticas">Matemáticas</MenuItem><MenuItem value="Ciencias Sociales">Ciencias Sociales</MenuItem></TextField></Grid>
                <Grid item xs={12} sm={3}><TextField select fullWidth label="Estado" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}><MenuItem value="">Todos</MenuItem><MenuItem value="Activo">Activo</MenuItem><MenuItem value="Inactivo">Inactivo</MenuItem><MenuItem value="Formulación">Formulación</MenuItem><MenuItem value="Evaluación">Evaluación</MenuItem><MenuItem value="Finalizado">Finalizado</MenuItem></TextField></Grid>
                <Grid item xs={12} sm={3}><TextField fullWidth label="Buscar por institución" value={filtroInstitucion} onChange={(e) => setFiltroInstitucion(e.target.value)} /></Grid>
            </Grid>

            {/* Tabla */}
            <Box className="lista-proyectos-grid">
                <DataGrid rows={filteredProyectos} columns={columns} pageSize={5} rowsPerPageOptions={[5]} sx={{ minWidth: 800, height: 500 }} />
            </Box>

            {/* Diálogo de edición */}
            <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="md" fullWidth>
                <DialogTitle>Editar Proyecto</DialogTitle>
                <DialogContent>
                    {selectedProyecto && (
                        <Box sx={{ mt: 2 }} component="form">
                            <TextField fullWidth margin="normal" label="Nombre del Proyecto" value={selectedProyecto.nombreProyecto} onChange={(e) => setSelectedProyecto({ ...selectedProyecto, nombreProyecto: e.target.value })} />
                            <TextField fullWidth margin="normal" label="Descripción" multiline rows={2} value={selectedProyecto.descripcion} onChange={(e) => setSelectedProyecto({ ...selectedProyecto, descripcion: e.target.value })} />
                            <TextField fullWidth margin="normal" label="Objetivos" multiline rows={2} value={selectedProyecto.objetivos} onChange={(e) => setSelectedProyecto({ ...selectedProyecto, objetivos: e.target.value })} />
                            <TextField fullWidth margin="normal" label="Institución" value={selectedProyecto.institucion} onChange={(e) => setSelectedProyecto({ ...selectedProyecto, institucion: e.target.value })} />
                            <TextField fullWidth margin="normal" label="Presupuesto" type="number" value={selectedProyecto.presupuesto} onChange={(e) => setSelectedProyecto({ ...selectedProyecto, presupuesto: e.target.value })} />
                            <TextField fullWidth margin="normal" label="Observaciones" multiline rows={2} value={selectedProyecto.observaciones} onChange={(e) => setSelectedProyecto({ ...selectedProyecto, observaciones: e.target.value })} />
                            <TextField fullWidth margin="normal" label="Área de conocimiento" value={selectedProyecto.areaConocimiento} onChange={(e) => setSelectedProyecto({ ...selectedProyecto, areaConocimiento: e.target.value })} />
                            <TextField fullWidth margin="normal" label="Fecha de inicio" type="date" InputLabelProps={{ shrink: true }} value={selectedProyecto.fechaInicio} onChange={(e) => setSelectedProyecto({ ...selectedProyecto, fechaInicio: e.target.value })} />
                            
                            <Typography variant="subtitle1" sx={{ mt: 2 }}>Integrantes</Typography>
                            {selectedProyecto.integrantes.map((i, idx) => (
                                <Box key={idx} display="flex" gap={2} alignItems="center" mt={1}>
                                    <TextField label="Nombre" value={i.nombre} onChange={(e) => handleIntegranteChange(idx, 'nombre', e.target.value)} />
                                    <TextField label="Apellido" value={i.apellido} onChange={(e) => handleIntegranteChange(idx, 'apellido', e.target.value)} />
                                    <TextField label="Grado" value={i.grado} onChange={(e) => handleIntegranteChange(idx, 'grado', e.target.value)} />
                                    <Button color="error" onClick={() => eliminarIntegrante(idx)}>Eliminar</Button>
                                </Box>
                            ))}
                            <Autocomplete
                                options={estudiantes}
                                getOptionLabel={(option) => option.nombre}
                                renderInput={(params) => <TextField {...params} label="Agregar estudiante" />}
                                onChange={(e, value) => value && agregarIntegrante(value)}
                                sx={{ mt: 2 }}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEdit(false)}>Cancelar</Button>
                    <Button onClick={handleUpdate} variant="contained">Guardar Cambios</Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo de detalle */}
            <Dialog open={openDetalle} onClose={() => setOpenDetalle(false)} maxWidth="md" fullWidth>
                <DialogTitle>Detalle del Proyecto</DialogTitle>
                <DialogContent>
                    {detalleProyecto && (
                        <Box>
                            <Typography variant="body1"><strong>Nombre:</strong> {detalleProyecto.nombreProyecto}</Typography>
                            <Typography variant="body1"><strong>Descripción:</strong> {detalleProyecto.descripcion}</Typography>
                            <Typography variant="body1"><strong>Objetivos:</strong> {detalleProyecto.objetivos}</Typography>
                            <Typography variant="body1"><strong>Institución:</strong> {detalleProyecto.institucion}</Typography>
                            <Typography variant="body1"><strong>Presupuesto:</strong> {detalleProyecto.presupuesto}</Typography>
                            <Typography variant="body1"><strong>Área:</strong> {detalleProyecto.areaConocimiento}</Typography>
                            <Typography variant="body1"><strong>Fecha de inicio:</strong> {detalleProyecto.fechaInicio}</Typography>
                            <Typography variant="body1"><strong>Estado:</strong> {detalleProyecto.estado}</Typography>
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

export default ListaProyectos;
