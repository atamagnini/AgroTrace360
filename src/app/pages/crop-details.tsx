/* eslint-disable */

'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';

export default function CropDetails() {
  const { cropId, id } = useParams();
  const navigate = useNavigate();
  const [crop, setCrop] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const [showAvailabilityModal, setShowAvailabilityModal] = useState<boolean>(false);
  const [availabilityData, setAvailabilityData] = useState({
    name: '',
    address: ''
  });

  const handleDeleteAvailability = async (idavailability: string) => {
    console.log("Deleting availability with id:", idavailability); // Debugging log
    try {
      const response = await axios.post(
        'https://ljipzbeadb.execute-api.us-east-1.amazonaws.com/delete-availability/delete-availability',
        { idavailability: idavailability }, 
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      if (response.status === 200) {
        alert('Disponibilidad eliminada con éxito');
        fetchCropDetails(); 
      }
    } catch (err) {
      console.error('Error deleting availability:', err);
      alert('Error al eliminar disponibilidad');
    }
  };  
  
  interface Treatment {
    idtreatment: string; 
    nombre: string;
    fecha: string;
  }  
  
  const handleAddAvailability = async () => {
    try {
      const postData = {
        idcrops: cropId,
        idcuentas: id,
        idcampo: crop.idcampo,
        name: availabilityData.name,
        address: availabilityData.address
      };
      
      console.log("Sending data to API:", postData);
      
      const response = await axios.post(
        'https://ss502su5xg.execute-api.us-east-1.amazonaws.com/add-availability/add-availability',
        postData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status === 200) {
        alert('Disponibilidad agregada con éxito');
        setShowAvailabilityModal(false);
        fetchCropDetails();
      }
    } catch (err) {
      console.error('Error adding availability:', err);
      alert('Error al agregar disponibilidad');
    }
  };

  const fetchCropDetails = async () => {
    try {
      const response = await axios.post(
        'https://v0tm27km32.execute-api.us-east-1.amazonaws.com/crop-details/crop-details',
        { id: cropId },
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response.status === 200) {
        const cropData = JSON.parse(response.data.body);
        setCrop(cropData);
      }
    } catch (err) {
      setError('Error fetching crop details');
    }
  };

  useEffect(() => {
    if (cropId) {
      fetchCropDetails();
    }
  }, [cropId]);

  // Add the new debug useEffect here
  useEffect(() => {
    if (crop) {
      console.log("Full crop object:", JSON.stringify(crop));
      console.log("Crop data:", crop);
      console.log("idcampo value:", crop.idcampo);
    }
  }, [crop]);

  // Keep the existing error and loading checks
  if (error) {
    return <div>{error}</div>;
  }
  if (!crop) {
    return <div>Loading crop details...</div>;
  }

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString || dateString === "0000-00-00") return "N/A";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return "N/A";
    }
  };

  const handleBackClick = () => {
    navigate(`/${id}/catalogue`);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <button 
        onClick={handleBackClick}
        className="self-start mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Atrás
      </button>
      
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 text-left">
        <h1 className="text-2xl font-bold mb-4">{crop.cultivo}</h1>
        
        <p className="mb-4">{crop.descripcion}</p>
        
        <p className="mb-2"><strong>Número de Lote:</strong> {crop.numero_lote}</p>
        
        <p className="mb-2"><strong>Fecha de Cosecha:</strong> {formatDate(crop.fecha_cosecha)}</p>
        
        <p className="mb-4"><strong>Campo:</strong> {crop.campo_nombre}</p>
        
        {crop.treatments && JSON.parse(crop.treatments).length > 0 ? (
          <div className="mb-4">
            <h2 className="text-lg font-bold mb-2">Tratamientos Aplicados</h2>
            <ul className="list-disc list-inside">
            {JSON.parse(crop.treatments).map((treatment: Treatment) => (
              <li key={treatment.idtreatment} className="mb-1">
                <strong>{treatment.nombre}</strong> - {formatDate(treatment.fecha)}
              </li>
            ))}

            </ul>
          </div>
        ) : (
          <p className="mb-4">No hay tratamientos aplicados</p>
        )}
        
        {crop.availability_info && JSON.parse(crop.availability_info).length > 0 ? (
          <div className="mb-4">
            <h2 className="text-lg font-bold mb-2">Disponibilidad</h2>
            <ul className="list-disc list-inside">
            {JSON.parse(crop.availability_info).map((availability: { name: string; address: string; idavailability: string }, index: number) => (
              <li key={index} className="mb-1">
                <strong>{availability.name}</strong> - {availability.address}
                <button
                  onClick={() => handleDeleteAvailability(availability.idavailability)} // This line
                  className="ml-2 text-red-500"
                >
                  <FaTrash />
                </button>
              </li>
            ))}

            </ul>
          </div>
        ) : (
          <p className="mb-4">No hay disponibilidad registrada</p>
        )}


        <div className="flex flex-col items-center">
          {crop.imagen ? (
            <img 
              src={crop.imagen} 
              alt={crop.cultivo} 
              className="w-48 h-48 object-cover rounded mb-4"
            />
          ) : (
            <p>No image available</p>
          )}
          
          {crop.qr_code_url && crop.qr_code_url.startsWith("data:image/png;base64,") ? (
            <img 
              src={crop.qr_code_url} 
              alt="QR Code" 
              className="w-32 h-32 mt-2"
            />
          ) : (
            <p>No QR code available</p>
          )}

          <button 
            onClick={() => setShowAvailabilityModal(true)}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Agregar Disponibilidad
          </button>

          {showAvailabilityModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Agregar Disponibilidad</h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Nombre:</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded" 
                    value={availabilityData.name}
                    onChange={(e) => setAvailabilityData({...availabilityData, name: e.target.value})}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Dirección:</label>
                  <input
                    type="text"
                    placeholder="Ingrese una dirección o ubicación"
                    className="w-full p-2 border rounded"
                    value={availabilityData.address}
                    onChange={(e) => setAvailabilityData({...availabilityData, address: e.target.value})}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button 
                    onClick={() => setShowAvailabilityModal(false)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleAddAvailability}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    disabled={!availabilityData.name || !availabilityData.address}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}