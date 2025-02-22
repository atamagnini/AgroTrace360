import Image from "next/image";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const googleMapsApiKey = 'AIzaSyCNEVHEAz5iJEAUpOdvONq9IVMTR8gHg0E';

export default function Campo() {
  // State hooks for each form field
  const [nombre, setNombre] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [cantidadHa, setCantidadHa] = useState('');
  const [latitud, setLatitud] = useState(0);
  const [longitud, setLongitud] = useState(0);
  const [mapCenter, setMapCenter] = useState({ lat: 45.123456, lng: -67.123456 }); // Default center of the map

  // Handler function to submit form data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare data to send to the Lambda API
    const farmData = {
      nombre,
      latitud,
      longitud,
      cantidad_ha: cantidadHa,
    };

    try {
      // Send the POST request to the Lambda API
      const response = await axios.post(
        'https://3vck6sr1aa.execute-api.us-east-1.amazonaws.com/agregar-campo/agregar-campo',
        farmData
      );
      console.log('Farm data submitted successfully:', response.data);
      // Refresh the page after successful submission
      window.location.reload();
    } catch (error) {
      console.error('Error submitting farm data:', error);
    }
  };

  // Function to handle map click to get lat and long
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    const lat = e.latLng?.lat() || 0;
    const lng = e.latLng?.lng() || 0;
    setLatitud(lat);
    setLongitud(lng);
    setMapCenter({ lat, lng });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Cuéntanos sobre tu campo</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="nombre">Nombre del campo:</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="border p-2"
          />
        </div>
        
        {/* <div>
          <label htmlFor="ubicacion">Ubicación:</label>
          <input
            type="text"
            id="ubicacion"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            className="border p-2"
            placeholder="Escribe la dirección o usa el mapa"
          />
        </div> */}

        <div>
          <label htmlFor="cantidad_ha">Cantidad de hectáreas:</label>
          <input
            type="number"
            id="cantidad_ha"
            value={cantidadHa}
            onChange={(e) => setCantidadHa(e.target.value)}
            required
            className="border p-2"
          />
        </div>

        {/* Google Map Component */}
        <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={['places']}>
          <GoogleMap
            mapContainerStyle={{ height: '400px', width: '100%' }}
            center={mapCenter}
            zoom={15}
            onClick={handleMapClick}  // Handle map click to set latitude and longitude
          >
            <Marker position={mapCenter} />
          </GoogleMap>
        </LoadScript>

        <button type="submit" className="mt-4 bg-yellow-500 text-white p-2 rounded">
          Aceptar
        </button>
      </form>
    </main>
  );
}
