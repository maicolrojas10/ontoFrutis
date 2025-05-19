// src/Components/Auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
const user = localStorage.getItem('userName');

  if (!user) {
    return <Navigate to="/" replace />; // Redirige al login
  }

  return children;
};

export default ProtectedRoute;
