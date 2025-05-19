import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import logo from '../../img/logo.jpg';
import { FiLogOut } from 'react-icons/fi';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // Elimina sesión
    navigate('/'); // Redirige al login
  };

  return (
    <header className="header">
      <div className="imgLogo">
        <img src={logo} alt="Logo Fruta" className="logo" />
        <h1>OntoFrutis</h1>
      </div>
      <nav className="navbar">
        <ul>
          <li><Link to="/Home">Inicio</Link></li>
          <li><Link to="/filter/climaterica">Climatéricas</Link></li>
          <li><Link to="/filter/no_climaterica">No Climatéricas</Link></li>
          <li><Link to="/InsertNew">Agregar Fruta</Link></li>
          <li>
            <button onClick={handleLogout} className="logout-icon-button" title="Cerrar sesión">
              <FiLogOut size={20} />
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
