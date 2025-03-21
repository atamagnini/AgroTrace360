import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaRegCalendarAlt, FaRegListAlt, FaSearch, FaChartBar, FaFileAlt, FaSignOutAlt } from 'react-icons/fa';
import axios from 'axios';

export default function Tracking() {
    const { id, idcampo } = useParams(); 
    const navigate = useNavigate();
    const [fieldName, setFieldName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [activeTab, setActiveTab] = useState<string>('detalles');
    const [crops, setCrops] = useState<any[]>([]);
    const [selectedCrop, setSelectedCrop] = useState<string>('');

    // Fetch crops data from Lambda function
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
                setLoading(false);
    
                // Store idcampo in state and fetch crops data
                fetchCropsData(userId, field.idcampo); 
            } else {
                setError('No field data found');
                setLoading(false);
            }
        } catch (err) {
            setError('Failed to fetch field data');
            setLoading(false);
        }
    };
    

    // Fetch crops data
    // Fetch crops data
    const fetchCropsData = async (userId: string, fieldId: string) => {
        try {
            const response = await axios.post(
                'https://zosi7bcnv4.execute-api.us-east-1.amazonaws.com/get-crop-data/get-crop-data',
                { idcuentas: userId, idcampo: fieldId },
                { headers: { 'Content-Type': 'application/json' } }
            );
    
            console.log("Raw crop data response:", response.data);
            
            // Handle 404 or other status codes that might indicate no crops
            if (response.data.statusCode === 404) {
                console.log("No crops found for this field");
                setCrops([]);
                setError(''); // Clear any previous errors
                setLoading(false);
                return;
            }
            
            const data = response.data.body;
            
            // Handle empty responses
            if (!data || data === '[]' || data === 'null') {
                console.log("No crops data returned from database");
                setCrops([]);
                setError('');
                setLoading(false);
                return;
            }
            
            try {
                const parsedData = JSON.parse(data);
                
                if (Array.isArray(parsedData)) {
                    console.log("Successfully parsed crop data:", parsedData);
                    setCrops(parsedData);
                    setError('');
                } else {
                    console.log("Parsed data is an object, not an array:", parsedData);
                    setCrops([]);
                    setError('');
                }
            } catch (parseErr) {
                console.error("Error parsing crop data:", parseErr, "Raw data:", data);
                setCrops([]);
                setError('');
            }
        } catch (err) {
            console.error('Error fetching crops:', err);
            setCrops([]);
            setError('');
        } finally {
            setLoading(false);
        }
    };
    
    const [selectedCropData, setSelectedCropData] = useState<any>(null);

    // Handler to select a crop
    const handleCropChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const cropId = event.target.value;
        setSelectedCrop(cropId);

        // Find the crop data that matches the selected ID
        if (cropId) {
            const cropData = crops.find(crop => crop.idcrops.toString() === cropId);
            setSelectedCropData(cropData);
        } else {
            setSelectedCropData(null);
        }
    };

    useEffect(() => {
        if (id) {
            setFieldName('Field Name for ID: ' + id);
            setUserName('User Name for ID: ' + id);
            fetchFieldData(id);  // Fetch field data (including idcampo)
        }
    }, [id]);

    useEffect(() => {
        if (id && idcampo) {
            fetchCropsData(id, idcampo); 
        }
    }, [id, idcampo]);

    const handleLogout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        navigate('/');
    };

