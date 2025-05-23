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
    Alert
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
    const [selectedProyecto, setSelectedProyecto] = useState(null);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDetalle, setOpenDetalle] = useState(false);
    const [detalleProyecto, setDetalleProyecto] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

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
    };

    useEffect(() => {
        fetchProyectos();
    }, []);

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

    const agregarIntegrante = () => {
        const nuevos = [...selectedProyecto.integrantes, { nombre: '', apellido: '', id: '', grado: '' }];
        setSelectedProyecto({ ...selectedProyecto, integrantes: nuevos });
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
            renderCell: (params) => (
                <>
                    <Tooltip title="Editar">
                        <IconButton onClick={() => handleEditClick(params.row)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
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
                    <Tooltip title="Generar PDF">
                        <IconButton
                            onClick={async () => {
                                const ref = collection(db, 'proyectos', params.row.id, 'avances');
                                const snapshot = await getDocs(ref);
                                const hitos = snapshot.docs.map(doc => ({
                                    ...doc.data(),
                                    fecha: doc.data().fecha?.toDate().toLocaleDateString() || '',
                                    descripcion: doc.data().descripcion || ''
                                }));
                                generarPDF(params.row, hitos);
                            }}
                        >
                            <PictureAsPdfIcon />
                        </IconButton>
                    </Tooltip>
                </>
            )
        }
    ];

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Proyectos creados por ti</Typography>
            {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
            <Box sx={{ height: 500, width: '100%' }}>
                <DataGrid
                    rows={proyectos}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={() => generarPDFGeneral(proyectos)}
                >
                    Descargar PDF general
                </Button>
            </Box>
            <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth>
                <DialogTitle>Editar Proyecto</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="Nombre del proyecto" margin="normal" value={selectedProyecto?.nombreProyecto || ''} onChange={(e) => setSelectedProyecto({ ...selectedProyecto, nombreProyecto: e.target.value })} />
                    <TextField fullWidth label="Descripción" margin="normal" multiline rows={3} value={selectedProyecto?.descripcion || ''} onChange={(e) => setSelectedProyecto({ ...selectedProyecto, descripcion: e.target.value })} />
                    <TextField fullWidth label="Objetivos" margin="normal" multiline rows={3} value={selectedProyecto?.objetivos || ''} onChange={(e) => setSelectedProyecto({ ...selectedProyecto, objetivos: e.target.value })} />
                    <TextField fullWidth label="Institución" margin="normal" value={selectedProyecto?.institucion || ''} onChange={(e) => setSelectedProyecto({ ...selectedProyecto, institucion: e.target.value })} />
                    <TextField fullWidth label="Presupuesto estimado" margin="normal" value={selectedProyecto?.presupuesto || ''} onChange={(e) => setSelectedProyecto({ ...selectedProyecto, presupuesto: e.target.value })} />
                    <TextField fullWidth label="Observaciones" margin="normal" multiline rows={2} value={selectedProyecto?.observaciones || ''} onChange={(e) => setSelectedProyecto({ ...selectedProyecto, observaciones: e.target.value })} />
                    <TextField select fullWidth label="Área de conocimiento" margin="normal" value={selectedProyecto?.areaConocimiento || ''} onChange={(e) => setSelectedProyecto({ ...selectedProyecto, areaConocimiento: e.target.value })}>
                        <MenuItem value="Ciencias">Ciencias</MenuItem>
                        <MenuItem value="Tecnología">Tecnología</MenuItem>
                        <MenuItem value="Matemáticas">Matemáticas</MenuItem>
                        <MenuItem value="Ciencias Sociales">Ciencias Sociales</MenuItem>
                    </TextField>
                    <TextField fullWidth label="Fecha de inicio" type="date" margin="normal" InputLabelProps={{ shrink: true }} value={selectedProyecto?.fechaInicio || ''} onChange={(e) => setSelectedProyecto({ ...selectedProyecto, fechaInicio: e.target.value })} />
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>👥 Integrantes del equipo</Typography>
                    {selectedProyecto?.integrantes?.map((int, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                            <TextField label="Nombre" value={int.nombre} onChange={(e) => handleIntegranteChange(index, 'nombre', e.target.value)} size="small" />
                            <TextField label="Apellido" value={int.apellido} onChange={(e) => handleIntegranteChange(index, 'apellido', e.target.value)} size="small" />
                            <TextField label="ID" value={int.id} onChange={(e) => handleIntegranteChange(index, 'id', e.target.value)} size="small" />
                            <TextField label="Grado" value={int.grado} onChange={(e) => handleIntegranteChange(index, 'grado', e.target.value)} size="small" />
                            {selectedProyecto.integrantes.length > 1 && (
                                <IconButton color="error" onClick={() => eliminarIntegrante(index)}>
                                    <DeleteIcon />
                                </IconButton>
                            )}
                        </Box>
                    ))}
                    <Button variant="outlined" onClick={agregarIntegrante}>Agregar integrante</Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEdit(false)}>Cancelar</Button>
                    <Button onClick={handleUpdate} variant="contained">Guardar Cambios</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openDetalle} onClose={() => setOpenDetalle(false)} fullWidth>
                <DialogTitle>Detalles del Proyecto</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="Nombre del proyecto" margin="normal" value={detalleProyecto?.nombreProyecto || ''} disabled />
                    <TextField fullWidth label="Descripción" margin="normal" multiline rows={3} value={detalleProyecto?.descripcion || ''} disabled />
                    <TextField fullWidth label="Objetivos" margin="normal" multiline rows={2} value={detalleProyecto?.objetivos || ''} disabled />
                    <TextField fullWidth label="Institución" margin="normal" value={detalleProyecto?.institucion || ''} disabled />
                    <TextField fullWidth label="Presupuesto" margin="normal" value={detalleProyecto?.presupuesto || ''} disabled />
                    <TextField fullWidth label="Observaciones" margin="normal" multiline rows={2} value={detalleProyecto?.observaciones || ''} disabled />
                    <TextField fullWidth label="Área de conocimiento" margin="normal" value={detalleProyecto?.areaConocimiento || ''} disabled />
                    <TextField fullWidth label="Fecha de inicio" margin="normal" value={detalleProyecto?.fechaInicio || ''} disabled />
                    <TextField fullWidth label="Estado" margin="normal" value={detalleProyecto?.estado || ''} disabled />

                    {detalleProyecto?.cronogramaURL && (
                        <Box mt={2}>
                            <Typography>📎 Cronograma:</Typography>
                            <a href={detalleProyecto.cronogramaURL} target="_blank" rel="noopener noreferrer">
                                Ver archivo
                            </a>
                        </Box>
                    )}

                    {detalleProyecto?.integrantes?.length > 0 && (
                        <Box mt={2}>
                            <Typography variant="subtitle1">👥 Integrantes del equipo:</Typography>
                            {detalleProyecto.integrantes.map((int, i) => (
                                <Typography key={i} variant="body2" sx={{ ml: 2 }}>
                                    - {int.nombre} {int.apellido} | ID: {int.id} | Grado: {int.grado}
                                </Typography>
                            ))}
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
