import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaRegCalendarAlt, FaRegListAlt, FaSearch, FaChartBar, FaFileAlt, FaSignOutAlt, FaHome, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';

export default function Reports() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [fieldName, setFieldName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [selectedField, setSelectedField] = useState<string | null>(null);

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
    }, [id, location.search]);

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
                {/* Your content here */}
            </div>
        </div>
    );
}
