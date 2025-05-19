import React, { useState } from 'react';
import {
  TextField, Button, Box, Typography, Snackbar, Alert, Chip, Stack,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import './InsertNew.css';

const InsertNew = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    clase: '',
    id: '',
    nombreComun: '',
    nombreCientifico: '',
    region: '',
    contenidoAgua: '',
    color: '',
    sabor: '',
    textura: '',
    vitaminas: [],
    minerales: [],
  });

  const [vitaminaInput, setVitaminaInput] = useState('');
  const [mineralInput, setMineralInput] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [modal, setModal] = useState({
    open: false,
    title: '',
    message: '',
    isSuccess: false
  });

  // Actualiza el estado general del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Agrega vitamina o mineral a su lista correspondiente
  const handleAddItem = (key, value, setter) => {
    const trimmedValue = value.trim().toLowerCase();
    if (trimmedValue && !formData[key].includes(trimmedValue)) {
      setFormData(prev => ({
        ...prev,
        [key]: [...prev[key], trimmedValue]
      }));
      setter('');
    }
  };

  // Elimina vitamina o mineral de su lista
  const handleDeleteItem = (key, itemToDelete) => {
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].filter(item => item !== itemToDelete)
    }));
  };

  // Limpia el formulario
  const limpiarFormulario = () => {
    setFormData({
      clase: '',
      id: '',
      nombreComun: '',
      nombreCientifico: '',
      region: '',
      contenidoAgua: '',
      color: '',
      sabor: '',
      textura: '',
      vitaminas: [],
      minerales: [],
    });
    setVitaminaInput('');
    setMineralInput('');
  };

  // Envía los datos al backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos obligatorios según backend
    if (!formData.clase || !formData.id || !formData.nombreComun || !formData.region || !formData.color || !formData.sabor) {
      setSnackbar({
        open: true,
        message: 'Completa los campos obligatorios: clase, id, nombre común, región, color y sabor.',
        severity: 'warning'
      });
      return;
    }

    const dataToSend = {
      clase: formData.clase.toLowerCase(),
      id: formData.id.toString(),
      nombreComun: formData.nombreComun,
      nombreCientifico: formData.nombreCientifico || '',
      region: formData.region,
      contenidoAgua: formData.contenidoAgua ? formData.contenidoAgua.toString() : '',
      color: formData.color,
      sabor: formData.sabor,
      textura: formData.textura || '',
      vitaminas: formData.vitaminas.join(','),
      minerales: formData.minerales.join(',')
    };

    try {
      const response = await fetch('https://equal-adjusted-mongrel.ngrok-free.app/api/frutas/insertar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      setModal({
        open: true,
        title: 'Fruta agregada con éxito 🎉',
        message: '¿Deseas agregar otra fruta?',
        isSuccess: true
      });

    } catch (error) {
      console.error('Error al insertar fruta:', error);
      setModal({
        open: true,
        title: 'Error al ingresar la fruta ❌',
        message: 'Ocurrió un error al intentar agregar la fruta. Intenta de nuevo más tarde.',
        isSuccess: false
      });
    }
  };

  const handleCloseModal = () => setModal(prev => ({ ...prev, open: false }));

  const handleRespuestaModal = (respuesta) => {
    setModal(prev => ({ ...prev, open: false }));
    if (respuesta === 'si') {
      limpiarFormulario();
    } else {
      navigate('/Home');
    }
  };

  return (
    <div className="insert-new-container">
      <Box className="form-box">
        <Typography variant="h4" className="form-title">Agregar Nueva Fruta 🍓</Typography>
        <form onSubmit={handleSubmit} className="form-content">

          {/* Campo Clase */}
          <TextField
            label="Clase (climaterica / noclimaterica)"
            name="clase"
            fullWidth
            variant="outlined"
            className="form-input"
            value={formData.clase}
            onChange={handleChange}
            required
          />

          {/* Campo ID */}
          <TextField
            label="ID"
            name="id"
            fullWidth
            variant="outlined"
            className="form-input"
            value={formData.id}
            onChange={handleChange}
            required
          />

          {/* Campo Nombre Común */}
          <TextField
            label="Nombre Común"
            name="nombreComun"
            fullWidth
            variant="outlined"
            className="form-input"
            value={formData.nombreComun}
            onChange={handleChange}
            required
          />

          {/* Campo Nombre Científico */}
          <TextField
            label="Nombre Científico"
            name="nombreCientifico"
            fullWidth
            variant="outlined"
            className="form-input"
            value={formData.nombreCientifico}
            onChange={handleChange}
          />

          {/* Campo Región */}
          <TextField
            label="Región"
            name="region"
            fullWidth
            variant="outlined"
            className="form-input"
            value={formData.region}
            onChange={handleChange}
            required
          />

          {/* Campo Contenido de Agua */}
          <TextField
            label="Contenido de Agua (%)"
            name="contenidoAgua"
            fullWidth
            variant="outlined"
            className="form-input"
            value={formData.contenidoAgua}
            onChange={handleChange}
            type="number"
            inputProps={{ min: 0, max: 100, step: 0.1 }}
          />

          {/* Campo Color */}
          <TextField
            label="Color"
            name="color"
            fullWidth
            variant="outlined"
            className="form-input"
            value={formData.color}
            onChange={handleChange}
            required
          />

          {/* Campo Sabor */}
          <TextField
            label="Sabor"
            name="sabor"
            fullWidth
            variant="outlined"
            className="form-input"
            value={formData.sabor}
            onChange={handleChange}
            required
          />

          {/* Campo Textura */}
          <TextField
            label="Textura"
            name="textura"
            fullWidth
            variant="outlined"
            className="form-input"
            value={formData.textura}
            onChange={handleChange}
          />

          {/* Vitaminas */}
          <Box className="form-input" sx={{ mt: 2 }}>
            <TextField
              label="Agregar Vitamina"
              fullWidth
              value={vitaminaInput}
              onChange={(e) => setVitaminaInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('vitaminas', vitaminaInput, setVitaminaInput))}
            />
            <Button
              onClick={() => handleAddItem('vitaminas', vitaminaInput, setVitaminaInput)}
              startIcon={<AddIcon />}
              variant="contained"
              sx={{ mt: 1 }}
            >
              Añadir Vitamina
            </Button>
            <Stack direction="row" spacing={1} mt={1}>
              {formData.vitaminas.map((v, i) => (
                <Chip key={i} label={v} onDelete={() => handleDeleteItem('vitaminas', v)} color="primary" />
              ))}
            </Stack>
          </Box>

          {/* Minerales */}
          <Box className="form-input" sx={{ mt: 2 }}>
            <TextField
              label="Agregar Mineral"
              fullWidth
              value={mineralInput}
              onChange={(e) => setMineralInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('minerales', mineralInput, setMineralInput))}
            />
            <Button
              onClick={() => handleAddItem('minerales', mineralInput, setMineralInput)}
              startIcon={<AddIcon />}
              variant="contained"
              sx={{ mt: 1 }}
            >
              Añadir Mineral
            </Button>
            <Stack direction="row" spacing={1} mt={1}>
              {formData.minerales.map((m, i) => (
                <Chip key={i} label={m} onDelete={() => handleDeleteItem('minerales', m)} color="secondary" />
              ))}
            </Stack>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Button type="submit" variant="contained" color="success" fullWidth>
              Insertar Fruta
            </Button>
          </Box>
        </form>
      </Box>

      {/* Snackbar para mensajes */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Modal de confirmación */}
      <Dialog open={modal.open} onClose={handleCloseModal}>
        <DialogTitle>{modal.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{modal.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          {modal.isSuccess ? (
            <>
              <Button onClick={() => handleRespuestaModal('no')}>No</Button>
              <Button onClick={() => handleRespuestaModal('si')} autoFocus>Sí</Button>
            </>
          ) : (
            <Button onClick={handleCloseModal} autoFocus>Cerrar</Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default InsertNew;