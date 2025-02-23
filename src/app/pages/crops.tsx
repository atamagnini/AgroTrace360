import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaRegCalendarAlt, FaRegListAlt, FaSearch, FaChartBar, FaFileAlt } from 'react-icons/fa';

export default function Crops() {
    const { id } = useParams();
    const [fieldName, setFieldName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [weatherData, setWeatherData] = useState<any>(null);
    const [lat, setLat] = useState<number | null>(null);
    const [lon, setLon] = useState<number | null>(null);
    const [showForm, setShowForm] = useState<boolean>(false);
  
    useEffect(() => {
      // If the id is present, fetch data from the API
      if (id) {
        fetchFieldData(id);
      }
    }, [id]);
  
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
            // Assuming the first item in the array is the field data we need
            const field = data[0];
            setFieldName(field.nombre || 'No field name available');
            setUserName(field.nombre_usuario || 'No user name available');
            setLat(field.latitud); 
            setLon(field.longitud);
            setLoading(false);
          } else {
            setError('No field data found.');
            setLoading(false);
          }
      } catch (error) {
        setError('Failed to fetch field data');
        setLoading(false);
      }
    };

    const handleAgregarCultivoClick = () => {
        setShowForm(true); // Show the form when the button is clicked
    };

    const handleCancelarClick = () => {
        setShowForm(false); // Close the form when "Cancelar" is clicked
    };
  
    if (loading) {
      return <p>Loading...</p>;
    }
  
    if (error) {
      return <p>Error: {error}</p>;
    }
  
    return (
        <div className="flex">
            {/* Sidebar with buttons */}
            <div className="w-1/4 bg-gray-800 text-white p-6">
                <div className="flex flex-col space-y-4">
                    <button className="flex items-center space-x-3 bg-gray-700 p-3 rounded hover:bg-blue-600">
                        <FaChartBar className="text-white" />
                        <span>Cultivos</span>
                    </button>
                    <button className="flex items-center space-x-3 bg-gray-700 p-3 rounded hover:bg-blue-600">
                        <FaSearch className="text-white" />
                        <span>Seguimiento</span>
                    </button>
                    <button className="flex items-center space-x-3 bg-gray-700 p-3 rounded hover:bg-blue-600">
                        <FaRegCalendarAlt className="text-white" />
                        <span>Calendario</span>
                    </button>
                    <button className="flex items-center space-x-3 bg-gray-700 p-3 rounded hover:bg-blue-600">
                        <FaFileAlt className="text-white" />
                        <span>Reportes</span>
                    </button>
                    <button className="flex items-center space-x-3 bg-gray-700 p-3 rounded hover:bg-blue-600">
                        <FaRegListAlt className="text-white" />
                        <span>Catálogo</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-3/4 p-6">
                <h1 className="text-4xl font-bold mb-4">{fieldName}</h1>
                
                {/* Add Cultivo Button */}
                <div className="mb-4">
                    <button 
                        onClick={handleAgregarCultivoClick}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        Agregar cultivo
                    </button>
                </div>

                {/* Form for Agregar Cultivo */}
                {showForm && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg w-96">
                            <h2 className="text-2xl font-bold mb-4">Registro de nuevo cultivo</h2>
                            <div className="flex justify-between">
                                <button
                                    onClick={handleCancelarClick}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleCancelarClick} // Implement form submission here
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                >
                                    Aceptar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Table for crops */}
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border-collapse border border-gray-800">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="px-6 py-3 text-left">Nombre</th>
                                <th className="px-6 py-3 text-left">Estado</th>
                                <th className="px-6 py-3 text-left">Fecha de siembra</th>
                                <th className="px-6 py-3 text-left">Fecha de cosecha</th>
                                <th className="px-6 py-3 text-left">Cantidad cosechada</th>
                                <th className="px-6 py-3 text-left">Detalles</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="px-6 py-4 border-t border-gray-200">Tomate</td>
                                <td className="px-6 py-4 border-t border-gray-200">Germinación</td>
                                <td className="px-6 py-4 border-t border-gray-200">23/05/2025</td>
                                <td className="px-6 py-4 border-t border-gray-200">01/11/2025</td>
                                <td className="px-6 py-4 border-t border-gray-200">1,4tn</td>
                                <td className="px-6 py-4 border-t border-gray-200">Detalles</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 border-t border-gray-200">Trigo</td>
                                <td className="px-6 py-4 border-t border-gray-200">Cosecha</td>
                                <td className="px-6 py-4 border-t border-gray-200">23/05/2025</td>
                                <td className="px-6 py-4 border-t border-gray-200"></td>
                                <td className="px-6 py-4 border-t border-gray-200"></td>
                                <td className="px-6 py-4 border-t border-gray-200">Detalles</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
  }