//overviewField.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaRegCalendarAlt, FaRegListAlt, FaSearch, FaChartBar, FaFileAlt, FaSignOutAlt, FaHome, FaMapMarkerAlt } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function OverviewField() {
    const { id } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const fieldId = queryParams.get('idcampo');
    const navigate = useNavigate();
    const [fieldName, setFieldName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [weatherData, setWeatherData] = useState<any>(null);
    const [lat, setLat] = useState<number | null>(null);
    const [lon, setLon] = useState<number | null>(null);
    const [fields, setFields] = useState<any[]>([]);
    const [selectedField, setSelectedField] = useState<string | null>(null);
    const [currentFieldId, setCurrentFieldId] = useState<string | null>(null);
    
    const mapContainerStyle = {
        width: '100%',
        height: '400px',
        borderRadius: '8px'
    };

    useEffect(() => {
        const fetchInitialFieldData = async (specificFieldId?: string | null) => {
            try {
                const response = await axios.post(
                    'https://0ddnllnpb5.execute-api.us-east-1.amazonaws.com/get-first-field/get-first-field',
                    {
                        idcuentas: id,
                        idcampo: specificFieldId || (fields.length > 0 ? fields[0].idcampo : null)
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
             
                const data = JSON.parse(response.data.body);
                if (response.status === 200 && data.length > 0) {
                    const field = specificFieldId 
                        ? data.find((f: any) => f.idcampo === specificFieldId) || data[0]
                        : data[0];
    
                    setFieldName(field.nombre || 'No field name available');
                    setUserName(field.nombre_usuario || 'No user name available');
                    setLat(field.latitud);
                    setLon(field.longitud);
                    setSelectedField(field.idcampo);
       
                    // Fetch weather data
                    await fetchWeatherData(field.latitud, field.longitud);
                } else {
                    setError('No tienes campos aún');
                }
            } catch (error) {
                console.error('Error fetching initial field data:', error);
                setError('Failed to fetch initial field data');
            } finally {
                setLoading(false);
            }
        };
       
        // First, fetch all fields
        const fetchFields = async () => {
            try {
                const fieldsResponse = await axios.post(
                    'https://cbv6225k4g.execute-api.us-east-1.amazonaws.com/get-field-data/get-field-data',
                    {
                        idcuentas: id
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
       
                const fieldsData = JSON.parse(fieldsResponse.data.body);
               
                if (fieldsData.length > 0) {
                    setFields(fieldsData);
    
                    // Check for field ID in query params or localStorage
                    const specificFieldId = 
                        queryParams.get('idcampo') || 
                        localStorage.getItem('currentFieldId');
    
                    await fetchInitialFieldData(specificFieldId);
    
                    // Clear the localStorage field ID after using it
                    localStorage.removeItem('currentFieldId');
                } else {
                    setError('No tienes campos aún');
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error fetching fields:', error);
                setError('Failed to fetch fields');
                setLoading(false);
            }
        };
       
        // Only run if we have a user ID
        if (id) {
            fetchFields();
        }
    }, [id, location.search]);  
    
    
    // Handler function to log out
    const handleLogout = () => {
        // Clear the user data from localStorage
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        
        navigate('/');
    };

    const fetchFieldData = async (fieldId: string) => {
        try {
          setLoading(true);  // Start loading data
          const response = await axios.post(
            'https://0ddnllnpb5.execute-api.us-east-1.amazonaws.com/get-first-field/get-first-field',
            { idcuentas: id, idcampo: fieldId },
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          const data = JSON.parse(response.data.body);
          if (response.status === 200 && data.length > 0) {
            const field = data[0];  // Fetch field by ID
            setFieldName(field.nombre || 'No field name available');
            setUserName(field.nombre_usuario || 'No user name available');
            setLat(field.latitud);
            setLon(field.longitud);
            setSelectedField(field.idcampo);  // Set the selected field's ID
      
            // Fetch weather data
            await fetchWeatherData(field.latitud, field.longitud);
          } else {
            setError('No tienes campos aún');
          }
        } catch (error) {
          setError('Failed to fetch field data');
        } finally {
          setLoading(false);  // Finish loading
        }
      };
      
    
    

    const fetchWeatherData = async (latitude: number, longitude: number) => {
        const apiKey = '5a24d7f9898bef180f12f26b3e8cd165';
        try {
            const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
                params: {
                    lat: latitude,
                    lon: longitude,
                    appid: apiKey,
                    units: 'metric',
                },
            });
            setWeatherData(weatherResponse.data);
        } catch (error) {
            setError('Failed to fetch weather data');
        }
    };

    const handleFieldChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedFieldId = event.target.value;
        setSelectedField(selectedFieldId);
        window.history.pushState(null, '', `/${id}/overviewField?idcampo=${selectedFieldId}`);
        await fetchFieldData(selectedFieldId);
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
        navigate(`/${id}/catalogue?idcampo=${selectedField}`);
    };

    const handleReportesClick = () => {
        navigate(`/${id}/reports?idcampo=${selectedField}`);
    };

    const handleCalendarioClick = () => {
        navigate(`/${id}/calendar?idcampo=${selectedField}`);
    };

    const handleSeguimientoClick = () => {
        navigate(`/${id}/tracking?idcampo=${selectedField}`);
    };
    
    const handleAddFieldClick = () => {
        navigate(`/${id}/addFields?idcampo=${selectedField}`);
    };

    if (loading) {
      return <p>Loading...</p>;
    }
  
    if (error) {
      return (
        <div className="flex justify-center items-center flex-col">
          <p>{error}</p>
          <button 
            onClick={handleAddFieldClick}
            className="mt-4 px-6 py-3 text-white bg-green-500 rounded-full text-xl hover:bg-green-600 transition duration-200">
            Agregar campo
          </button>
        </div>
      );
    }

  
    return (
        <div className="flex">
            {/* Sidebar with buttons */}
            <div className="w-1/4 bg-gray-800 text-white p-6">
                <div className="flex flex-col space-y-4">
                    <button 
                        onClick={handleDashboardClick}
                        className="flex items-center space-x-3 bg-gray-700 p-3 rounded hover:bg-blue-600">
                        <FaHome className="text-white" />
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
                        <FaChartBar className="text-white" />
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

            {/* Field Selection Dropdown and Add Field Button */}
            <div className="absolute top-4 right-24 flex items-center space-x-2">
            <select 
                onChange={handleFieldChange}
                value={selectedField || ''}
                className="p-2 rounded bg-white text-gray-800 border border-gray-300"
            >
                {fields.map((field, index) => (
                    <option key={field.idcampo || index} value={field.idcampo}>{field.nombre}</option>
                ))}
            </select>

            <button
                onClick={handleAddFieldClick}
                className="p-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
                title="Add New Field"
            >
                <FaMapMarkerAlt />
            </button>
            </div>

            {/* Logout Button - Move this slightly to adjust positioning */}
            <button
            onClick={handleLogout}
            className="absolute top-4 right-4 p-3 text-white bg-blue-500 rounded-full text-xl hover:bg-blue-600 transition duration-200 flex items-center justify-center"
            >
            <FaSignOutAlt className="text-white" size={24} />
            </button>

            {/* Main Content */}
            <div className="w-3/4 p-6">
                <h1 className="text-4xl font-bold mb-4">{fieldName}</h1>

                {weatherData && (
                    <div className="bg-blue-100 p-6 rounded-lg shadow-lg">
                        <p className="text-lg font-medium">Good day, {userName}</p>
                        <h2 className="text-3xl font-bold mb-2">{weatherData.name}</h2>
                        <div className="flex items-center mb-4">
                            <p className="text-6xl font-bold mr-4">{weatherData.main.temp}°C</p>
                            <p className="text-lg">{weatherData.weather[0].description}</p>
                        </div>
                        <div className="flex space-x-6">
                            <div className="flex items-center">
                                <span className="font-semibold">Wind:</span>
                                <p className="ml-2">{weatherData.wind.speed} km/h</p>
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold">Humidity:</span>
                                <p className="ml-2">{weatherData.main.humidity}%</p>
                            </div>
                        </div>
                    </div>
                )}
                {lat && lon && (
                    <div className="mt-6">
                        <h2 className="text-2xl font-bold mb-4">Field Location</h2>
                        <div className="bg-gray-200 p-4 rounded-lg">
                            <div className="w-full h-80">
                                <iframe
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.01}%2C${lat-0.01}%2C${lon+0.01}%2C${lat+0.01}&layer=mapnik&marker=${lat}%2C${lon}`}
                                    width="100%" height="100%" style={{ border: 'none' }}
                                    allowFullScreen={true}
                                    loading="lazy"
                                />
                            </div>
                            <a
                                href={`https://www.openstreetmap.org/#map=15/${lat}/${lon}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                            >
                                View on OpenStreetMap
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
  }