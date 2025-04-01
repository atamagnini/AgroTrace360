//catalogue.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaRegCalendarAlt, FaRegListAlt, FaSearch, FaChartBar, FaFileAlt, FaSignOutAlt,FaHome, FaMapMarkerAlt, FaSeedling } from 'react-icons/fa';
import axios from 'axios';

export default function Catalogue() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [fieldName, setFieldName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [crops, setCrops] = useState<any[]>([]);
    const [locationData, setLocationData] = useState<any>({});
    const [selectedField, setSelectedField] = useState<string | null>(null);

    const googleApiKey = 'AIzaSyCNEVHEAz5iJEAUpOdvONq9IVMTR8gHg0E'; 

    const handleLogout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        
        navigate('/');
    };

    /* useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const fieldId = queryParams.get('idcampo');
    
        if (fieldId) {
            // Replace placeholder with actual field data fetch
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
                    }
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching field details:', error);
                    setError('Failed to fetch field details');
                    setLoading(false);
                }
            };
    
            fetchFieldDetails();
        }
    }, [id, location.search]); */

    useEffect(() => {
        const fetchCrops = async () => {
            try {
                const response = await axios.post(
                    'https://xgjkl4hmhb.execute-api.us-east-1.amazonaws.com/get-all-crops-data/get-all-crops-data',
                    { idcuentas: id },
                    { headers: { 'Content-Type': 'application/json' } }
                );
                
                if (response.status === 200) {
                    const cropsData = JSON.parse(response.data.body);
                    setCrops(cropsData);
                    setLoading(false);
                }
            } catch (err) {
                setError('Error fetching crops data');
                setLoading(false);
            }
        };

        if (id) {
            fetchCrops();
        }
    }, [id]);

    interface GeocodingResult {
        formatted_address: string;
        types: string[];
    }
    
    // Function to fetch the location using latitude and longitude from Google Geocoding API
    const getLocationFromCoordinates = async (lat: number, lon: number) => {
        if (!lat || !lon) {
            return 'Location not available'; // Return early if coordinates are invalid
        }
        try {
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${googleApiKey}`
            );
            if (response.data.status === 'OK') {
                const address = (response.data.results as GeocodingResult[]).find(result =>
                    result.types.includes('locality')
                )?.formatted_address || response.data.results[0]?.formatted_address;
                return address;
            }
        } catch (error) {
            console.error('Error fetching location data', error);
            return 'Location not found';
        }
    };        

    // Fetch the location data for each crop
    useEffect(() => {
        const fetchLocationData = async () => {
            const updatedCrops = await Promise.all(crops.map(async (crop) => {
                if (!crop.location && crop.latitud && crop.longitud) {
                    const location = await getLocationFromCoordinates(crop.latitud, crop.longitud);
                    return { ...crop, location };
                }
                return crop;
            }));
            setCrops(updatedCrops);
        };
    
        if (crops.length > 0 && crops.some(crop => !crop.location)) { 
            fetchLocationData();
        }
    }, [crops]);

    useEffect(() => {
        const lastField = localStorage.getItem('lastSelectedField');
        if (lastField) {
          setSelectedField(lastField);
        }
    }, []);

    const handleDashboardClick = () => {
        const lastField = localStorage.getItem('lastSelectedField') || '';
        navigate(`/${id}/dashboard?idcampo=${lastField}`);
      };
      
      const handleOverviewClick = () => {
        const lastField = localStorage.getItem('lastSelectedField') || '';
        navigate(`/${id}/overviewField?idcampo=${lastField}`);
      };
      
      const handleCultivosClick = () => {
        const lastField = localStorage.getItem('lastSelectedField') || '';
        navigate(`/${id}/crops?idcampo=${lastField}`);
      };
      
      const handleCatalogoClick = () => {
        // Always ensure lastSelectedField is preserved, even if no current field is selected
        const lastField = localStorage.getItem('lastSelectedField') || '';
        localStorage.setItem('lastSelectedField', lastField);
        navigate(`/${id}/catalogue`);
      };
      
      const handleReportesClick = () => {
        // Always ensure lastSelectedField is preserved, even if no current field is selected
        const lastField = localStorage.getItem('lastSelectedField') || '';
        localStorage.setItem('lastSelectedField', lastField);
        navigate(`/${id}/reports`);
      };
      
      const handleCalendarioClick = () => {
        const lastField = localStorage.getItem('lastSelectedField') || '';
        navigate(`/${id}/calendar?idcampo=${lastField}`);
      };
      
      const handleSeguimientoClick = () => {
        const lastField = localStorage.getItem('lastSelectedField') || '';
        navigate(`/${id}/tracking?idcampo=${lastField}`);
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
                <h1 className="text-4xl font-bold mb-4">Catálogo</h1>
                <h2 className="text-2xl font-bold mb-4">{userName}</h2>

                
                {/* Grid of Crops */}
                <div className="grid grid-cols-3 gap-4">
                {crops.length > 0 ? (
                    crops.map((crop) => (
                        <div key={crop.idcrops} className="border p-4 rounded-lg">
                        <img src={crop.imagen || null} alt={crop.cultivo} className="w-full h-48 object-contain rounded-lg" />
                        <h3 className="text-xl font-semibold">{crop.cultivo}</h3>
                        <p>{crop.descripcion}</p>
                        <p><strong>Número de Lote:</strong> {crop.numero_lote}</p>
                        <p><strong>Ubicación:</strong> {crop.location}</p>
                        
                        {/* Display QR Code image */}
                        {crop.qr_code_url ? (
                            <img src={crop.qr_code_url} alt="QR Code" className="mt-2" />
                        ) : (
                            <p>No QR code available</p>
                        )}
                        
                        {/* Added button to navigate to crop details */}
                        <button
                            onClick={() => navigate(`/${id}/crop-details/${crop.idcrops}`)}
                            className="mt-2 text-blue-600 hover:underline">
                            Ver Detalles
                        </button>
                        </div>
                    ))
                ) : (
                    <h1>No tienes cosechas</h1>
                )}
                </div>
            </div>
        </div>
    );
}
