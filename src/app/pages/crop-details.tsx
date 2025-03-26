import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CropDetails() {
  const { cropId, id } = useParams();
  const navigate = useNavigate();
  const [crop, setCrop] = useState<any>(null);
  const [error, setError] = useState<string>('');

  
  // Fetch crop details by ID
  useEffect(() => {
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

    if (cropId) {
      fetchCropDetails();
    }
  }, [cropId]);

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

  console.log("QR Code URL:", crop.qr_code_url);  // Debugging the qr_code_url

  // Handle navigation back to catalogue
  const handleBackClick = () => {
    navigate(`/${id}/catalogue`);
  };

  return (
    <div>
      <button 
        onClick={handleBackClick} 
        className="mb-4 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
        Atrás
      </button>
      <h1>{crop.cultivo}</h1>
      <p>{crop.descripcion}</p>
      <p><strong>Número de Lote:</strong> {crop.numero_lote}</p>
      <p><strong>Fecha de Cosecha:</strong> {formatDate(crop.fecha_cosecha)}</p>
      <p><strong>Ubicación:</strong> {crop.campo_nombre}</p>
      
      {crop.imagen ? (
        <img src={crop.imagen} alt={crop.cultivo} />
      ) : (
        <p>No image available</p>
      )}

      {crop.qr_code_url && crop.qr_code_url.startsWith("data:image/png;base64,") ? (
        <img src={crop.qr_code_url} alt="QR Code" />
      ) : (
        <p>No QR code available</p>
      )}
    </div>
  );
}
