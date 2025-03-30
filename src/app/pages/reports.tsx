//reports.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaRegCalendarAlt, FaRegListAlt, FaSearch, FaChartBar, FaFileAlt, FaSignOutAlt, FaHome, FaMapMarkerAlt, FaSeedling } from 'react-icons/fa';
import axios from 'axios';

export default function Reports() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [fieldName, setFieldName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [selectedField, setSelectedField] = useState<string | null>(null);
    
    const handleLogout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('userId');    
        navigate('/');
    };


    useEffect(() => {
        const lastField = localStorage.getItem('lastSelectedField');
        if (lastField) {
          setSelectedField(lastField);
        }
        setLoading(false);
    }, [id]);

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
        const lastField = localStorage.getItem('lastSelectedField') || '';
        localStorage.setItem('lastSelectedField', lastField);
        navigate(`/${id}/catalogue`);
      };
      
      const handleReportesClick = () => {
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
        <div className="flex w-full">
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
    
            {/* Main Content Area */}
            <div className="w-3/4 relative">
                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="absolute top-4 right-4 p-3 text-white bg-blue-500 rounded-full text-xl hover:bg-blue-600 transition duration-200 flex items-center justify-center z-10"
                >
                    <FaSignOutAlt className="text-white" size={24} />
                </button>
        
                    {/* Reports Title */}
                    <h1 className="text-4xl font-bold mb-4">Reports</h1>
    
            </div>
        </div>
    );
    
    
}