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
import { useNavigate } from 'react-router-dom';
import TimelineIcon from '@mui/icons-material/Timeline';




const ListaProyectos = () => {
    const navigate = useNavigate();
    const [proyectos, setProyectos] = useState([]);
    const [selectedProyecto, setSelectedProyecto] = useState(null);
    const [openEdit, setOpenEdit] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [detalleProyecto, setDetalleProyecto] = useState(null);
    const [openDetalle, setOpenDetalle] = useState(false);


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

            {/* Diálogo para editar proyecto */}
            <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth>
                <DialogTitle>Editar Proyecto</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="Nombre del proyecto" margin="normal"
                        value={selectedProyecto?.nombreProyecto || ''}
                        onChange={(e) => setSelectedProyecto({ ...selectedProyecto, nombreProyecto: e.target.value })}
                    />
                    <TextField fullWidth label="Descripción" margin="normal" multiline rows={3}
                        value={selectedProyecto?.descripcion || ''}
                        onChange={(e) => setSelectedProyecto({ ...selectedProyecto, descripcion: e.target.value })}
                    />
                    <TextField fullWidth label="Objetivos" margin="normal" multiline rows={3}
                        value={selectedProyecto?.objetivos || ''}
                        onChange={(e) => setSelectedProyecto({ ...selectedProyecto, objetivos: e.target.value })}
                    />
                    <TextField fullWidth label="Institución" margin="normal"
                        value={selectedProyecto?.institucion || ''}
                        onChange={(e) => setSelectedProyecto({ ...selectedProyecto, institucion: e.target.value })}
                    />
                    <TextField fullWidth label="Presupuesto estimado" margin="normal"
                        value={selectedProyecto?.presupuesto || ''}
                        onChange={(e) => setSelectedProyecto({ ...selectedProyecto, presupuesto: e.target.value })}
                    />
                    <TextField fullWidth label="Observaciones" margin="normal" multiline rows={2}
                        value={selectedProyecto?.observaciones || ''}
                        onChange={(e) => setSelectedProyecto({ ...selectedProyecto, observaciones: e.target.value })}
                    />
                    <TextField select fullWidth label="Área de conocimiento" margin="normal"
                        value={selectedProyecto?.areaConocimiento || ''}
                        onChange={(e) => setSelectedProyecto({ ...selectedProyecto, areaConocimiento: e.target.value })}
                    >
                        <MenuItem value="Ciencias">Ciencias</MenuItem>
                        <MenuItem value="Tecnología">Tecnología</MenuItem>
                        <MenuItem value="Matemáticas">Matemáticas</MenuItem>
                        <MenuItem value="Ciencias Sociales">Ciencias Sociales</MenuItem>
                    </TextField>
                    <TextField fullWidth label="Fecha de inicio" type="date" margin="normal"
                        InputLabelProps={{ shrink: true }}
                        value={selectedProyecto?.fechaInicio || ''}
                        onChange={(e) => setSelectedProyecto({ ...selectedProyecto, fechaInicio: e.target.value })}
                    />
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
