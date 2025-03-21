import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaRegCalendarAlt, FaRegListAlt, FaSearch, FaChartBar, FaFileAlt, FaSignOutAlt } from 'react-icons/fa';

export default function OverviewField() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [fieldName, setFieldName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [weatherData, setWeatherData] = useState<any>(null);
    const [lat, setLat] = useState<number | null>(null);
    const [lon, setLon] = useState<number | null>(null);
  
    useEffect(() => {
      // If the id is present, fetch data from the API
      if (id) {
        fetchFieldData(id);
      }
    }, [id]);
    
    // Handler function to log out
    const handleLogout = () => {
        // Clear the user data from localStorage
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        
        navigate('/');
    };

    const fetchFieldData = async (userId: string) => {
      try {
        // Replace this URL with your actual API endpoint
        const response = await axios.post(
            'https://cbv6225k4g.execute-api.us-east-1.amazonaws.com/get-field-data/get-field-data', 
            { idcuentas: userId },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
        );
  
        const data = JSON.parse(response.data.body);
  
        if (response.status === 200 && data.length > 0) {
            const field = data[0];
            setFieldName(field.nombre || 'No field name available');
            setUserName(field.nombre_usuario || 'No user name available');
            setLat(field.latitud); 
            setLon(field.longitud);
            setLoading(false);
            fetchWeatherData(field.latitud, field.longitud);
          } else {
            setError('No tienes campos aún');
            setLoading(false);
          }
      } catch (error) {
        setError('Failed to fetch field data');
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

    const handleCultivosClick = () => {
        navigate(`/${id}/crops`);
    };

    const handleCatalogoClick = () => {
        navigate(`/${id}/catalogue`);
    };

    const handleReportesClick = () => {
        navigate(`/${id}/reports`);
    };

    const handleCalendarioClick = () => {
        navigate(`/${id}/calendar`);
    };

    const handleSeguimientoClick = () => {
        navigate(`/${id}/tracking`);
    };
    
    const handleAddFieldClick = () => {
        navigate(`/${id}/addFields`);
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
            </div>
        </div>
    );
  }