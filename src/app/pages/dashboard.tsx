//dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaRegCalendarAlt, FaRegListAlt, FaSearch, FaChartBar, FaFileAlt, FaSignOutAlt, FaHome, FaMapMarkerAlt, FaSeedling } from 'react-icons/fa';
import axios from 'axios';

export default function Dashboard() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [fieldName, setFieldName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');    
    interface Crop {
        idcrops: number;
        cultivo: string;
        numero_lote: string;
        estado: string;
        fecha_cosecha: string;
        fecha_siembra: string;
        fecha_estado: string;
    }
    const [currentCrops, setCurrentCrops] = useState<any[]>([]);
    const [selectedField, setSelectedField] = useState<string | null>(null);

    const fetchCurrentCrops = async (userId: string, fieldId: string) => {
        try {
          const response = await axios.post(
            'https://zosi7bcnv4.execute-api.us-east-1.amazonaws.com/get-crop-data/get-crop-data',
            { idcuentas: userId, idcampo: fieldId },
            { headers: { 'Content-Type': 'application/json' } }
          );
          const data = JSON.parse(response.data.body);
          if (response.status === 200 && data.length > 0) {
            const filteredCrops = data.filter((crop: Crop) => crop.estado !== 'Cosecha');
            setCurrentCrops(filteredCrops);
          } else {  
            setCurrentCrops([]);
          }
          setLoading(false); // Make sure to set loading to false here
        } catch (error) {
          console.error('Failed to fetch crops:', error);
          setLoading(false); // And also here in case of an error
        }
      };
      
    // Handler function to log out
    const handleLogout = () => {
        // Clear the user data from localStorage
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        
        navigate('/');
    };

    useEffect(() => {
      const queryParams = new URLSearchParams(location.search);
      const fieldId = queryParams.get('idcampo');
    
      if (fieldId) {
          const fetchFieldDetails = async () => {
              try {
                  const response = await axios.post(
                      'https://0ddnllnpb5.execute-api.us-east-1.amazonaws.com/get-first-field/get-first-field',
                      { idcuentas: id, idcampo: fieldId },
                      { headers: { 'Content-Type': 'application/json' } }
                  );
                  
                  const data = JSON.parse(response.data.body);
                  if (data.length > 0) {
                      const field = data[0];
                      setFieldName(field.nombre || 'No field name available');
                      setUserName(field.nombre_usuario || 'No user name available');
                      setSelectedField(fieldId);
                      
                      // Add this line to trigger crop data fetch
                      fetchCurrentCrops(id!, fieldId);
                  }
                  setLoading(false);
              } catch (error) {
                  console.error('Error fetching field details:', error);
                  setError('Failed to fetch field details');
                  setLoading(false);
              }
          };
    
          fetchFieldDetails();
      } else {
          // If no fieldId in URL, use the original method to fetch field data
          fetchFieldData(id!);
      }
    }, [id, location.search]);
      
      const fetchFieldData = async (userId: string) => {
        try {
          const response = await axios.post(
            'https://cbv6225k4g.execute-api.us-east-1.amazonaws.com/get-field-data/get-field-data',
            { idcuentas: userId },
            { headers: { 'Content-Type': 'application/json' } }
          );
          const data = JSON.parse(response.data.body);
          if (response.status === 200 && data.length > 0) {
            const field = data[0];
            setFieldName(field.nombre || 'No field name available');
            setUserName(field.nombre_usuario || 'No user name available');
            setSelectedField(field.idcampo);
            fetchCurrentCrops(userId, field.idcampo);
            setLoading(false); // Add this line to set loading to false on success
          } else {
            setError('No tienes campos aún');
            setLoading(false);
          }
        } catch (error) {
          setError('Failed to fetch field data');
          setLoading(false);
        }
      };    

      const formatDateLatinAmerican = (dateString: string | null | undefined): string => {
        if (!dateString) return 'No especificada';
        
        try {
          const date = new Date(dateString);
          // Check if date is valid
          if (isNaN(date.getTime())) return dateString;
          
          // Format as DD/MM/YYYY
          return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        } catch (error) {
          console.error('Error formatting date:', error);
          return dateString;
        }
      };

    const handleDashboardClick = () => {
        navigate(`/${id}/dashboard?idcampo=${selectedField}`);
    };
    
    const handleOverviewClick = () => {
        navigate(`/${id}/overviewField?idcampo=${selectedField}`);
    };

    const handleCultivosClick = () => {
        navigate(`/${id}/crops?idcampo=${selectedField}`);
    };

    const handleCatalogoClick = () => {
      localStorage.setItem('lastSelectedField', selectedField || '');
      navigate(`/${id}/catalogue`);
    };

    const handleReportesClick = () => {
      localStorage.setItem('lastSelectedField', selectedField || '');
      navigate(`/${id}/reports`);
    };

    const handleCalendarioClick = () => {
        navigate(`/${id}/calendar?idcampo=${selectedField}`);
    };

    const handleSeguimientoClick = () => {
        navigate(`/${id}/tracking?idcampo=${selectedField}`);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="flex">
            {/* Sidebar with buttons */}
            <div className="w-1/4 bg-gray-800 text-white p-6">
                <div className="flex flex-col space-y-4">
                                    <button 
                                        onClick={handleDashboardClick}
                                        className="flex items-center space-x-3 bg-gray-700 p-3 rounded hover:bg-blue-600">
                                        <FaChartBar className="text-white" />
                                        <span>Panel de Actividades</span>
                                    </button>
                                    <button 
                                        onClick={handleOverviewClick}
                                        className="flex items-center space-x-3 bg-gray-700 p-3 rounded hover:bg-blue-600">
                                        <FaMapMarkerAlt className="text-white" />
                                        <span>Ubicación</span>
                                    </button>
                                    <button 
                                        onClick={handleCultivosClick}
                                        className="flex items-center space-x-3 bg-gray-700 p-3 rounded hover:bg-blue-600">
                                        <FaSeedling className="text-white" />
                                        <span>Cultivos</span>
                                    </button>
                                    <button 
                                        onClick={handleSeguimientoClick}
                                        className="flex items-center space-x-3 bg-gray-700 p-3 rounded hover:bg-blue-600">
                                        <FaSearch className="text-white" />
                                        <span>Seguimiento</span>
                                    </button>
                                    <button 
                                        onClick={handleCalendarioClick}
                                        className="flex items-center space-x-3 bg-gray-700 p-3 rounded hover:bg-blue-600">
                                        <FaRegCalendarAlt className="text-white" />
                                        <span>Calendario</span>
                                    </button>
                                    <button 
                                        onClick={handleReportesClick} 
                                        className="flex items-center space-x-3 bg-gray-700 p-3 rounded hover:bg-blue-600">
                                        <FaFileAlt className="text-white" />
                                        <span>Reportes</span>
                                    </button>
                                    <button
                                        onClick={handleCatalogoClick} 
                                        className="flex items-center space-x-3 bg-gray-700 p-3 rounded hover:bg-blue-600">
                                        <FaRegListAlt className="text-white" />
                                        <span>Catálogo</span>
                                    </button>
                                </div>
            </div>

            {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="absolute top-4 right-4 p-3 text-white bg-blue-500 rounded-full text-xl hover:bg-blue-600 transition duration-200 flex items-center justify-center"
                  >
                    <FaSignOutAlt className="text-white" size={24} />
                  </button>

            {/* Main Content */}
            <div className="w-3/4 p-6">
                <h1 className="text-4xl font-bold mb-4">{fieldName}</h1>
                <h2 className="text-2xl font-bold mb-4">{userName}</h2>
                
                {/* Content Grid */}
                <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
                    {/* Bottom: Performance Graphs (spans 2 columns) */}
                    <div className="bg-white rounded-lg shadow-md p-4 col-span-2">
                        <h3 className="text-xl font-semibold mb-3">Gráficos de rendimiento</h3>
                        {/* Performance graphs content goes here */}
                        <div className="bg-gray-100 p-3 rounded-lg">
                            {/* Placeholder content */}
                            <p>Contenido de gráficos de rendimiento</p>
                        </div>
                    </div>

                    {/* Top Left: Current Crops */}
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <h3 className="text-xl font-semibold mb-3">Cultivos Actuales</h3>
                        {currentCrops.length > 0 ? (
                            currentCrops.map((crop, index) => (
                            <div key={index} className="bg-gray-100 p-3 rounded-lg mb-4">
                                <p><strong>Cultivo de:</strong> {crop.cultivo}</p>
                                <p><strong>Número de Lote:</strong> {crop.numero_lote}</p>
                                <p><strong>Fecha de Siembra:</strong> {formatDateLatinAmerican(crop.fecha_siembra)}</p>
                                <p><strong>Último Estado:</strong> {crop.estado} (registrado el {formatDateLatinAmerican(crop.fecha_estado)})</p>
                            </div>
                            ))
                        ) : (
                            <p>No hay cultivos actuales para este campo.</p>
                        )}
                    </div>

                    
                    {/* Top Right: Upcoming Actions */}
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <h3 className="text-xl font-semibold mb-3">Acciones próximas</h3>
                        {/* Upcoming actions content goes here */}
                        <div className="bg-gray-100 p-3 rounded-lg">
                            {/* Placeholder content */}
                            <p>Contenido de acciones próximas</p>
                        </div>
                    </div>
                    
                    
                </div>
            </div>
        </div>
    );
}
