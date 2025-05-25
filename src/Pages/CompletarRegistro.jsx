import React, { useState } from 'react';
import { Box, Typography, TextField, Button, MenuItem, Paper } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../Firebase/Firebase';

const CompletarRegistro = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { uid, email, nombre } = location.state || {};
    const [nombreCompleto, setNombreCompleto] = useState(nombre || '');
    const [rol, setRol] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rol || !nombreCompleto) return;

        await setDoc(doc(db, 'users', uid), {
            email,
            nombre: nombreCompleto,
            rol,
        });

        if (rol === 'coordinador') navigate('/coordinador');
        else if (rol === 'docente') navigate('/docente');
        else navigate('/estudiante');
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundImage: 'url("/fondo.png")',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    backdropFilter: 'blur(5px)',
                    backgroundColor: 'rgba(0, 0, 0, 0.67)',
                    zIndex: 1,
                }}
            >
                <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                    <Paper sx={{ p: 4, width: '100%', maxWidth: 500 }}>
                        <Typography variant="h5" gutterBottom>Completa tu registro</Typography>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Nombre completo"
                                margin="normal"
                                value={nombreCompleto}
                                onChange={(e) => setNombreCompleto(e.target.value)}
                                required
                            />
                            <TextField
                                fullWidth
                                select
                                label="Rol"
                                margin="normal"
                                value={rol}
                                onChange={(e) => setRol(e.target.value)}
                                required
                            >
                                <MenuItem value="coordinador">Coordinador</MenuItem>
                                <MenuItem value="docente">Docente</MenuItem>
                                <MenuItem value="estudiante">Estudiante</MenuItem>
                            </TextField>
                            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Finalizar registro</Button>
                        </form>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default CompletarRegistro;