/*     useEffect(() => {
        if (id) {
            setFieldName('Field Name for ID: ' + id);
            setUserName('User Name for ID: ' + id);
            setLoading(false);
        }
    }, [id]); */

    const handleCultivosClick = () => {
        navigate(`/${id}/crops`);
    };

    const handleCalendarioClick = () => {
        navigate(`/${id}/calendar`);
    };

    const handleReportesClick = () => {
        navigate(`/${id}/reports`);
    };

    const handleCatalogoClick = () => {
        navigate(`/${id}/catalogue`);
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

                {/* Tab Navigation */}
                <div className="flex mb-4">
                    <button
                        className={`p-3 w-1/3 text-center ${activeTab === 'detalles' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
                        onClick={() => setActiveTab('detalles')}
                    >
                        Detalles
                    </button>
                    <button
                        className={`p-3 w-1/3 text-center ${activeTab === 'tratamientos' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
                        onClick={() => setActiveTab('tratamientos')}
                    >
                        Tratamientos
                    </button>
                    <button
                        className={`p-3 w-1/3 text-center ${activeTab === 'insumos' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
                        onClick={() => setActiveTab('insumos')}
                    >
                        Insumos
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'detalles' && (
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Detalles del Cultivo</h3>
                        <div className="mb-4">
                            <label htmlFor="cropSelect" className="block text-lg font-medium">Seleccionar Cultivo</label>
                            <select
                                id="cropSelect"
                                value={selectedCrop}
                                onChange={handleCropChange}
                                className="p-2 border rounded w-full mb-4"
                            >
                                <option value="">Seleccionar un Cultivo</option>
                                {crops && crops.length > 0 ? (
                                    crops.map((crop) => (
                                        <option key={crop.idcrops} value={crop.idcrops}>
                                            {crop.cultivo} - {crop.numero_lote}
                                        </option>
                                    ))
                                ) : (
                                    <option value="">No hay cultivos disponibles para este campo</option>
                                )}
                            </select>

                            {crops.length === 0 && !loading && (
                                <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded text-yellow-700">
                                    No se encontraron cultivos para este campo. Por favor, añada cultivos primero.
                                </div>
                            )}
                        </div>
                        
                        {selectedCropData && (
                            <div className="bg-gray-100 p-4 rounded-lg">
                                <h4 className="text-xl font-bold mb-2">{selectedCropData.cultivo} - Lote {selectedCropData.numero_lote}</h4>
                                
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="font-semibold">Tipo de Semilla:</p>
                                        <p>{selectedCropData.tipo_semilla || 'No especificado'}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Estado:</p>
                                        <p>{selectedCropData.estado}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Fecha de Siembra:</p>
                                        <p>{selectedCropData.fecha_siembra}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Fecha Estimada de Cosecha:</p>
                                        <p>{selectedCropData.fecha_estimada_cosecha !== '0000-00-00' ? selectedCropData.fecha_estimada_cosecha : 'No especificada'}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Fecha de Cosecha:</p>
                                        <p>{selectedCropData.fecha_cosecha !== '0000-00-00' ? selectedCropData.fecha_cosecha : 'Pendiente'}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Cantidad Sembrada:</p>
                                        <p>{selectedCropData.cantidad_siembra > 0 ? `${selectedCropData.cantidad_siembra} ${selectedCropData.unidad_siembra}` : 'No especificada'}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Cantidad Cosechada:</p>
                                        <p>{selectedCropData.cantidad_cosecha > 0 ? `${selectedCropData.cantidad_cosecha} ${selectedCropData.unidad_cosecha}` : 'No especificada'}</p>
                                    </div>
                                </div>
                                
                                {selectedCropData.notas && (
                                    <div className="mb-4">
                                        <p className="font-semibold">Notas:</p>
                                        <p>{selectedCropData.notas}</p>
                                    </div>
                                )}
                                
                                {selectedCropData.imagen && (
                                    <div>
                                        <p className="font-semibold mb-2">Imagen:</p>
                                        <img 
                                            src={selectedCropData.imagen} 
                                            alt={`${selectedCropData.cultivo} - Lote ${selectedCropData.numero_lote}`}
                                            className="w-full max-w-md rounded-lg"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'tratamientos' && (
                    <div>
                        <h3 className="text-xl font-semibold">Tratamientos Tab</h3>
                        <p>Content for the Tratamientos tab goes here.</p>
                    </div>
                )}
                {activeTab === 'insumos' && (
                    <div>
                        <h3 className="text-xl font-semibold">Insumos Tab</h3>
                        <p>Content for the Insumos tab goes here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
