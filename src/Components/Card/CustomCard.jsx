import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import './CustomCard.css';
import fondo from '../../img/fondocard.png';

const capitalize = (str) =>
  typeof str === 'string' ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : str;

const CustomCard = ({ user }) => {
  return (
    <Card className="card-container">
      <div className="card-image">
        <img src={fondo} alt={user.Fruta} />
      </div>
      <CardContent className="card-content">
        <Typography className="card-title">
          {capitalize(user.Fruta)}
        </Typography>
        <Typography className="card-subtitle">
          {capitalize(user.NombreCientifico)}
        </Typography>
        <div className="card-details">
          <div><strong>Región:</strong> <span>{capitalize(user.Region)}</span></div>
          <div><strong>Color:</strong> <span>{capitalize(user.Color)}</span></div>
          <div><strong>Sabor:</strong> <span>{capitalize(user.Sabor)}</span></div>
          <div><strong>Textura:</strong> <span>{capitalize(user.Textura)}</span></div>
          <div>
            <strong>Vitaminas:</strong>{' '}
            <span>{user.Vitaminas?.map(capitalize).join(', ') || 'N/A'}</span>
          </div>
          <div>
            <strong>Minerales:</strong>{' '}
            <span>{user.Minerales?.map(capitalize).join(', ') || 'N/A'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomCard;
