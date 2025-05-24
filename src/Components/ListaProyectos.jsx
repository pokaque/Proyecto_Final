import React, { useEffect, useState } from 'react';
import {
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    doc,
    updateDoc
} from 'firebase/firestore';
import { db, auth } from '../Firebase/Firebase';
import { DataGrid } from '@mui/x-data-grid';
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
    Grid,
    Autocomplete
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useNavigate } from 'react-router-dom';
import TimelineIcon from '@mui/icons-material/Timeline';
import { generarPDF, generarPDFGeneral } from './GenerarPdfs.jsx';

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

    useEffect(() => {
        const fetchProyectos = async () => {
            const proyectosRef = collection(db, 'proyectos');
            const q = query(proyectosRef, where('creadoPor', '==', auth.currentUser.uid));
            const snapshot = await getDocs(q);
            const lista = snapshot.docs.map((doc) => ({
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
            field: 'acciones', headerName: 'Acciones', flex: 1,
            renderCell: (params) => (
                <>
                    <Tooltip title="Editar">
                        <IconButton onClick={() => handleEditClick(params.row)}><EditIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <IconButton color="error" onClick={() => handleDelete(params.row.id)}><DeleteIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Ver detalles">
                        <IconButton onClick={() => handleVerDetalle(params.row)}><DescriptionIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Ver hitos">
                        <IconButton onClick={() => navigate(`/proyecto/${params.row.id}/hitos`)}><TimelineIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Generar PDF">
                        <IconButton onClick={async () => {
                            const ref = collection(db, 'proyectos', params.row.id, 'avances');
                            const snapshot = await getDocs(ref);
                            const hitos = snapshot.docs.map(doc => ({
                                ...doc.data(),
                                fecha: doc.data().fecha?.toDate().toLocaleDateString() || '',
                                descripcion: doc.data().descripcion || ''
                            }));
                            generarPDF(params.row, hitos);
                        }}><PictureAsPdfIcon /></IconButton>
                    </Tooltip>
                </>
            )
        }
    ];

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Proyectos creados por ti</Typography>
            {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={3}><TextField fullWidth label="Buscar por nombre" value={filtroNombre} onChange={(e) => setFiltroNombre(e.target.value)} /></Grid>
                <Grid item xs={12} sm={3}><TextField select fullWidth label="Área" value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)}><MenuItem value="">Todas</MenuItem><MenuItem value="Ciencias">Ciencias</MenuItem><MenuItem value="Tecnología">Tecnología</MenuItem><MenuItem value="Matemáticas">Matemáticas</MenuItem><MenuItem value="Ciencias Sociales">Ciencias Sociales</MenuItem></TextField></Grid>
                <Grid item xs={12} sm={3}><TextField select fullWidth label="Estado" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}><MenuItem value="">Todos</MenuItem><MenuItem value="Activo">Activo</MenuItem><MenuItem value="Inactivo">Inactivo</MenuItem><MenuItem value="Formulación">Formulación</MenuItem><MenuItem value="Evaluación">Evaluación</MenuItem><MenuItem value="Finalizado">Finalizado</MenuItem></TextField></Grid>
                <Grid item xs={12} sm={3}><TextField fullWidth label="Buscar por institución" value={filtroInstitucion} onChange={(e) => setFiltroInstitucion(e.target.value)} /></Grid>
            </Grid>

            <DataGrid rows={filteredProyectos} columns={columns} pageSize={5} rowsPerPageOptions={[5]} sx={{ height: 500 }} />

            <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth>
                <DialogTitle>Editar Proyecto</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="Nombre del proyecto" value={selectedProyecto?.nombreProyecto || ''} onChange={(e) => setSelectedProyecto({ ...selectedProyecto, nombreProyecto: e.target.value })} margin="normal" />
                    <TextField fullWidth label="Descripción" value={selectedProyecto?.descripcion || ''} onChange={(e) => setSelectedProyecto({ ...selectedProyecto, descripcion: e.target.value })} margin="normal" multiline rows={3} />
                    <TextField fullWidth label="Objetivos" value={selectedProyecto?.objetivos || ''} onChange={(e) => setSelectedProyecto({ ...selectedProyecto, objetivos: e.target.value })} margin="normal" multiline rows={3} />
                    <TextField fullWidth label="Institución" value={selectedProyecto?.institucion || ''} onChange={(e) => setSelectedProyecto({ ...selectedProyecto, institucion: e.target.value })} margin="normal" />
                    <TextField fullWidth label="Presupuesto estimado" value={selectedProyecto?.presupuesto || ''} onChange={(e) => setSelectedProyecto({ ...selectedProyecto, presupuesto: e.target.value })} margin="normal" />
                    <TextField fullWidth label="Observaciones" value={selectedProyecto?.observaciones || ''} onChange={(e) => setSelectedProyecto({ ...selectedProyecto, observaciones: e.target.value })} margin="normal" multiline rows={2} />
                    <TextField select fullWidth label="Área de conocimiento" value={selectedProyecto?.areaConocimiento || ''} onChange={(e) => setSelectedProyecto({ ...selectedProyecto, areaConocimiento: e.target.value })} margin="normal">
                        <MenuItem value="Ciencias">Ciencias</MenuItem><MenuItem value="Tecnología">Tecnología</MenuItem><MenuItem value="Matemáticas">Matemáticas</MenuItem><MenuItem value="Ciencias Sociales">Ciencias Sociales</MenuItem>
                    </TextField>
                    <TextField fullWidth type="date" label="Fecha de inicio" value={selectedProyecto?.fechaInicio || ''} onChange={(e) => setSelectedProyecto({ ...selectedProyecto, fechaInicio: e.target.value })} margin="normal" InputLabelProps={{ shrink: true }} />

                    <Box mt={3}>
                        <Typography variant="h6" gutterBottom>Agregar estudiante al proyecto</Typography>
                        <Autocomplete
                            options={estudiantes}
                            getOptionLabel={(option) => `${option.nombre} (${option.email})`}
                            renderInput={(params) => <TextField {...params} label="Buscar estudiante" margin="normal" />}
                            onChange={(event, value) => value && agregarIntegrante(value)}
                        />

                        {selectedProyecto?.integrantes?.map((int, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                                <TextField label="Nombre" value={int.nombre} disabled size="small" />
                                <TextField label="ID" value={int.id} disabled size="small" />
                                <TextField label="Grado" value={int.grado} onChange={(e) => handleIntegranteChange(index, 'grado', e.target.value)} size="small" />
                                <IconButton color="error" onClick={() => eliminarIntegrante(index)}><DeleteIcon /></IconButton>
                            </Box>
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEdit(false)}>Cancelar</Button>
                    <Button onClick={handleUpdate} variant="contained">Guardar Cambios</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDetalle} onClose={() => setOpenDetalle(false)} fullWidth>
                <DialogTitle>Detalles del Proyecto</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="Nombre del proyecto" value={detalleProyecto?.nombreProyecto || ''} disabled margin="normal" />
                    <TextField fullWidth label="Descripción" value={detalleProyecto?.descripcion || ''} disabled margin="normal" multiline rows={3} />
                    <TextField fullWidth label="Objetivos" value={detalleProyecto?.objetivos || ''} disabled margin="normal" multiline rows={2} />
                    <TextField fullWidth label="Institución" value={detalleProyecto?.institucion || ''} disabled margin="normal" />
                    <TextField fullWidth label="Presupuesto" value={detalleProyecto?.presupuesto || ''} disabled margin="normal" />
                    <TextField fullWidth label="Observaciones" value={detalleProyecto?.observaciones || ''} disabled margin="normal" multiline rows={2} />
                    <TextField fullWidth label="Área de conocimiento" value={detalleProyecto?.areaConocimiento || ''} disabled margin="normal" />
                    <TextField fullWidth label="Fecha de inicio" value={detalleProyecto?.fechaInicio || ''} disabled margin="normal" />
                    <TextField fullWidth label="Estado" value={detalleProyecto?.estado || ''} disabled margin="normal" />
                    {detalleProyecto?.cronogramaURL && (<Box mt={2}><Typography>📎 Cronograma:</Typography><a href={detalleProyecto.cronogramaURL} target="_blank" rel="noopener noreferrer">Ver archivo</a></Box>)}
                    {detalleProyecto?.integrantes?.length > 0 && (<Box mt={2}><Typography variant="subtitle1">👥 Integrantes:</Typography>{detalleProyecto.integrantes.map((int, i) => (<Typography key={i} sx={{ ml: 2 }}>- {int.nombre} {int.apellido} | ID: {int.id} | Grado: {int.grado}</Typography>))}</Box>)}
                </DialogContent>
                <DialogActions><Button onClick={() => setOpenDetalle(false)}>Cerrar</Button></DialogActions>
            </Dialog>
        </Box>
    );
};

export default ListaProyectos;
