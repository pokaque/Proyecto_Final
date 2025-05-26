import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../Firebase/Firebase';
import {
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
  Alert,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import './ListaUsuarios.css';

const ListaUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [openCrear, setOpenCrear] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);

  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoPassword, setNuevoPassword] = useState('');
  const [nuevoRol, setNuevoRol] = useState('estudiante');
  const [nuevoNombre, setNuevoNombre] = useState('');

  const fetchUsuarios = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsuarios(lista);
    } catch (error) {
      setErrorMsg('Error al cargar usuarios');
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleChangeRol = async (id, nuevoRol) => {
    try {
      await updateDoc(doc(db, 'users', id), { rol: nuevoRol });
      setSuccessMsg('Rol actualizado correctamente');
      fetchUsuarios();
    } catch (error) {
      setErrorMsg('Error al actualizar rol');
    }
  };

  const handleEliminarUsuario = async (id) => {
    const confirm = window.confirm('¿Deseas eliminar este usuario?');
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, 'users', id));
      setSuccessMsg('Usuario eliminado');
      fetchUsuarios();
    } catch (error) {
      setErrorMsg('Error al eliminar usuario');
    }
  };

  const handleCrearUsuario = async () => {
    if (!nuevoEmail || !nuevoPassword || !nuevoRol) {
      setErrorMsg('Completa todos los campos');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, nuevoEmail, nuevoPassword);
      const newUser = userCredential.user;

      await setDoc(doc(db, 'users', newUser.uid), {
        uid: newUser.uid,
        email: nuevoEmail,
        rol: nuevoRol,
        nombre: nuevoNombre,
      });

      setSuccessMsg('Usuario creado correctamente');
      setNuevoEmail('');
      setNuevoPassword('');
      setNuevoRol('estudiante');
      setNuevoNombre('');
      setOpenCrear(false);
      fetchUsuarios();
    } catch (error) {
      setErrorMsg('Error al crear usuario: ' + error.message);
    }
  };

  const handleEditarClick = (row) => {
    setSelectedUsuario({ ...row });
    setOpenEditar(true);
  };

  const handleGuardarEdicion = async () => {
    const { id, nombre, rol } = selectedUsuario;

    try {
      await updateDoc(doc(db, 'users', id), {
        nombre,
        rol,
      });

      setSuccessMsg('Usuario actualizado correctamente');
      setOpenEditar(false);
      fetchUsuarios();
    } catch (error) {
      setErrorMsg('Error al editar usuario: ' + error.message);
    }
  };

  const columns = [
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'nombre', headerName: 'Nombre', flex: 1 },
    {
      field: 'rol',
      headerName: 'Rol',
      flex: 1,
      renderCell: (params) => (
        <Select
          size="small"
          value={params.row.rol}
          onChange={(e) => handleChangeRol(params.row.id, e.target.value)}
        >
          <MenuItem value="estudiante">Estudiante</MenuItem>
          <MenuItem value="docente">Docente</MenuItem>
          <MenuItem value="coordinador">Coordinador</MenuItem>
        </Select>
      )
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      flex: 1,
      renderCell: (params) => (
        <>
          <Tooltip title="Editar">
            <IconButton onClick={() => handleEditarClick(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton color="error" onClick={() => handleEliminarUsuario(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      )
    }
  ];

  return (
    <Box className="lista-usuarios-container">
      <Typography variant="h6" className="lista-usuarios-header">Usuarios Registrados</Typography>

      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

      <Box className="lista-usuarios-toolbar">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCrear(true)}
        >
          Crear Usuario
        </Button>
      </Box>

      <Box className="lista-usuarios-grid">
        <DataGrid
          rows={usuarios}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
        />
      </Box>

      <Dialog open={openCrear} onClose={() => setOpenCrear(false)} fullWidth>
        <DialogTitle>Crear nuevo usuario</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Nombre" margin="normal" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} />
          <TextField fullWidth label="Correo electrónico" margin="normal" value={nuevoEmail} onChange={(e) => setNuevoEmail(e.target.value)} />
          <TextField fullWidth label="Contraseña" margin="normal" type="password" value={nuevoPassword} onChange={(e) => setNuevoPassword(e.target.value)} />
          <Select fullWidth value={nuevoRol} onChange={(e) => setNuevoRol(e.target.value)} margin="normal" sx={{ mt: 2 }}>
            <MenuItem value="estudiante">Estudiante</MenuItem>
            <MenuItem value="docente">Docente</MenuItem>
            <MenuItem value="coordinador">Coordinador</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCrear(false)}>Cancelar</Button>
          <Button onClick={handleCrearUsuario} variant="contained">Crear</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditar} onClose={() => setOpenEditar(false)} fullWidth>
        <DialogTitle>Editar usuario</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre"
            margin="normal"
            value={selectedUsuario?.nombre || ''}
            onChange={(e) => setSelectedUsuario({ ...selectedUsuario, nombre: e.target.value })}
          />
          <Select
            fullWidth
            value={selectedUsuario?.rol || 'estudiante'}
            onChange={(e) => setSelectedUsuario({ ...selectedUsuario, rol: e.target.value })}
            margin="normal"
            sx={{ mt: 2 }}
          >
            <MenuItem value="estudiante">Estudiante</MenuItem>
            <MenuItem value="docente">Docente</MenuItem>
            <MenuItem value="coordinador">Coordinador</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditar(false)}>Cancelar</Button>
          <Button onClick={handleGuardarEdicion} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ListaUsuarios;
