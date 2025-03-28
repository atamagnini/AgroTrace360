//reports.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaRegCalendarAlt, FaRegListAlt, FaSearch, FaChartBar, FaFileAlt, FaSignOutAlt, FaHome, FaMapMarkerAlt, FaSeedling } from 'react-icons/fa';
import axios from 'axios';

interface CropData {
    idcrops: number;
    cultivo: string;
    numero_lote: string;
    tipo_semilla: string;
    fecha_siembra: string;
    fecha_estimada_cosecha: string;
    cantidad_siembra: number;
    unidad_siembra: string;
    estado: string;
    fecha_cosecha: string | null;
    campo_nombre: string;
    inputs: Array<{
        nombre_insumo: string;
        categoria_insumo: string;
        subcategoria_insumo: string;
    }>;
    treatments: Array<{
        nombre_tratamiento: string;
        categoria_tratamiento: string;
        fecha_tratamiento: string;
    }>;
}

export default function Reports() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [fieldName, setFieldName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [cropData, setCropData] = useState<CropData[]>([]);
    const [filteredCropData, setFilteredCropData] = useState<CropData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    
    const [selectedField, setSelectedField] = useState<string>('Todos');
    const [selectedCrop, setSelectedCrop] = useState<string>('Todos');
    const [selectedState, setSelectedState] = useState<string>('Todos');
    const [selectedTreatment, setSelectedTreatment] = useState<string>('Todos');
    const [selectedInput, setSelectedInput] = useState<string>('Todos');
    const [dateRange, setDateRange] = useState<{start: string, end: string}>({
        start: '',
        end: ''
    });
    const [fieldOptions, setFieldOptions] = useState<string[]>(['Todos']);
    const [cropOptions, setCropOptions] = useState<string[]>(['Todos']);
    const [stateOptions, setStateOptions] = useState<string[]>(['Todos']);
    const [treatmentOptions, setTreatmentOptions] = useState<string[]>(['Todos']);
    const [inputOptions, setInputOptions] = useState<string[]>(['Todos']);

    const [filtersApplied, setFiltersApplied] = useState<boolean>(false);


    useEffect(() => {
        const fetchCropData = async () => {
            try {
                setLoading(true);
                const userId = localStorage.getItem('userId');
                const response = await axios.post('https://qz74wuk45k.execute-api.us-east-1.amazonaws.com/get-all-data-reports/get-all-data-reports', { 
                    idcuentas: userId 
                });
                const data = response.data && response.data.body ? JSON.parse(response.data.body) : [];
                console.log('Fetched crop data:', data);
            if (Array.isArray(data)) {
                setCropData(data);
                setFilteredCropData(data);
            } else {
                console.error('Data is not an array:', data);
            }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching crop data:', error);
                setError('Failed to load crop data');
                setLoading(false);
            }
        };

        fetchCropData();
    }, []);

    const applyFilters = () => {
        console.log("Applying filters...");
    
        if (!Array.isArray(cropData)) {
            console.error('cropData is not an array:', cropData);
            return;
        }
    
        let filtered = [...cropData];
    
        // Apply filters
        if (selectedField !== 'Todos') {
            filtered = filtered.filter(crop => crop.campo_nombre === selectedField);
        }
        if (selectedCrop !== 'Todos') {
            filtered = filtered.filter(crop => crop.cultivo === selectedCrop);
        }
        if (selectedState !== 'Todos') {
            filtered = filtered.filter(crop => crop.estado === selectedState);
        }
        if (selectedTreatment !== 'Todos') {
            filtered = filtered.filter(crop => crop.treatments.some(t => t.nombre_tratamiento === selectedTreatment));
        }
        if (selectedInput !== 'Todos') {
            filtered = filtered.filter(crop => crop.inputs.some(i => i.nombre_insumo === selectedInput));
        }
        if (dateRange.start && dateRange.end) {
            filtered = filtered.filter(crop => {
                const cropDate = new Date(crop.fecha_siembra);
                return cropDate >= new Date(dateRange.start) && cropDate <= new Date(dateRange.end);
            });
        }
    
        setFilteredCropData(filtered);
    };
      
    
    useEffect(() => {
        if (!Array.isArray(filteredCropData)) {
            setFilteredCropData([]);
        }
        applyFilters();
    }, [selectedField, selectedCrop, selectedState, selectedTreatment, selectedInput, dateRange, cropData]);
    

    useEffect(() => {
        if (cropData.length > 0) {
            const newFieldOptions = ['Todos', ...new Set(cropData.map(crop => crop.campo_nombre || 'Sin Campo'))];
            const newCropOptions = ['Todos', ...new Set(cropData.map(crop => crop.cultivo || 'Sin Cultivo'))];
            const newStateOptions = ['Todos', ...new Set(cropData.map(crop => crop.estado || 'Sin Estado'))];
            const newTreatmentOptions = ['Todos', ...new Set(cropData.flatMap(crop => 
                crop.treatments?.map(t => t.nombre_tratamiento || 'Sin Tratamiento') || []
            ))];
            const newInputOptions = ['Todos', ...new Set(cropData.flatMap(crop => 
                crop.inputs?.map(i => i.nombre_insumo || 'Sin Insumo') || []
            ))];
    
            setFieldOptions(newFieldOptions);
            setCropOptions(newCropOptions);
            setStateOptions(newStateOptions);
            setTreatmentOptions(newTreatmentOptions);
            setInputOptions(newInputOptions);
        }
    }, [cropData]);
    
    
    const handleLogout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('userId');    
        navigate('/');
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
    
                {/* Content Container */}
                <div className="p-6">
                    {/* Filter Section */}
                    <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
                        <div className="grid grid-cols-3 gap-4">
                            {/* Campo Filter */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Campo</label>
                                <select 
                                    value={selectedField} 
                                    onChange={(e) => {
                                        setSelectedField(e.target.value);
                                        applyFilters();
                                    }} 
                                    className="p-2 border rounded w-full"
                                >
                                    {fieldOptions.map(field => (
                                        <option key={field} value={field}>{field}</option>
                                    ))}
                                </select>
                            </div>
    
                            {/* Cultivo Filter */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Cultivo</label>
                                <select 
                                    value={selectedCrop} 
                                    onChange={(e) => {
                                        setSelectedCrop(e.target.value);
                                        applyFilters();
                                    }} 
                                    className="p-2 border rounded w-full"
                                >
                                    {cropOptions.map(crop => (
                                        <option key={crop} value={crop}>{crop}</option>
                                    ))}
                                </select>
                            </div>
    
                            {/* Estado Filter */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Estado</label>
                                <select 
                                    value={selectedState} 
                                    onChange={(e) => {
                                        setSelectedState(e.target.value);
                                        applyFilters();
                                    }} 
                                    className="p-2 border rounded w-full"
                                >
                                    {stateOptions.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>
    
                            {/* Tratamiento Filter */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Tratamiento</label>
                                <select 
                                    value={selectedTreatment} 
                                    onChange={(e) => {
                                        setSelectedTreatment(e.target.value);
                                        applyFilters();
                                    }} 
                                    className="p-2 border rounded w-full"
                                >
                                    {treatmentOptions.map(treatment => (
                                        <option key={treatment} value={treatment}>{treatment}</option>
                                    ))}
                                </select>
                            </div>
    
                            {/* Insumo Filter */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Insumo</label>
                                <select 
                                    value={selectedInput} 
                                    onChange={(e) => {
                                        setSelectedInput(e.target.value);
                                        applyFilters();
                                    }} 
                                    className="p-2 border rounded w-full"
                                >
                                    {inputOptions.map(input => (
                                        <option key={input} value={input}>{input}</option>
                                    ))}
                                </select>
                            </div>
    
                            {/* Date Range Filter */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Rango de Fechas</label>
                                <div className="flex space-x-2">
                                    <input 
                                        type="date" 
                                        value={dateRange.start}
                                        onChange={(e) => {
                                            setDateRange({...dateRange, start: e.target.value});
                                            applyFilters();
                                        }}
                                        className="p-2 border rounded w-1/2"
                                    />
                                    <input 
                                        type="date" 
                                        value={dateRange.end}
                                        onChange={(e) => {
                                            setDateRange({...dateRange, end: e.target.value});
                                            applyFilters();
                                        }}
                                        className="p-2 border rounded w-1/2"
                                    />
                                </div>
                            </div>
                        </div>
    
                        {/* Apply Filters Button */}
                        <div className="flex justify-end mt-4">
                            <button 
                                onClick={applyFilters} 
                                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
                            >
                                Aplicar Filtros
                            </button>
                        </div>
                    </div>
    
                    {/* Reports Title */}
                    <h1 className="text-4xl font-bold mb-4">Reports</h1>
    
                    {/* Table Section */}
                    <div className="overflow-x-auto w-full">
                        <table className="min-w-full table-auto">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="px-4 py-2 border">Cultivo</th>
                                    <th className="px-4 py-2 border">Field</th>
                                    <th className="px-4 py-2 border">Lot Number</th>
                                    <th className="px-4 py-2 border">State</th>
                                    <th className="px-4 py-2 border">Planting Date</th>
                                    <th className="px-4 py-2 border">Harvest Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCropData.length > 0 ? (
                                    filteredCropData.map(crop => (
                                        <tr key={`${crop.idcrops}-${crop.cultivo}-${crop.numero_lote}-${Math.random()}`}>
                                            <td className="px-4 py-2 border">{crop.cultivo}</td>
                                            <td className="px-4 py-2 border">{crop.campo_nombre}</td>
                                            <td className="px-4 py-2 border">{crop.numero_lote}</td>
                                            <td className="px-4 py-2 border">{crop.estado}</td>
                                            <td className="px-4 py-2 border">{crop.fecha_siembra}</td>
                                            <td className="px-4 py-2 border">{crop.fecha_cosecha || 'N/A'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center px-4 py-2 border text-gray-500">
                                            No crops found matching the current filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
    
    
}
