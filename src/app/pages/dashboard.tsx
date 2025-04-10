/* eslint-disable */

'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaRegCalendarAlt, FaRegListAlt, FaSearch, FaChartBar, FaFileAlt, FaSignOutAlt, FaMapMarkerAlt, FaSeedling, FaUser,FaTrashAlt } from 'react-icons/fa';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [fieldName, setFieldName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');    
    interface Crop {
        idcrops: number;
        cultivo: string;
        numero_lote: string;
        estado: string;
        fecha_cosecha: string;
        fecha_siembra: string;
        fecha_estado: string;
    }
    interface ChartDataPoint {
      year: string | number;
      quantity: number;
      unit: string;
    }
    const [currentCrops, setCurrentCrops] = useState<any[]>([]);
    const [selectedField, setSelectedField] = useState<string | null>(null);
    
    const [upcomingActions, setUpcomingActions] = useState<any[]>([]);

    const [productionData, setProductionData] = useState<any[]>([]);
    const [availableCrops, setAvailableCrops] = useState<string[]>([]);
    const [selectedCrop, setSelectedCrop] = useState<string>('');
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
  

    const prepareComparativeChartData = () => {
      if (!productionData.length) return [];
      
      const yearGroups: Record<string, Record<string, number>> = {};
      
      productionData.forEach((item: any) => {
        if (!item.fecha_cosecha) return;
        
        const year = new Date(item.fecha_cosecha).getFullYear().toString();
        const crop = item.cultivo;
        const quantity = parseFloat(item.cantidad_cosecha) || 0;
        
        if (!yearGroups[year]) {
          yearGroups[year] = {};
          availableCrops.forEach(c => yearGroups[year][c] = 0);
        }
        
        yearGroups[year][crop] += quantity;
      });
      
      return Object.entries(yearGroups).map(([year, crops]) => ({
        year,
        ...crops
      })).sort((a, b) => parseInt(a.year) - parseInt(b.year));
    };

    const fetchCurrentCrops = async (userId: string, fieldId: string) => {
        try {
          const response = await axios.post(
            'https://zosi7bcnv4.execute-api.us-east-1.amazonaws.com/get-crop-data/get-crop-data',
            { idcuentas: userId, idcampo: fieldId },
            { headers: { 'Content-Type': 'application/json' } }
          );
          const data = JSON.parse(response.data.body);
          if (response.status === 200 && data.length > 0) {
            const filteredCrops = data.filter((crop: Crop) => crop.estado !== 'Cosecha');
            setCurrentCrops(filteredCrops);
          } else {  
            setCurrentCrops([]);
          }
          setLoading(false);
        } catch (error) {
          console.error('Failed to fetch crops:', error);
          setLoading(false); // And also here in case of an error
        }
      };
      
      const fetchUpcomingActions = async (userId: string, fieldId: string) => {
        try {
          const response = await axios.post(
            'https://u8ixzl5vj9.execute-api.us-east-1.amazonaws.com/get-dates/get-dates',
            { idcuentas: userId, idcampo: fieldId },
            { headers: { 'Content-Type': 'application/json' } }
          );
          const data = JSON.parse(response.data.body);
          if (response.status === 200 && data.length > 0) {
            const futureActions = data.filter((item: any) => 
              item.fecha_tratamiento && new Date(item.fecha_tratamiento) > new Date()
            );
            setUpcomingActions(futureActions);
          } else {
            setUpcomingActions([]);
          }
        } catch (error) {
          console.error('Failed to fetch upcoming actions:', error);
        }
      };

      const fetchProductionData = async (userId: string, fieldId: string) => {
        try {
          const response = await axios.post(
            'https://5j7lxm8mn5.execute-api.us-east-1.amazonaws.com/get-data-production/get-data-production',
            { idcuentas: userId, idcampo: fieldId },
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          const data = JSON.parse(response.data.body);
          if (response.status === 200 && data.length > 0) {
            setProductionData(data);
            
            // Extract unique crop types from the data and add type assertion
            const crops = [...new Set(data.map((item: any) => item.cultivo))] as string[];
            setAvailableCrops(crops);
            
            // Set first crop as default selected crop with type assertion
            if (crops.length > 0 && !selectedCrop) {
              setSelectedCrop(crops[0]);
            }
          } else {
            setProductionData([]);
            setAvailableCrops([]);
          }
        } catch (error) {
          console.error('Failed to fetch production data:', error);
          setProductionData([]);
        }
      };

    const handleLogout = () => {
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
              
              // Add these function calls
              fetchCurrentCrops(id!, fieldId);
              fetchUpcomingActions(id!, fieldId);
              fetchProductionData(id!, fieldId);
            }
            setLoading(false);
          } catch (error) {
            console.error('Error fetching field details:', error);
            setError('Failed to fetch field details');
            setLoading(false);
          }
        };

        fetchFieldDetails();
      } else {
        fetchFieldData(id!);
      }
    }, [id, location.search]);
      
    const fetchFieldData = async (userId: string) => {
      try {
        const response = await axios.post(
          'https://cbv6225k4g.execute-api.us-east-1.amazonaws.com/get-field-data/get-field-data',
          { idcuentas: userId },
          { headers: { 'Content-Type': 'application/json' } }
        );
        const data = JSON.parse(response.data.body);
        if (response.status === 200 && data.length > 0) {
          const field = data[0];
          setFieldName(field.nombre || 'No field name available');
          setUserName(field.nombre_usuario || 'No user name available');
          setSelectedField(field.idcampo);
          fetchCurrentCrops(userId, field.idcampo);
          fetchUpcomingActions(userId, field.idcampo);
          fetchProductionData(userId, field.idcampo);
          setLoading(false);
        } else {
          setError('No tienes campos aún');
          setLoading(false);
        }
      } catch (error) {
        setError('Failed to fetch field data');
        setLoading(false);
      }
    };
  

    useEffect(() => {
      if (typeof document !== 'undefined') { // Ensure we're on the client-side
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
  
  
    const prepareChartData = (): ChartDataPoint[] => {
      if (!productionData.length || !selectedCrop) return [];
      
      const filteredData = productionData.filter(item => item.cultivo === selectedCrop);
      
      const groupedByYear = filteredData.reduce((acc: Record<string, ChartDataPoint>, curr: any) => {
        const year = curr.fecha_cosecha ? new Date(curr.fecha_cosecha).getFullYear() : 'Unknown';
        const quantity = parseFloat(curr.cantidad_cosecha) || 0;
        
        if (!acc[year]) {
          acc[year] = {
            year,
            quantity: 0,
            unit: curr.unidad_cosecha || 'Unknown'
          };
        }
        
        acc[year].quantity += quantity;
        return acc;
      }, {});
      
      return Object.values(groupedByYear).sort((a: ChartDataPoint, b: ChartDataPoint) => 
        typeof a.year === 'number' && typeof b.year === 'number' ? a.year - b.year : 0
      );
    };

      const formatDateLatinAmerican = (dateString: string | null | undefined): string => {
        if (!dateString) return 'No especificada';
        
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return dateString;
          
          return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        } catch (error) {
          console.error('Error formatting date:', error);
          return dateString;
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
                <h2 className="text-2xl font-bold mb-4">{userName}</h2>
                
                {/* Content Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Bottom: Performance Graphs (spans 2 columns) */}
                    <div className="bg-white rounded-lg shadow-md p-4 col-span-2">
                        <h3 className="text-xl font-semibold mb-3">Gráficos de rendimiento</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Annual Production Chart */}
                          <div className="flex flex-col">
                            <h3 className="text-xl font-semibold mb-3">Producción Anual</h3>                            
                            {/* Dropdown to select crop */}
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Seleccionar Cultivo:
                              </label>
                              <select 
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                value={selectedCrop}
                                onChange={(e) => setSelectedCrop(e.target.value)}
                              >
                                {availableCrops.map((crop) => (
                                  <option key={crop} value={crop}>
                                    {crop}
                                  </option>
                                ))}
                                {availableCrops.length === 0 && (
                                  <option value="">No hay cultivos disponibles</option>
                                )}
                              </select>
                            </div>
                            
                            {/* Production Histogram */}
                            <div className="bg-gray-100 p-3 rounded-lg" style={{ height: '300px' }}>
                              {productionData.length > 0 && selectedCrop ? (
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={prepareChartData()}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="year" />
                                    <YAxis label={{ 
                                      value: `Cantidad (${prepareChartData().length > 0 ? prepareChartData()[0].unit : ''})`, 
                                      angle: -90, 
                                      position: 'insideLeft' 
                                    }} />
                                    <Tooltip 
                                      formatter={(value, name) => {
                                        const chartData = prepareChartData();
                                        const unit = chartData.length > 0 ? chartData[0].unit : '';
                                        return [`${value} ${unit}`, 'Producción'];
                                      }}
                                      labelFormatter={(label) => `Año: ${label}`}
                                    />
                                    <Legend />
                                    <Bar dataKey="quantity" name={`Producción de ${selectedCrop}`} fill="#8884d8" />
                                  </BarChart>
                                </ResponsiveContainer>
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <p className="text-gray-500">
                                    {availableCrops.length === 0 
                                      ? "No hay datos de producción disponibles." 
                                      : "Seleccione un cultivo para ver su historial de producción."}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Comparative Yield Chart - NEW */}
                          <div className="bg-white rounded-lg shadow-md p-4">
                            <h3 className="text-xl font-semibold mb-3">Rendimiento Comparativo Anual</h3>
                            <div className="bg-gray-100 p-3 rounded-lg" style={{ height: '300px' }}>
                              {productionData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={prepareComparativeChartData()}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="year" />
                                    <YAxis label={{ 
                                      value: 'Cantidad', 
                                      angle: -90, 
                                      position: 'insideLeft' 
                                    }} />
                                    <Tooltip />
                                    <Legend />
                                    {availableCrops.map((crop, index) => (
                                      <Bar 
                                        key={crop} 
                                        dataKey={crop} 
                                        stackId="a" 
                                        fill={`hsl(${index * 60}, 70%, 60%)`} 
                                      />
                                    ))}
                                  </BarChart>
                                </ResponsiveContainer>
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <p className="text-gray-500">No hay datos de producción disponibles.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>                        
                    </div>

                    {/* Top Left: Current Crops */}
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <h3 className="text-xl font-semibold mb-3">Cultivos Actuales</h3>
                        {currentCrops.length > 0 ? (
                            currentCrops.map((crop, index) => (
                            <div key={index} className="bg-gray-100 p-3 rounded-lg mb-4">
                                <p><strong>Cultivo de:</strong> {crop.cultivo}</p>
                                <p><strong>Número de Lote:</strong> {crop.numero_lote}</p>
                                <p><strong>Fecha de Siembra:</strong> {formatDateLatinAmerican(crop.fecha_siembra)}</p>
                                <p><strong>Último Estado:</strong> {crop.estado} (registrado el {formatDateLatinAmerican(crop.fecha_estado)})</p>
                            </div>
                            ))
                        ) : (
                            <p>No hay cultivos actuales para este campo.</p>
                        )}
                    </div>

                    
                    {/* Top Right: Upcoming Actions */}
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <h3 className="text-xl font-semibold mb-3">Acciones próximas</h3>
                        {/* Upcoming actions content goes here */}
                        <div className="bg-gray-100 p-3 rounded-lg">
                        {upcomingActions.length > 0 ? (
                          upcomingActions.map((action, index) => (
                            <div key={index} className="bg-gray-100 p-3 rounded-lg mb-4">
                              <p><strong>Tratamiento:</strong> {action.nombre_tratamiento}</p>
                              <p><strong>Fecha programada:</strong> {formatDateLatinAmerican(action.fecha_tratamiento)}</p>
                              <p><strong>Cultivo:</strong> {action.cultivo}</p>
                              <p><strong>Número de Lote:</strong> {action.numero_lote}</p>
                            </div>
                          ))
                        ) : (
                          <p>No hay acciones próximas programadas.</p>
                        )}
                        </div>
                    </div>
                    
                    
                </div>
            </div>
        </div>
    );
}
