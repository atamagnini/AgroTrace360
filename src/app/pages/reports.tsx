/* eslint-disable */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaRegCalendarAlt, FaRegListAlt, FaSearch, FaChartBar, FaFileAlt, FaSignOutAlt, FaUser, FaTrashAlt, FaMapMarkerAlt, FaSeedling, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import axios from 'axios';
import Papa from 'papaparse';

export default function Reports() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [fields, setFields] = useState<any[]>([]);
    const [filteredReports, setFilteredReports] = useState<any[]>([]);
    const [selectedFieldId, setSelectedFieldId] = useState<string>('all');
    const [startSiembraDate, setStartSiembraDate] = useState<string>('');
    const [endSiembraDate, setEndSiembraDate] = useState<string>('');
    const [startCosechaDate, setStartCosechaDate] = useState<string>('');
    const [endCosechaDate, setEndCosechaDate] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'cultivos' | 'tratamientos' | 'insumos'>('cultivos');
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.");
        
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

    const handleClearSiembraDates = () => {
        setStartSiembraDate('');
        setEndSiembraDate('');
        setFilteredReports(fields); 
    };
    
    const handleClearCosechaDates = () => {
        setStartCosechaDate('');
        setEndCosechaDate('');
        setFilteredReports(fields);
    };

    const generateCSV = () => {
        const table = document.getElementById('report-table');
        
        if (!table) {
            alert("No table found to download.");
            return;
        }
    
        const rows = table.querySelectorAll('tr');
        const csvData: string[] = [];
    
        rows.forEach((row) => {
            const cells = row.querySelectorAll('td, th');
            const rowData: string[] = [];
            cells.forEach((cell) => {
                const text = (cell as HTMLElement).innerText.trim();
                rowData.push(text);
            });
            csvData.push(rowData.join(','));
        });
    
        const blob = new Blob([csvData.join('\n')], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);

        let filename = 'reporte.csv';
        if (activeTab === 'cultivos') {
            filename = 'reporte_cultivos.csv';
        } else if (activeTab === 'tratamientos') {
            filename = 'reporte_tratamientos.csv';
        } else if (activeTab === 'insumos') {
            filename = 'reporte_insumos.csv';
        }

        link.download = filename;
        link.click();
    };    

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    
    const [sortConfig, setSortConfig] = useState({
        key: '', 
        direction: 'ascending' as 'ascending' | 'descending', 
    });

    const sortReports = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        
        const sortedReports = [...filteredReports].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
            return 0;
        });
    
        setFilteredReports(sortedReports);
        setSortConfig({ key, direction });
    };
    
    const handleSiembraDateChange = () => {
        const filtered = fields.filter((field) => {
            const fechaSiembra = new Date(field.fecha_siembra);
            const startDate = new Date(startSiembraDate);
            const endDate = new Date(endSiembraDate);
            return (
                (startSiembraDate === '' || fechaSiembra >= startDate) &&
                (endSiembraDate === '' || fechaSiembra <= endDate)
            );
        });
        setFilteredReports(filtered);
    };
    
    const handleCosechaDateChange = () => {
        const filtered = fields.filter((field) => {
            const fechaCosecha = new Date(field.fecha_estimada_cosecha);
            const startDate = new Date(startCosechaDate);
            const endDate = new Date(endCosechaDate);
            return (
                (startCosechaDate === '' || fechaCosecha >= startDate) &&
                (endCosechaDate === '' || fechaCosecha <= endDate)
            );
        });
        setFilteredReports(filtered);
    };

    
    const handleLogout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('userId');    
        navigate('/');
    };


    const fetchFields = async (userId: string) => {
        try {
            setLoading(true);
            const response = await axios.post(
                'https://fsby2c69j9.execute-api.us-east-1.amazonaws.com/get-crops-report/get-crops-report',
                { idcuentas: userId }
            );
    
            let responseData = [];
            try {
                responseData = JSON.parse(response.data.body); 
            } catch (e) {
                console.error("Error parsing JSON:", e);
                setError('Failed to parse response data');
                return;
            }
    
            if (Array.isArray(responseData)) {
                setFields(responseData);
                setFilteredReports(responseData);
            } else {
                console.error('API response is not an array:', responseData);
                setFields([]);
                setFilteredReports([]);
                setError('Invalid data format received from server');
            }
        } catch (error) {
            console.error('Error fetching fields:', error);
            setError('Failed to fetch field data');
        } finally {
            setLoading(false);
        }
    };
    
    const fetchTreatments = async (userId: string) => {
        try {
            setLoading(true);
            const response = await axios.post(
                'https://ydcstcyyqa.execute-api.us-east-1.amazonaws.com/get-treatments-report/get-treatments-report',
                { idcuentas: userId }
            );
        
            let responseData = [];
            try {
                responseData = JSON.parse(response.data.body); 
            } catch (e) {
                console.error("Error parsing JSON:", e);
                setError('Failed to parse response data');
                return;
            }
        
            if (Array.isArray(responseData)) {
                setFields(responseData);
                setFilteredReports(responseData);
            } else {
                console.error('API response is not an array:', responseData);
                setFields([]);
                setFilteredReports([]);
                setError('Invalid data format received from server');
            }
        } catch (error) {
            console.error('Error fetching treatments:', error);
            setError('Failed to fetch treatment data');
        } finally {
            setLoading(false);
        }
    };
    
    const fetchInputs = async (userId: string) => {
        try {
            setLoading(true);
            const response = await axios.post(
                'https://ydvk9jkm98.execute-api.us-east-1.amazonaws.com/get-inputs-report/get-inputs-report',
                { idcuentas: userId }
            );
        
            let responseData = [];
            try {
                responseData = JSON.parse(response.data.body); 
            } catch (e) {
                console.error("Error parsing JSON:", e);
                setError('Failed to parse response data');
                return;
            }
        
            if (Array.isArray(responseData)) {
                setFields(responseData);
                setFilteredReports(responseData);
            } else {
                console.error('API response is not an array:', responseData);
                setFields([]);
                setFilteredReports([]);
                setError('Invalid data format received from server');
            }
        } catch (error) {
            console.error('Error fetching inputs:', error);
            setError('Failed to fetch input data');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');
        
        if (userId) {
          setUserName(username || '');
          fetchFields(userId);
        
          setSelectedFieldId('all');
          setFilteredReports(fields);
          
        } else {
          navigate('/');
        }
        
        setLoading(false);
    }, [id, navigate]);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (userId) {
            if (activeTab === 'cultivos') {
                fetchFields(userId);
            } else if (activeTab === 'tratamientos') {
                fetchTreatments(userId);
            } else if (activeTab === 'insumos') {
                fetchInputs(userId);
            }
        }
    }, [activeTab]);

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

    
    const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const fieldId = e.target.value;
        setSelectedFieldId(fieldId);
        
        if (fieldId === 'all') {
            setFilteredReports(fields);  
        } else {
            const filtered = fields.filter(field => field.campo_nombre === fieldId);  
            setFilteredReports(filtered);
        }
    };

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
        localStorage.removeItem('lastSelectedField');
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

        
            {/* Reports Content */}
            <div className="p-6">
            <h1 className="text-4xl font-bold mb-6">Reportes</h1>
            
            {/* Tab buttons */}
            <div className="mb-6 flex space-x-6">
                <button
                    onClick={() => setActiveTab('cultivos')}
                    className={`py-2 px-4 font-semibold ${activeTab === 'cultivos' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Reporte de Cultivos
                </button>
                <button
                    onClick={() => setActiveTab('tratamientos')}
                    className={`py-2 px-4 font-semibold ${activeTab === 'tratamientos' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Reporte de Tratamientos
                </button>
                <button
                    onClick={() => setActiveTab('insumos')}
                    className={`py-2 px-4 font-semibold ${activeTab === 'insumos' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Reporte de Insumos
                </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
                {activeTab === 'cultivos' && (
                    <div>
                        {/* Reporte de Cultivos content */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold">Reporte de Cultivos</h2>
                            <button
                                onClick={generateCSV}
                                className="p-3 bg-blue-500 text-white rounded-md flex items-center gap-2 hover:bg-blue-600 transition duration-200"
                            >
                                <FaFileAlt /> Descargar
                            </button>
                        </div>

                        {/* Field Filter */}
                        <div className="mb-6">
                            <label htmlFor="fieldFilter" className="block text-sm font-medium text-gray-700 mb-2">
                                Filtrar por Campo:
                            </label>
                            <select
                                id="fieldFilter"
                                value={selectedFieldId}
                                onChange={handleFieldChange}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">Todos los Campos</option>
                                {Array.isArray(fields) && fields.length > 0 ? 
                                    Array.from(new Set(fields.map(field => field.campo_nombre)))  // Remove duplicates based on campo_nombre
                                    .map((fieldName, index) => {
                                        const fieldObj = fields.find(f => f.campo_nombre === fieldName);  // Find corresponding field object
                                        return (
                                            <option key={index} value={fieldObj?.campo_nombre || ''}>  {/* Set value to campo_nombre */}
                                                {fieldName}
                                            </option>
                                        );
                                    })
                                    : null
                                }
                            </select>
                        </div>

                        {/* Date Range Filter for Siembra and Cosecha - Inline Layout */}
                        <div className="mb-6 flex space-x-10"> {/* Increased the space here */}
                            {/* Siembra Date Range */}
                            <div>
                                <label htmlFor="startSiembra" className="block text-sm font-medium text-gray-700 mb-2">
                                    Filtrar por fecha de Siembra:
                                </label>
                                <div className="flex space-x-2">
                                    <div>
                                        <label htmlFor="startSiembra" className="text-sm text-gray-600">Desde</label>
                                        <input
                                            type="date"
                                            id="startSiembra"
                                            value={startSiembraDate}
                                            onChange={(e) => setStartSiembraDate(e.target.value)}
                                            className="p-2 border border-gray-300 rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="endSiembra" className="text-sm text-gray-600">Hasta</label>
                                        <input
                                            type="date"
                                            id="endSiembra"
                                            value={endSiembraDate}
                                            onChange={(e) => setEndSiembraDate(e.target.value)}
                                            className="p-2 border border-gray-300 rounded-md"
                                        />
                                    </div>
                                </div>
                                <div className="flex space-x-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={handleSiembraDateChange}
                                        className="p-2 bg-blue-500 text-white rounded-md"
                                    >
                                        Filtrar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleClearSiembraDates}
                                        className="p-2 bg-gray-500 text-white rounded-md"
                                    >
                                        Limpiar
                                    </button>
                                </div>
                            </div>

                            {/* Cosecha Date Range */}
                            <div>
                                <label htmlFor="startCosecha" className="block text-sm font-medium text-gray-700 mb-2">
                                    Filtrar por fecha de Cosecha:
                                </label>
                                <div className="flex space-x-2">
                                    <div>
                                        <label htmlFor="startCosecha" className="text-sm text-gray-600">Desde</label>
                                        <input
                                            type="date"
                                            id="startCosecha"
                                            value={startCosechaDate}
                                            onChange={(e) => setStartCosechaDate(e.target.value)}
                                            className="p-2 border border-gray-300 rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="endCosecha" className="text-sm text-gray-600">Hasta</label>
                                        <input
                                            type="date"
                                            id="endCosecha"
                                            value={endCosechaDate}
                                            onChange={(e) => setEndCosechaDate(e.target.value)}
                                            className="p-2 border border-gray-300 rounded-md"
                                        />
                                    </div>
                                </div>
                                <div className="flex space-x-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={handleCosechaDateChange}
                                        className="p-2 bg-blue-500 text-white rounded-md"
                                    >
                                        Filtrar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleClearCosechaDates}
                                        className="p-2 bg-gray-500 text-white rounded-md"
                                    >
                                        Limpiar
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Reports Table */}
                        <div className="overflow-x-auto">
                            <table id="report-table" className="min-w-full bg-white border border-gray-300 shadow-sm rounded-md">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="py-3 px-4 text-left border-b cursor-pointer" onClick={() => sortReports('campo_nombre')}>
                                        Campo
                                        {sortConfig.key === 'campo_nombre' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}
                                        {sortConfig.key !== 'campo_nombre' && <FaSort />}
                                    </th>
                                    <th className="py-3 px-4 text-left border-b cursor-pointer" onClick={() => sortReports('cultivo')}>
                                        Cultivo y Lote
                                        {sortConfig.key === 'cultivo' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}
                                        {sortConfig.key !== 'cultivo' && <FaSort />}
                                    </th>
                                    <th className="py-3 px-4 text-left border-b cursor-pointer" onClick={() => sortReports('tipo_semilla')}>
                                        Tipo de Semilla
                                        {sortConfig.key === 'tipo_semilla' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}
                                        {sortConfig.key !== 'tipo_semilla' && <FaSort />}
                                    </th>
                                    <th className="py-3 px-4 text-left border-b cursor-pointer" onClick={() => sortReports('fecha_siembra')}>
                                        Fecha de Siembra
                                        {sortConfig.key === 'fecha_siembra' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}
                                        {sortConfig.key !== 'fecha_siembra' && <FaSort />}
                                    </th>
                                    <th className="py-3 px-4 text-left border-b cursor-pointer" onClick={() => sortReports('cantidad_siembra')}>
                                        Cantidad Sembrada
                                        {sortConfig.key === 'cantidad_siembra' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}
                                        {sortConfig.key !== 'cantidad_siembra' && <FaSort />}
                                    </th>
                                    <th className="py-3 px-4 text-left border-b cursor-pointer" onClick={() => sortReports('estado')}>
                                        Etapa y Fecha de Registro
                                        {sortConfig.key === 'estado' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}
                                        {sortConfig.key !== 'estado' && <FaSort />}
                                    </th>
                                    <th className="py-3 px-4 text-left border-b cursor-pointer" onClick={() => sortReports('cantidad_cosechada')}>
                                        Cantidad Cosechada
                                        {sortConfig.key === 'cantidad_cosechada' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}
                                        {sortConfig.key !== 'cantidad_cosechada' && <FaSort />}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.length > 0 ? (
                                    filteredReports.map((report, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="py-3 px-4 border-b">{report.campo_nombre}</td>
                                            <td className="py-3 px-4 border-b">{report.cultivo} - {report.numero_lote}</td>
                                            <td className="py-3 px-4 border-b">{report.tipo_semilla}</td>
                                            <td className="py-3 px-4 border-b">{formatDate(report.fecha_siembra)}</td>
                                            <td className="py-3 px-4 border-b">{report.cantidad_siembra} {report.unidad_siembra}</td>
                                            <td className="py-3 px-4 border-b">{report.estado} - {formatDate(report.fecha_estado)}</td>
                                            <td className="py-3 px-4 border-b">{report.cantidad_cosecha} {report.unidad_cosecha}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-4 px-4 text-center text-gray-500">
                                            No hay reportes disponibles para este campo.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        </div>
                        
                    </div>
                )}

                {activeTab === 'tratamientos' && (
                                    <div>
                                        {/* Reporte de Tratamientos content */}
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-2xl font-semibold">Reporte de Tratamientos</h2>
                                            <button
                                                onClick={generateCSV}
                                                className="p-3 bg-blue-500 text-white rounded-md flex items-center gap-2 hover:bg-blue-600 transition duration-200"
                                            >
                                                <FaFileAlt /> Descargar
                                            </button>
                                        </div>

                                        {/* Field Filter */}
                                        <div className="mb-6">
                                            <label htmlFor="fieldFilter" className="block text-sm font-medium text-gray-700 mb-2">
                                                Filtrar por Campo:
                                            </label>
                                            <select
                                                id="fieldFilter"
                                                value={selectedFieldId}
                                                onChange={handleFieldChange}
                                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="all">Todos los Campos</option>
                                                {Array.isArray(fields) && fields.length > 0 ? 
                                                    Array.from(new Set(fields.map(field => field.campo_nombre)))  
                                                    .map((fieldName, index) => {
                                                        const fieldObj = fields.find(f => f.campo_nombre === fieldName);  
                                                        return (
                                                            <option key={index} value={fieldObj?.campo_nombre || ''}>  {/* Set value to campo_nombre */}
                                                                {fieldName}
                                                            </option>
                                                        );
                                                    })
                                                    : null
                                                }
                                            </select>
                                        </div>

                                        {/* Date Filter - Single date filter for "Fecha" */}
                                        <div className="mb-6">
                                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                                                Filtrar por Fecha:
                                            </label>
                                            <div className="flex space-x-2">
                                                <div>
                                                    <label htmlFor="startDate" className="text-sm text-gray-600">Desde</label>
                                                    <input
                                                        type="date"
                                                        id="startDate"
                                                        value={startSiembraDate} // You can use the same state for both filters
                                                        onChange={(e) => setStartSiembraDate(e.target.value)}
                                                        className="p-2 border border-gray-300 rounded-md"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="endDate" className="text-sm text-gray-600">Hasta</label>
                                                    <input
                                                        type="date"
                                                        id="endDate"
                                                        value={endSiembraDate} // Same state for the end date filter
                                                        onChange={(e) => setEndSiembraDate(e.target.value)}
                                                        className="p-2 border border-gray-300 rounded-md"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex space-x-2 mt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        // Filter by fecha_tratamiento for tratamientos
                                                        const filtered = fields.filter((field) => {
                                                            const fechaTratamiento = new Date(field.fecha_tratamiento);
                                                            const startDate = new Date(startSiembraDate);
                                                            const endDate = new Date(endSiembraDate);
                                                            return (
                                                                (startSiembraDate === '' || fechaTratamiento >= startDate) &&
                                                                (endSiembraDate === '' || fechaTratamiento <= endDate)
                                                            );
                                                        });
                                                        setFilteredReports(filtered);
                                                    }}
                                                    className="p-2 bg-blue-500 text-white rounded-md"
                                                >
                                                    Filtrar
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setStartSiembraDate(''); // Reset the start date
                                                        setEndSiembraDate(''); // Reset the end date
                                                        setFilteredReports(fields); // Reset to show all reports
                                                    }}
                                                    className="p-2 bg-gray-500 text-white rounded-md"
                                                >
                                                    Limpiar
                                                </button>
                                            </div>
                                        </div>


                                        {/* Reports Table */}
                                        <div className="overflow-x-auto">
                                            <table id="report-table" className="min-w-full bg-white border border-gray-300 shadow-sm rounded-md">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="py-3 px-4 text-left border-b cursor-pointer" onClick={() => sortReports('campo_nombre')}>
                                                        Campo
                                                        {sortConfig.key === 'campo_nombre' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}
                                                        {sortConfig.key !== 'campo_nombre' && <FaSort />}
                                                    </th>
                                                    <th className="py-3 px-4 text-left border-b cursor-pointer" onClick={() => sortReports('nombre_tratamiento')}>
                                                        Tratamiento
                                                        {sortConfig.key === 'nombre_tratamiento' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}
                                                        {sortConfig.key !== 'nombre_tratamiento' && <FaSort />}
                                                    </th>
                                                    <th className="py-3 px-4 text-left border-b cursor-pointer" onClick={() => sortReports('categoria_tratamiento')}>
                                                        Categoría
                                                        {sortConfig.key === 'categoria_tratamiento' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}
                                                        {sortConfig.key !== 'categoria_tratamiento' && <FaSort />}
                                                    </th>
                                                    <th className="py-3 px-4 text-left border-b cursor-pointer" onClick={() => sortReports('subcategoria_tratamiento')}>
                                                        Subcategoría
                                                        {sortConfig.key === 'subcategoria_tratamiento' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}
                                                        {sortConfig.key !== 'subcategoria_tratamiento' && <FaSort />}
                                                    </th>
                                                    <th className="py-3 px-4 text-left border-b cursor-pointer" onClick={() => sortReports('fecha_tratamiento')}>
                                                        Fecha
                                                        {sortConfig.key === 'fecha_tratamiento' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}
                                                        {sortConfig.key !== 'fecha_tratamiento' && <FaSort />}
                                                    </th>
                                                    <th className="py-3 px-4 text-left border-b cursor-pointer" onClick={() => sortReports('cultivo')}>
                                                        Cultivo Asociado
                                                        {sortConfig.key === 'cultivo' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}
                                                        {sortConfig.key !== 'cultivo' && <FaSort />}
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                            {filteredReports.length > 0 ? (
                                                filteredReports.map((report, index) => (
                                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                        <td className="py-3 px-4 border-b">{report.campo_nombre}</td>
                                                        <td className="py-3 px-4 border-b">{report.nombre_tratamiento}</td>
                                                        <td className="py-3 px-4 border-b">{report.categoria_tratamiento}</td>
                                                        <td className="py-3 px-4 border-b">{report.subcategoria_tratamiento}</td>
                                                        <td className="py-3 px-4 border-b">{formatDate(report.fecha_tratamiento)}</td>
                                                        <td className="py-3 px-4 border-b">{report.cultivo} - {report.numero_lote}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="py-4 px-4 text-center text-gray-500">
                                                        No hay reportes disponibles para este campo.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>

                                        </table>

                                        </div>
                                        
                                    </div>
                )}
                {activeTab === 'insumos' && (
                    <div>
                        {/* Reporte de Insumos content */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold">Reporte de Insumos</h2>
                            <button
                                onClick={generateCSV}
                                className="p-3 bg-blue-500 text-white rounded-md flex items-center gap-2 hover:bg-blue-600 transition duration-200"
                            >
                                <FaFileAlt /> Descargar
                            </button>
                        </div>

                        {/* Field Filter */}
                        <div className="mb-6">
                            <label htmlFor="fieldFilter" className="block text-sm font-medium text-gray-700 mb-2">
                                Filtrar por Campo:
                            </label>
                            <select
                                id="fieldFilter"
                                value={selectedFieldId}
                                onChange={handleFieldChange}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">Todos los Campos</option>
                                {Array.isArray(fields) && fields.length > 0 ? 
                                    Array.from(new Set(fields.map(field => field.campo_nombre)))  
                                    .map((fieldName, index) => {
                                        const fieldObj = fields.find(f => f.campo_nombre === fieldName);  
                                        return (
                                            <option key={index} value={fieldObj?.campo_nombre || ''}>
                                                {fieldName}
                                            </option>
                                        );
                                    })
                                    : null
                                }
                            </select>
                        </div>

                        {/* Date Filter - Single date filter for "Fecha" */}
                        <div className="mb-6">
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                                Filtrar por Fecha:
                            </label>
                            <div className="flex space-x-2">
                                <div>
                                    <label htmlFor="startDate" className="text-sm text-gray-600">Desde</label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        value={startSiembraDate} // Reuse the same state for filtering
                                        onChange={(e) => setStartSiembraDate(e.target.value)}
                                        className="p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="endDate" className="text-sm text-gray-600">Hasta</label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        value={endSiembraDate} // Same state for the end date
                                        onChange={(e) => setEndSiembraDate(e.target.value)}
                                        className="p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-2 mt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        // For inputs, filter by fecha_adquisicion
                                        const filtered = fields.filter((field) => {
                                            const fechaAdquisicion = new Date(field.fecha_adquisicion);
                                            const startDate = new Date(startSiembraDate);
                                            const endDate = new Date(endSiembraDate);
                                            return (
                                                (startSiembraDate === '' || fechaAdquisicion >= startDate) &&
                                                (endSiembraDate === '' || fechaAdquisicion <= endDate)
                                            );
                                        });
                                        setFilteredReports(filtered);
                                    }}
                                    className="p-2 bg-blue-500 text-white rounded-md"
                                >
                                    Filtrar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStartSiembraDate(''); // Reset the start date
                                        setEndSiembraDate(''); // Reset the end date
                                        setFilteredReports(fields); // Reset to show all reports
                                    }}
                                    className="p-2 bg-gray-500 text-white rounded-md"
                                >
                                    Limpiar
                                </button>
                            </div>
                        </div>

                        {/* Reports Table */}
                        <div className="overflow-x-auto">
                            <table id="report-table" className="min-w-full bg-white border border-gray-300 shadow-sm rounded-md">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="py-3 px-4 text-left border-b cursor-pointer" onClick={() => sortReports('campo_nombre')}>
                                            Campo
                                            {sortConfig.key === 'campo_nombre' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}
                                            {sortConfig.key !== 'campo_nombre' && <FaSort />}
                                        </th>
                                        <th className="py-3 px-4 text-left border-b cursor-pointer" onClick={() => sortReports('nombre_insumo')}>
                                            Insumo
                                            {sortConfig.key === 'nombre_insumo' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}
                                            {sortConfig.key !== 'nombre_insumo' && <FaSort />}
                                        </th>
                                        <th className="py-3 px-4 text-left border-b cursor-pointer" onClick={() => sortReports('categoria_insumo')}>
                                            Categoría
                                            {sortConfig.key === 'categoria_insumo' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}
                                            {sortConfig.key !== 'categoria_insumo' && <FaSort />}
                                        </th>
                                        <th className="py-3 px-4 text-left border-b cursor-pointer" onClick={() => sortReports('subcategoria_insumo')}>
                                            Subcategoría
                                            {sortConfig.key === 'subcategoria_insumo' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}
                                            {sortConfig.key !== 'subcategoria_insumo' && <FaSort />}
                                        </th>
                                        <th className="py-3 px-4 text-left border-b cursor-pointer" onClick={() => sortReports('fecha_adquisicion')}>
                                            Fecha
                                            {sortConfig.key === 'fecha_adquisicion' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}
                                            {sortConfig.key !== 'fecha_adquisicion' && <FaSort />}
                                        </th>
                                        <th className="py-3 px-4 text-left border-b cursor-pointer" onClick={() => sortReports('cultivo')}>
                                            Cultivo Asociado
                                            {sortConfig.key === 'cultivo' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}
                                            {sortConfig.key !== 'cultivo' && <FaSort />}
                                        </th>
                                        <th className="py-3 px-4 text-left border-b cursor-pointer" onClick={() => sortReports('nombre_tratamiento')}>
                                            Tratamiento Asociado
                                            {sortConfig.key === 'nombre_tratamiento' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}
                                            {sortConfig.key !== 'nombre_tratamiento' && <FaSort />}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReports.length > 0 ? (
                                        filteredReports.map((report, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="py-3 px-4 border-b">{report.campo_nombre}</td>
                                                <td className="py-3 px-4 border-b">{report.nombre_insumo}</td>
                                                <td className="py-3 px-4 border-b">{report.categoria_insumo}</td>
                                                <td className="py-3 px-4 border-b">{report.subcategoria_insumo}</td>
                                                <td className="py-3 px-4 border-b">{formatDate(report.fecha_adquisicion)}</td>
                                                <td className="py-3 px-4 border-b">{report.cultivo ? `${report.cultivo} - ${report.numero_lote}` : '-'}</td>
                                                <td className="py-3 px-4 border-b">
                                                    {report.nombre_tratamiento ? 
                                                    `${report.nombre_tratamiento} - ${formatDate(report.fecha_tratamiento)}` : 
                                                    '-'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                                                No hay reportes disponibles para este campo.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            </div>
            </div>
        </div>
    );
    
    
}