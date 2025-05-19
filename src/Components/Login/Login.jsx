import React, { useState } from 'react';
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { app, db } from '../../../config/firebase';
import {
  Button, TextField, Container, Box, Typography,
  Snackbar, Alert, Divider
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import '../LOGIN/Login.css';
import { FaGoogle } from 'react-icons/fa';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const guardarUsuario = (nombre, rol) => {
    localStorage.setItem('userName', nombre);
    localStorage.setItem('userRole', rol);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        guardarUsuario(`${userData.name} ${userData.lastName}`, userData.role);
      } else {
        guardarUsuario(user.email, 'Sin rol');
      }

      navigate('/Home');
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
      setOpenSnackbar(true);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      guardarUsuario(user.displayName || user.email, 'Sin rol');
      navigate('/Home');
    } catch (error) {
      console.error("Error con Google Sign-In:", error.message);
      setOpenSnackbar(true);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box className="login-box">
        <img src="https://www.frutamare.com/wp-content/uploads/2020/03/frutas.jpg.webp" alt="Innovar Proyectos Logo" className="logo" />
        <Typography variant="h6" align="center" color="textSecondary">
          Bienvenido a la Plataforma ontológica OntoFrutis
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            label="Contraseña"
            variant="outlined"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            className="login-button"
          >
            Iniciar Sesión
          </Button>

          <Divider sx={{ my: 2 }}>O inicia con</Divider>

          <Box display="flex" justifyContent="center" gap={2} my={2}>
            <Button
              onClick={handleGoogleLogin}
              variant="outlined"
              sx={{
                minWidth: 48,
                height: 48,
                borderRadius: '50%',
                padding: 0
              }}
            >
              <FaGoogle size={20} />
            </Button>
          </Box>

          <Box className="register-link-box">
            <Link to="/registro" className="register-link">
              ¿No tienes cuenta? Crear cuenta
            </Link>
          </Box>
        </form>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        className="snackbar"
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="error"
          variant="filled"
          className="alert"
        >
          Credenciales inválidas
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Login;
