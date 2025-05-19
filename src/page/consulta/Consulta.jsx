import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  FormControl,
  TextField
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CustomCard from '../../Components/Card/CustomCard';
import '../consulta/Consulta.css';

const ConsultaFrutas = () => {
  const [open, setOpen] = useState(true);
  const [resultado, setResultado] = useState([]);
  const [modalNoCoincidencia, setModalNoCoincidencia] = useState(false);
  const navigate = useNavigate();

  // Usamos las claves en minúsculas y sin tildes
  const [formData, setFormData] = useState({
    color: '',
    mineral: '',
    sabor: '',
    region: '',
    vitamina: ''
  });

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    const queryParams = [];

    if (formData.color.trim()) queryParams.push(`color=${encodeURIComponent(formData.color.trim())}`);
    if (formData.mineral.trim()) queryParams.push(`mineral=${encodeURIComponent(formData.mineral.trim())}`);
    if (formData.sabor.trim()) queryParams.push(`sabor=${encodeURIComponent(formData.sabor.trim())}`);
    if (formData.region.trim()) queryParams.push(`region=${encodeURIComponent(formData.region.trim())}`);
    if (formData.vitamina.trim()) queryParams.push(`vitamina=${encodeURIComponent(formData.vitamina.trim())}`);

    if (queryParams.length === 0) {
      alert('Debes llenar al menos un campo para hacer la búsqueda.');
      return;
    }

    const queryString = queryParams.join('&');
    const url = `https://equal-adjusted-mongrel.ngrok-free.app/api/frutas/buscar?${queryString}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      const result = await response.json();

      if (result?.error) {
        alert(`Error: ${result.error}`);
        return;
      }

      const data = Array.isArray(result) ? result : [result];

      if (data.length === 0) {
        setModalNoCoincidencia(true);
      } else {
        setResultado(data);
        setOpen(false);
      }
    } catch (error) {
      console.error('Error en la consulta:', error);
      alert('Error al consultar la API.');
    }
  };

  const handleCancel = () => {
    setOpen(false);
    navigate('/Home');
  };

  const handleCloseNoCoincidencia = () => {
    setModalNoCoincidencia(false);
  };

  // Ahora campos tiene `name` (clave en formData) y label (lo que ve usuario)
  const campos = [
    {
      name: 'color',
      label: 'Color',
      helperText: 'Colores que tiene comúnmente la fruta.'
    },
    {
      name: 'mineral',
      label: 'Mineral',
      helperText: 'Diferentes minerales que tiene la fruta. Ej: Hierro, Cobre, Calcio...'
    },
    {
      name: 'sabor',
      label: 'Sabor',
      helperText: 'Sabor de la fruta: amargo, dulce, ácido, etc.'
    },
    {
      name: 'region',
      label: 'Región',
      helperText: 'Región de origen de la fruta.'
    },
    {
      name: 'vitamina',
      label: 'Vitamina',
      helperText: 'Vitaminas que contiene la fruta.'
    }
  ];

  return (
    <>
      <Modal open={open} onClose={handleCancel}>
        <Box className="consulta-modal">
          <Typography variant="h6" className="consulta-titulo">
            Parámetros de Consulta
          </Typography>

          {campos.map(({ name, label, helperText }, index) => (
            <FormControl key={index} fullWidth margin="normal">
              <TextField
                label={label}
                value={formData[name]}
                onChange={(e) => handleChange(name, e.target.value)}
                helperText={helperText}
                variant="outlined"
              />
            </FormControl>
          ))}

          <div className="consulta-boton-contenedor" style={{ justifyContent: 'space-between' }}>
            <Button variant="outlined" color="secondary" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Consultar
            </Button>
          </div>
        </Box>
      </Modal>

      <Modal open={modalNoCoincidencia} onClose={handleCloseNoCoincidencia}>
        <Box className="consulta-modal" style={{ maxWidth: 400, textAlign: 'center' }}>
          <Typography variant="h6" className="consulta-titulo">
            No existen coincidencias
          </Typography>
          <Typography>
            No se encontraron resultados con los parámetros ingresados. Por favor intenta de nuevo.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCloseNoCoincidencia}
            style={{ marginTop: 24 }}
          >
            Cerrar
          </Button>
        </Box>
      </Modal>

      {resultado.length > 0 && (
        <div className="card-wrapper">
          {resultado.map((fruta, index) => (
            <CustomCard key={index} user={fruta} />
          ))}
        </div>
      )}
    </>
  );
};

export default ConsultaFrutas;
