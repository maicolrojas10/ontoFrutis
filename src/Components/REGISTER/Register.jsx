import React, { useState } from "react";
import {
  Container, TextField, Button, Typography, Box, Snackbar, Alert
} from "@mui/material";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../../config/firebase.js";
import { useNavigate } from "react-router-dom";
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './Register.css';

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardar el nombre completo en el perfil de Auth
      await updateProfile(user, {
        displayName: fullName
      });

      // Guardar datos adicionales en Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        createdAt: new Date()
      });

      setSnackbar({ open: true, message: "Usuario creado con éxito", severity: "success" });

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error("Error al registrar:", err);
      setSnackbar({ open: true, message: "Error al registrar el usuario", severity: "error" });
    }
  };

  return (
    <div className="register-container">
      <Container maxWidth="sm">
        <Box className="register-box">
          <Typography variant="h4" gutterBottom className="register-title">
            Crea tu cuenta
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              className="register-input"
              label="Nombre completo"
              fullWidth
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <TextField
              className="register-input"
              label="Correo electrónico"
              fullWidth
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              className="register-input"
              label="Contraseña"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Box className="register-button-group">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className="register-button"
                startIcon={<PersonAddAlt1Icon />}
              >
                Registrar
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outlined"
                color="primary"
                className="register-button"
                startIcon={<ArrowBackIcon />}
              >
                Cancelar
              </Button>
            </Box>


          </form>
        </Box>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
