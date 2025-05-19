import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Components/Header/Header';
import Home from './page/Home/Home';
import FilterPage from './Components/Filterpage/Filterpage';
import ConsultaFrutas from './page/consulta/Consulta';
import Login from './Components/Login/Login';
import ProtectedRoute from './Components/RutaProtegida/ProtectedRoute';
import Register  from './Components/REGISTER/Register';
import InsertNew from './page/InsertNew/InsertNew';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Register />} />

        {/* Rutas protegidas */}
        <Route
          path="/Home"
          element={
            <ProtectedRoute>
              <Header />
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consultar"
          element={
            <ProtectedRoute>
              <Header />
              <ConsultaFrutas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/filter/:genero"
          element={
            <ProtectedRoute>
              <Header />
              <FilterPage />
            </ProtectedRoute>
          }
        />

           <Route
          path="/InsertNew"
          element={
            <ProtectedRoute>
              <Header />
              <InsertNew />
            </ProtectedRoute>
          }
        />




      </Routes>
    </Router>
  );
};

export default App;
