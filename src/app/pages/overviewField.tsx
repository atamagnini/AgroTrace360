/* eslint-disable */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaRegCalendarAlt, FaRegListAlt, FaSearch, FaChartBar, FaFileAlt, FaTrashAlt, FaSignOutAlt, FaTrash, FaMapMarkerAlt, FaSeedling, FaUser } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';

export default function OverviewField() {
    const { id } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
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
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm("¿Estás seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer. Perderás todos tus campos y datos.");
        
        if (!confirmDelete) return;
        
        const confirmFinal = window.prompt("Escribe 'ELIMINAR' para confirmar la eliminación de tu cuenta");
        if (confirmFinal !== "ELIMINAR") return;
        
        try {
          const response = await axios.post(
            'https://qhdzac2nc8.execute-api.us-east-1.amazonaws.com/delete-user/delete-user',
            { idcuentas: id },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          
          if (response.status === 200) {
            alert('Tu cuenta ha sido eliminada con éxito.');
            localStorage.removeItem('username');
            localStorage.removeItem('userId');
            localStorage.removeItem('currentFieldId');
            localStorage.removeItem('lastSelectedField');
            
            navigate('/');
          } else {
            alert('Error al eliminar la cuenta. Por favor intenta de nuevo.');
          }
        } catch (error) {
          console.error('Error deleting account:', error);
          alert('Error al eliminar la cuenta. Por favor intenta de nuevo.');
        }
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
    
                    const specificFieldId = 
                        queryParams.get('idcampo') || 
                        localStorage.getItem('currentFieldId');
    
                    await fetchInitialFieldData(specificFieldId);
    
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
       
        if (id) {
            fetchFields();
        }
    }, [id, location.search]);  
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          const target = event.target as HTMLElement;
          
          const dropdown = document.querySelector('.user-dropdown-container');
          
          if (dropdown && !dropdown.contains(target)) {
            setShowUserMenu(false);
          }
        };
      
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showUserMenu]);
    
    const handleLogout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        
        navigate('/');
    };

    const fetchFieldData = async (fieldId: string) => {
        try {
          setLoading(true); 
          const response = await axios.post(
            'https://0ddnllnpb5.execute-api.us-east-1.amazonaws.com/get-first-field/get-first-field',
            { idcuentas: id, idcampo: fieldId },
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          const data = JSON.parse(response.data.body);
          if (response.status === 200 && data.length > 0) {
            const field = data[0]; 
            setFieldName(field.nombre || 'No field name available');
            setUserName(field.nombre_usuario || 'No user name available');
            setLat(field.latitud);
            setLon(field.longitud);
            setSelectedField(field.idcampo); 
      
            await fetchWeatherData(field.latitud, field.longitud);
          } else {
            setError('No tienes campos aún');
          }
        } catch (error) {
          setError('Failed to fetch field data');
        } finally {
          setLoading(false);
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

    const handleDeleteField = async () => {
        if (!selectedField) return;
        
        if (window.confirm('¿Estás seguro que deseas eliminar este campo? Esta acción no se puede deshacer.')) {
          try {
            const response = await axios.post(
              'https://gu9rxaxf33.execute-api.us-east-1.amazonaws.com/delete-field/delete-field',
              {
                idcuentas: id,
                idcampo: selectedField
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );
            
            if (response.status === 200) {
              const updatedFields = fields.filter(field => field.idcampo !== selectedField);
              setFields(updatedFields);
              
              if (updatedFields.length > 0) {
                await fetchFieldData(updatedFields[0].idcampo);
                window.history.pushState(null, '', `/${id}/overviewField?idcampo=${updatedFields[0].idcampo}`);
              } else {
                setError('No tienes campos aún');
                setLoading(false);
              }
              
              alert('Campo eliminado con éxito');
            }
          } catch (error) {
            console.error('Error deleting field:', error);
            alert('Error al eliminar el campo');
          }
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

            {/* Field Selection Dropdown, Add Field Button, and Delete Field Button */}
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
                title="Agregar Campo"
            >
                <FaMapMarkerAlt />
            </button>
            
            <button
                onClick={handleDeleteField}
                className="p-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
                title="Eliminar Campo"
                disabled={fields.length <= 1}
            >
                <FaTrash />
            </button>
            </div>

            {/* User Menu Dropdown */}
            <div className="absolute top-4 right-4 user-dropdown-container">
            <div className="relative">
                <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-3 text-white bg-blue-500 rounded-full text-xl hover:bg-blue-600 transition duration-200 flex items-center justify-center"
                >
                <FaUser className="text-white" size={24} />
                </button>
                
                {/* Dropdown menu */}
                {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                    <FaSignOutAlt className="mr-2" /> Cerrar sesión
                    </button>
                    <button
                    onClick={handleDeleteAccount}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center"
                    >
                    <FaTrashAlt className="mr-2" /> Eliminar cuenta
                    </button>
                </div>
                )}
            </div>
            </div>

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