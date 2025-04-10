/* eslint-disable */

'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaRegCalendarAlt, FaRegListAlt, FaSearch, FaChartBar, FaFileAlt, FaSignOutAlt,FaUser, FaMapMarkerAlt, FaSeedling,FaTrashAlt } from 'react-icons/fa';
import axios from 'axios';

export default function Catalogue() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [userName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [crops, setCrops] = useState<any[]>([]);
    const [selectedField, setSelectedField] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [fieldFilter, setFieldFilter] = useState<string>('all');
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm("¿Estás seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.");
        
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
                navigate('/');
            } else {
                alert('Error al eliminar la cuenta. Por favor intenta de nuevo.');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('Error al eliminar la cuenta. Por favor intenta de nuevo.');
        }
    };    

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
                
                // Remove Plus Code pattern (like F2XX+4G) from the address
                const addressWithoutPlusCode = address.replace(/[A-Z0-9]{4}\+[A-Z0-9]{2,3}\s/, '');
                return addressWithoutPlusCode;
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

    useEffect(() => {
        if (typeof document !== 'undefined') {
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
        }
    }, [showUserMenu]);    
    
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
    
    const uniqueFields = [
        { id: 'all', name: 'All Fields' },
        ...Array.from(new Set(crops.map(crop => crop.campo_nombre)))
        .filter(Boolean)
        .map(name => ({ 
            id: name as string, 
            name: name as string 
        }))
    ];

    const filteredCrops = crops.filter(crop => {
        const matchesSearch = crop.cultivo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesField = fieldFilter === 'all' || crop.campo_nombre === fieldFilter;
        return matchesSearch && matchesField;
    });

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
                <h1 className="text-4xl font-bold mb-4">Catálogo</h1>
                <h2 className="text-2xl font-bold mb-4">{userName}</h2>

                <div className="mb-6 flex space-x-4">
                <div className="w-1/2">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                    Search by Crop Name:
                    </label>
                    <div className="flex items-center border rounded-md overflow-hidden">
                    <FaSearch className="mx-2 text-gray-500" />
                    <input
                        type="text"
                        id="search"
                        placeholder="Search crops..."
                        className="w-full py-2 px-3 focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    </div>
                </div>
                
                <div className="w-1/2">
                    <label htmlFor="fieldFilter" className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Field:
                    </label>
                    <select
                    id="fieldFilter"
                    className="w-full py-2 px-3 border rounded-md"
                    value={fieldFilter}
                    onChange={(e) => setFieldFilter(e.target.value)}
                    >
                    {uniqueFields.map(field => (
                        <option key={field.id} value={field.id}>
                        {field.name}
                        </option>
                    ))}
                    </select>
                </div>
                </div>
                
                {/* Grid of Crops */}
                <div className="grid grid-cols-3 gap-4">
                {filteredCrops.length > 0 ? (
                    filteredCrops.map((crop) => (
                        <div key={crop.idcrops} className="border p-4 rounded-lg">
                        <img src={crop.imagen || null} alt={crop.cultivo} className="w-full h-48 object-contain rounded-lg" />
                        <h3 className="text-xl font-semibold">{crop.cultivo}</h3>
                        <p>{crop.descripcion}</p>
                        <p><strong>Número de Lote:</strong> {crop.numero_lote}</p>
                        <p><strong>Campo:</strong> {crop.campo_nombre}</p>
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
                    <h1>No crops match your search criteria</h1>
                )}
                </div>
            </div>
        </div>
    );
}
