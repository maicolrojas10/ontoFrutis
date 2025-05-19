import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // ← importar esto
import CustomCard from '../Card/CustomCard';
import './Filterpage.css';
const FilterPage = () => {
  const { genero } = useParams();
  const [frutas, setFrutas] = useState([]);

  useEffect(() => {
    const fetchFrutas = async () => {
      let category;
      if (genero === 'climaterica') category = 'Climatericas';
      else if (genero === 'no_climaterica') category = 'noclimatericas';
      else category = 'noclimatericas';

      const response = await fetch(`https://equal-adjusted-mongrel.ngrok-free.app/api/frutas/clasificacion/${category}`, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });
      const data = await response.json();
      setFrutas(data);
    };

    fetchFrutas();
  }, [genero]);

  return (
    <div className="card-wrapper">
      {frutas.length > 0 ? (
        frutas.map((fruta) => (
          <CustomCard key={fruta.ID} user={fruta} />
        ))
      ) : (
        <p>No hay frutas para esta categoría.</p>
      )}
    </div>
  );
};

export default FilterPage;
