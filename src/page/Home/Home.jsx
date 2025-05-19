import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import CustomCard from '../../Components/Card/CustomCard';

const Home = () => {
  const [frutas, setFrutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://equal-adjusted-mongrel.ngrok-free.app/api/frutas', {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {

        setFrutas(data);
        console.log(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="home-container">
      <div className="intro-section" id="inicio">
        <h1>🍇 Bienvenido a OntoFrutis 🍍</h1>
        <h3>
          OntoFrutis es una app web que permite consultar información sobre frutas y sus vitaminas usando
          una ontología semántica conectada a Apache Jena Fuseki.
        </h3>
        <p>Explora el maravilloso mundo de las frutas, sus beneficios y vitaminas esenciales.</p>
        <blockquote>“Comer frutas no solo alimenta tu cuerpo, también nutre tu vida.”</blockquote>
      </div>

      <div className="center-button">
        <Link to="/consultar" className="explore-button">
          🍊 Consultar Frutas
        </Link>
      </div>

      <main>
        {loading ? (
          <p>Cargando frutas...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>Error al cargar los datos: {error}</p>
        ) : (
          <div className="cards-grid">
            {frutas.map((fruta) => (
              <CustomCard key={fruta.ID} user={fruta} showFullDetails={false} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
