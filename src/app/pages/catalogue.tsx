import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaRegCalendarAlt, FaRegListAlt, FaSearch, FaChartBar, FaFileAlt } from 'react-icons/fa';
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

    const googleApiKey = 'AIzaSyCNEVHEAz5iJEAUpOdvONq9IVMTR8gHg0E'; 

    // Fetch crops data from the Lambda function
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
        try {
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${googleApiKey}`
            );
            if (response.data.status === 'OK') {
                // Explicitly type the result as GeocodingResult
                const address = (response.data.results as GeocodingResult[]).find(result =>
                    result.types.includes('locality')
                )?.formatted_address || response.data.results[0]?.formatted_address; // Default to the first result
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
                const location = await getLocationFromCoordinates(crop.latitud, crop.longitud);
                return { ...crop, location };
            }));
            setCrops(updatedCrops);
        };

        if (crops.length > 0) {
            fetchLocationData();
        }
    }, [crops]);

    // Navigation handlers
    const handleCultivosClick = () => {
        navigate(`/${id}/crops`);
    };

    const handleCalendarioClick = () => {
        navigate(`/${id}/calendar`);
    };

    const handleReportesClick = () => {
        navigate(`/${id}/reports`);
    };

    const handleSeguimientoClick = () => {
        navigate(`/${id}/tracking`);
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
                        className="flex items-center space-x-3 bg-gray-700 p-3 rounded hover:bg-blue-600">
                        <FaRegListAlt className="text-white" />
                        <span>Catálogo</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-3/4 p-6">
                <h1 className="text-4xl font-bold mb-4">{fieldName}</h1>
                <h2 className="text-2xl font-bold mb-4">{userName}</h2>

                {/* Grid of Crops */}
                <div className="grid grid-cols-3 gap-4">
                    {crops.map((crop) => (
                        <div key={crop.idcrops} className="border p-4 rounded-lg">
                            <img src={crop.imagen || null} alt={crop.cultivo} className="w-full h-48 object-cover rounded-lg" />
                            <h3 className="text-xl font-semibold">{crop.cultivo}</h3>
                            <p>{crop.descripcion}</p>
                            <p><strong>Número de Lote:</strong> {crop.numero_lote}</p>
                            <p><strong>Ubicación:</strong> {crop.location}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
