/* eslint-disable */

//addFields.tsx
'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import dynamic from 'next/dynamic';
const DynamicGoogleMap = dynamic(
  () => import('@react-google-maps/api').then((mod) => mod.GoogleMap),
  { ssr: false }
);
import { GoogleMap, LoadScript, Marker, StandaloneSearchBox } from '@react-google-maps/api';



const GOOGLE_MAPS_API_KEY = 'AIzaSyCNEVHEAz5iJEAUpOdvONq9IVMTR8gHg0E';
const libraries: ["places"] = ["places"];

export default function Campo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [nombre, setNombre] = useState('');
  const [cantidadHa, setCantidadHa] = useState('');
  const [latitud, setLatitud] = useState(0);
  const [longitud, setLongitud] = useState(0);
  const [mapCenter, setMapCenter] = useState({ lat: 45.123456, lng: -67.123456 });
  const [address] = useState('');
  const autocompleteRef = React.useRef<google.maps.places.SearchBox | null>(null);
  
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateErrorMessage, setDuplicateErrorMessage] = useState('');
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const handleMapApiLoaded = () => {
    setIsMapLoaded(true);
  };

  /* const handleGeocoding = () => {
    if (!address) return;
    
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        setLatitud(lat);
        setLongitud(lng);
        setMapCenter({ lat, lng });
      } else {
        alert('No se pudo encontrar la ubicación: ' + status);
      }
    });
  }; */

  useEffect(() => {
    if (isMapLoaded) {
      console.log("Google Maps API loaded successfully");
    }
  }, [isMapLoaded]);

  
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    console.log("Submitting farm data...");
  
    if (!id) {
      console.error("User ID is missing");
      return;
    }
  
    if (!nombre || !cantidadHa || !latitud || !longitud) {
      console.error("All fields must be filled.");
      return;
    }
  
    const farmData = {
      nombre,
      latitud,
      longitud,
      cantidad_ha: cantidadHa,
      idcuentas: id,
    };
  
    try {
      const response = await axios.post(
        'https://3vck6sr1aa.execute-api.us-east-1.amazonaws.com/agregar-campo/agregar-campo',
        farmData
      );
      
      // Fetch the newly added field to get its ID and navigate to overviewField with that field's ID
      try {
        const fieldResponse = await axios.post(
          'https://cbv6225k4g.execute-api.us-east-1.amazonaws.com/get-field-data/get-field-data',
          { idcuentas: id },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const fieldData = JSON.parse(fieldResponse.data.body);
        
        if (fieldData.length > 0) {
          const newFieldId = fieldData[fieldData.length - 1].idcampo;
          navigate(`/${id}/overviewField?idcampo=${newFieldId}`);
        } else {
          navigate(`/${id}/overviewField`);
        }
      } catch (error) {
        console.error('Error fetching new field:', error);
        navigate(`/${id}/overviewField`);
      }
    
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        setDuplicateErrorMessage(error.response.data.message || 'Ya existe un campo con este nombre');
        setShowDuplicateModal(true);
        return;
      } 
        console.error('Error submitting farm data:', error);
        alert('Error al agregar el campo');
      
    }
  };
    
  
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    const lat = e.latLng?.lat() || 0;
    const lng = e.latLng?.lng() || 0;
    setLatitud(lat);
    setLongitud(lng);
    setMapCenter({ lat, lng });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* Duplicate Field Error Modal */}
      <Modal show={showDuplicateModal} onHide={() => setShowDuplicateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nombre de Campo Duplicado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {duplicateErrorMessage}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDuplicateModal(false)}>
            Entendido
          </Button>
        </Modal.Footer>
      </Modal>

      <h1>Cuéntanos sobre tu campo</h1>
      <h2>Bienvenido, {username}!</h2>

      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 p-3 text-white bg-blue-500 rounded-full text-xl hover:bg-blue-600 transition duration-200 flex items-center justify-center"
      >
        
        <FaSignOutAlt className="text-white" size={24} />
      </button>

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
        <p className="text-xs text-red-500 mt-1">
          Nota: No se permiten nombres de campo duplicados
        </p>
      </div>

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

        <LoadScript 
          googleMapsApiKey={GOOGLE_MAPS_API_KEY} 
          libraries={libraries}
          onLoad={handleMapApiLoaded}
        >
          {isMapLoaded && (
            <>
              <div>
                <label htmlFor="address">Dirección o ubicación:</label>
                <StandaloneSearchBox
                  onLoad={(ref) => {
                    autocompleteRef.current = ref;
                  }}
                  onPlacesChanged={() => {
                    const places = autocompleteRef.current?.getPlaces();
                    if (places && places.length > 0) {
                      const place = places[0];
                      if (place.geometry && place.geometry.location) {
                        const lat = place.geometry.location.lat();
                        const lng = place.geometry.location.lng();
                        setLatitud(lat);
                        setLongitud(lng);
                        setMapCenter({ lat, lng });
                      }
                    }
                  }}
                >
                  <input
                    type="text"
                    placeholder="Ingrese una dirección o ubicación"
                    className="border p-2 w-full"
                  />
                </StandaloneSearchBox>
              </div>

              <div className="relative left-1/2 right-1/2 -ml-[60%] -mr-[60%] w-[120%]">
              <DynamicGoogleMap
                mapContainerStyle={{ height: '400px', width: '100%' }}
                center={mapCenter}
                zoom={15}
                onClick={handleMapClick}
              >
                <Marker position={mapCenter} />
              </DynamicGoogleMap>


              </div>
            </>
          )}
        </LoadScript>


        <button 
          type="submit" 
          disabled={!nombre || !cantidadHa || !latitud || !longitud} 
          className="mt-4 bg-yellow-500 text-white p-2 rounded"
        >
          Aceptar
        </button>
      </form>
    </main>
  );
}
