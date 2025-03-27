import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaRegCalendarAlt, FaRegListAlt, FaSearch, FaChartBar, FaFileAlt, FaSignOutAlt, FaHome, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';

export default function Tracking() {
    const { id, idcampo } = useParams(); 
    console.log("useParams values:", { id, idcampo });
    const navigate = useNavigate();
    const [fieldName, setFieldName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [activeTab, setActiveTab] = useState<string>('detalles');
    const [crops, setCrops] = useState<any[]>([]);
    const [selectedCrop, setSelectedCrop] = useState<string>('');
    const [showForm, setShowForm] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        nombre: '',
        categoria: '',
        subcategoria: '',
        fecha: '',
        condiciones_climaticas: '',
        temperatura: '',
        humedad: '',
        notas: '',
        idcampo: idcampo || '',
        idcrops: selectedCrop || '',
        idcuentas: id || '', 
    });
    const [treatments, setTreatments] = useState<any[]>([]); 
    const [loadingTreatments, setLoadingTreatments] = useState<boolean>(false);
    const [selectedField, setSelectedField] = useState<string | null>(null);
    const [inputs, setInputs] = useState<any[]>([]);
    const [loadingInputs, setLoadingInputs] = useState<boolean>(false);
    const [showInputForm, setShowInputForm] = useState<boolean>(false);
    const [inputFormData, setInputFormData] = useState({
        nombre: '',
        categoria: '',
        subcategoria: '',
        cantidad: '',
        unidad: '',
        proveedor: '',
        idtreatment: '',
        notas: '',
        idcampo: idcampo || '',
        idcrops: selectedCrop || '',
        idcuentas: id || '',
    });

    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString || dateString === "0000-00-00") return "N/A";
        
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return "N/A";
          
          return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        } catch (error) {
          console.error('Error formatting date:', error);
          return "N/A";
        }
    };
    
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
                console.log("Field data:", field); // Log the field data
                setFieldName(field.nombre || 'No field name available');
                setUserName(field.nombre_usuario || 'No user name available');
                
                setFormData(prevData => ({
                    ...prevData,
                    idcampo: field.idcampo
                }));
                
                setLoading(false);
    
                if (field.idcampo) {
                    console.log("Fetching crops with field ID:", field.idcampo);
                    fetchCropsData(userId, field.idcampo);
                } else {
                    console.error("No idcampo found in field data");
                    setError('No field ID found');
                }
            } else {
                setError('No field data found');
                setLoading(false);
            }
        } catch (err) {
            console.error("Error in fetchFieldData:", err);
            setError('Failed to fetch field data');
            setLoading(false);
        }
    };
    
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
    
    const fetchTreatmentData = async (userId: string, fieldId: string, cropId: string) => {
        if (!userId || !fieldId || !cropId) return;
        
        const actualFieldId = idcampo || formData.idcampo;

        if (!actualFieldId) {
            console.error("No field ID available for fetching treatments");
            return;
        }

        setLoadingTreatments(true);
        try {

            console.log("Fetching treatments with params:", {
                idcuentas: userId,
                idcampo: actualFieldId,
                idcrops: cropId
            });

            const response = await axios.post(
                'https://vlu5tfy5tj.execute-api.us-east-1.amazonaws.com/get-treatment-data/get-treatment-data',
                { 
                    idcuentas: userId, 
                    idcampo: fieldId, 
                    idcrops: cropId 
                },
                { headers: { 'Content-Type': 'application/json' } }
            );
    
            console.log("Treatment data response:", response.data);
            
            if (response.data.statusCode === 404) {
                console.log("No treatments found for this crop");
                setTreatments([]);
                return;
            }
            
            const data = response.data.body;
            
            if (!data || data === '[]' || data === 'null') {
                console.log("No treatment data returned from database");
                setTreatments([]);
                return;
            }
            
            try {
                const parsedData = JSON.parse(data);
                
                if (Array.isArray(parsedData)) {
                    console.log("Successfully parsed treatment data:", parsedData);
                    setTreatments(parsedData);
                } else {
                    console.log("Parsed data is an object, not an array:", parsedData);
                    setTreatments([]);
                }
            } catch (parseErr) {
                console.error("Error parsing treatment data:", parseErr);
                setTreatments([]);
            }
        } catch (err) {
            console.error('Error fetching treatments:', err);
            setTreatments([]);
        } finally {
            setLoadingTreatments(false);
        }
    };

    const fetchInputData = async (userId: string, fieldId: string, cropId: string) => {
        if (!userId || !fieldId || !cropId) return;
        
        const actualFieldId = idcampo || formData.idcampo;
    
        if (!actualFieldId) {
            console.error("No field ID available for fetching inputs");
            return;
        }
    
        setLoadingInputs(true);
        try {
            console.log("Fetching inputs with params:", {
                idcuentas: userId,
                idcampo: actualFieldId,
                idcrops: cropId
            });
    
            const response = await axios.post(
                'https://rqddcbx9eb.execute-api.us-east-1.amazonaws.com/get-input-data/get-input-data',
                { 
                    idcuentas: userId, 
                    idcampo: fieldId, 
                    idcrops: cropId 
                },
                { headers: { 'Content-Type': 'application/json' } }
            );
    
            console.log("Input data response:", response.data);
            
            if (response.data.statusCode === 404) {
                console.log("No inputs found for this crop");
                setInputs([]);
                return;
            }
            
            const data = response.data.body;
            
            if (!data || data === '[]' || data === 'null') {
                console.log("No input data returned from database");
                setInputs([]);
                return;
            }
            
            try {
                const parsedData = JSON.parse(data);
                
                if (Array.isArray(parsedData)) {
                    console.log("Successfully parsed input data:", parsedData);
                    setInputs(parsedData);
                } else {
                    console.log("Parsed data is an object, not an array:", parsedData);
                    setInputs([]);
                }
            } catch (parseErr) {
                console.error("Error parsing input data:", parseErr);
                setInputs([]);
            }
        } catch (err) {
            console.error('Error fetching inputs:', err);
            setInputs([]);
        } finally {
            setLoadingInputs(false);
        }
    };

    const fetchAllTreatments = async (userId: string, fieldId: string) => {
        if (!userId || !fieldId) return;
        
        setLoadingTreatments(true);
        try {
            // We'll collect treatments for all crops
            let allTreatments: any[] = [];
            
            // For each crop, fetch its treatments
            for (const crop of crops) {
                try {
                    const response = await axios.post(
                        'https://vlu5tfy5tj.execute-api.us-east-1.amazonaws.com/get-treatment-data/get-treatment-data',
                        { 
                            idcuentas: userId, 
                            idcampo: fieldId, 
                            idcrops: crop.idcrops 
                        },
                        { headers: { 'Content-Type': 'application/json' } }
                    );
                    
                    if (response.data.statusCode !== 404) {
                        const data = response.data.body;
                        
                        if (data && data !== '[]' && data !== 'null') {
                            try {
                                const parsedData = JSON.parse(data);
                                
                                if (Array.isArray(parsedData)) {
                                    // Add crop information to each treatment
                                    const treatmentsWithCropInfo = parsedData.map(treatment => ({
                                        ...treatment,
                                        crop_info: `${crop.cultivo} - Lote ${crop.numero_lote}`
                                    }));
                                    allTreatments = [...allTreatments, ...treatmentsWithCropInfo];
                                }
                            } catch (parseErr) {
                                console.error("Error parsing treatment data:", parseErr);
                            }
                        }
                    }
                } catch (err) {
                    console.error(`Error fetching treatments for crop ${crop.idcrops}:`, err);
                }
            }
            
            setTreatments(allTreatments);
        } catch (err) {
            console.error('Error in fetchAllTreatments:', err);
            setTreatments([]);
        } finally {
            setLoadingTreatments(false);
        }
    };
    
    const fetchAllInputs = async (userId: string, fieldId: string) => {
        if (!userId || !fieldId) return;
        
        setLoadingInputs(true);
        try {
            // We'll collect inputs for all crops
            let allInputs: any[] = [];
            
            // For each crop, fetch its inputs
            for (const crop of crops) {
                try {
                    const response = await axios.post(
                        'https://rqddcbx9eb.execute-api.us-east-1.amazonaws.com/get-input-data/get-input-data',
                        { 
                            idcuentas: userId, 
                            idcampo: fieldId, 
                            idcrops: crop.idcrops 
                        },
                        { headers: { 'Content-Type': 'application/json' } }
                    );
                    
                    if (response.data.statusCode !== 404) {
                        const data = response.data.body;
                        
                        if (data && data !== '[]' && data !== 'null') {
                            try {
                                const parsedData = JSON.parse(data);
                                
                                if (Array.isArray(parsedData)) {
                                    // Add crop information to each input
                                    const inputsWithCropInfo = parsedData.map(input => ({
                                        ...input,
                                        crop_info: `${crop.cultivo} - Lote ${crop.numero_lote}`
                                    }));
                                    allInputs = [...allInputs, ...inputsWithCropInfo];
                                }
                            } catch (parseErr) {
                                console.error("Error parsing input data:", parseErr);
                            }
                        }
                    }
                } catch (err) {
                    console.error(`Error fetching inputs for crop ${crop.idcrops}:`, err);
                }
            }
            
            setInputs(allInputs);
        } catch (err) {
            console.error('Error in fetchAllInputs:', err);
            setInputs([]);
        } finally {
            setLoadingInputs(false);
        }
    };
    
    const [selectedCropData, setSelectedCropData] = useState<any>(null);

    const handleCropChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const cropId = event.target.value;
        setSelectedCrop(cropId);
    
        // Use the route parameter or the existing formData's idcampo
        const effectiveFieldId = idcampo || formData.idcampo;
        const effectiveUserId = id || '';
    
        if (cropId === "all") {
            setSelectedCropData(null);
    
            setFormData(prevData => ({
                ...prevData,
                idcrops: "",
                idcampo: effectiveFieldId
            }));
    
            setInputFormData(prevData => ({
                ...prevData,
                idcrops: "",
                idcampo: effectiveFieldId
            }));
    
            if (effectiveUserId && effectiveFieldId) {
                fetchAllTreatments(effectiveUserId, effectiveFieldId);
                fetchAllInputs(effectiveUserId, effectiveFieldId);
            }
        } else if (cropId) {
            const cropData = crops.find(crop => crop.idcrops.toString() === cropId);
            setSelectedCropData(cropData);
    
            setFormData(prevData => ({
                ...prevData,
                idcrops: cropId,
                idcampo: effectiveFieldId
            }));
    
            setInputFormData(prevData => ({
                ...prevData,
                idcrops: cropId,
                idcampo: effectiveFieldId
            }));
    
            if (effectiveUserId && effectiveFieldId && cropId) {
                console.log("Fetching treatments/inputs with:", {
                    userId: effectiveUserId, 
                    fieldId: effectiveFieldId, 
                    cropId: cropId
                });
    
                // Fetch treatments and inputs after selecting a crop
                fetchTreatmentData(effectiveUserId, effectiveFieldId, cropId);
                fetchInputData(effectiveUserId, effectiveFieldId, cropId);
            } else {
                console.warn("Missing parameters for fetching data", {
                    userId: effectiveUserId, 
                    fieldId: effectiveFieldId, 
                    cropId: cropId
                });
            }
        } else {
            setSelectedCropData(null);
            setTreatments([]);
            setInputs([]);
        }
    };
    
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => {
        const { name, value } = e.target;
        setFormData({
          ...formData,
          [name]: value,
        });
    };    
    
    const handleInputFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setInputFormData({
            ...inputFormData,
            [name]: value,
        });
    };

    // Replace your current handleAgregarInsumoClick function with this:
    const handleAgregarInsumoClick = () => {
        const actualFieldId = idcampo || formData.idcampo;
        
        setInputFormData({
            nombre: '',
            categoria: '',
            subcategoria: '',
            cantidad: '',
            unidad: '',
            proveedor: '',
            idtreatment: '',
            notas: '',
            idcampo: actualFieldId,
            idcrops: selectedCrop || '',
            idcuentas: id || '',
        });
        
        setShowInputForm(true);
    };

    const handleAgregarTratamientoClick = () => {
        setShowForm(true); // Show the form
    };
    
    const handleCancelarClick = () => {
        setFormData({
            nombre: '',
            categoria: '',
            subcategoria: '',
            fecha: '',
            condiciones_climaticas: '',
            temperatura: '',
            humedad: '',
            notas: '',
            idcampo: idcampo || '',
            idcrops: selectedCrop || '',
            idcuentas: id || '',
        });
        setShowForm(false); // Close the form
    };

    const handleCancelarInsumoClick = () => {
        setInputFormData({
            nombre: '',
            categoria: '',
            subcategoria: '',
            cantidad: '',
            unidad: '',
            proveedor: '',
            idtreatment: '',
            notas: '',
            idcampo: idcampo || '',
            idcrops: selectedCrop || '',
            idcuentas: id || '',
        });
        setShowInputForm(false);
    };    

    const handleSubmit = async () => {
        const dataToSubmit = {
            ...formData,
            idcrops: selectedCrop,
        };
    
        console.log("Submitting treatment with data:", dataToSubmit);
    
        try {
            const response = await axios.post(
                'https://l7h23mp0ei.execute-api.us-east-1.amazonaws.com/add-treatment/add-treatment',
                dataToSubmit,
                { headers: { 'Content-Type': 'application/json' } }
            );
    
            if (response.status === 200) {
                alert('Tratamiento added successfully');
                setShowForm(false);
                
                // This is the key part that needs to be fixed
                // Use the actual field ID from formData rather than the route parameter
                if (id && selectedCrop) {
                    const actualFieldId = idcampo || formData.idcampo;
                    fetchTreatmentData(id, actualFieldId, selectedCrop);
                }
            } else {
                alert('Failed to add tratamiento');
            }
        } catch (error) {
            console.error("Error submitting the form:", error);
            alert('Error submitting the form');
        }
    };
    
    const handleSubmitInsumo = async () => {
        const actualFieldId = idcampo || formData.idcampo;

        const dataToSubmit = {
            ...inputFormData,
            idcrops: selectedCrop,
            idcampo: actualFieldId
        };
    
        console.log("Submitting input with data:", dataToSubmit);
    
        try {
            const response = await axios.post(
                'https://2p3lrk98bg.execute-api.us-east-1.amazonaws.com/add-input/add-input',
                dataToSubmit,
                { headers: { 'Content-Type': 'application/json' } }
            );
    
            if (response.status === 200) {
                alert('Insumo added successfully');
                setShowInputForm(false);
                
                if (id && selectedCrop) {
                    const actualFieldId = idcampo || formData.idcampo;
                    fetchInputData(id, actualFieldId, selectedCrop);
                }
            } else {
                alert('Failed to add insumo');
            }
        } catch (error) {
            console.error("Error submitting the form:", error);
            alert('Error submitting the form');
        }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const fieldId = queryParams.get('idcampo');
        
        if (fieldId && id) {
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
    
                        // Update formData with the field data
                        setFormData((prevData) => ({
                            ...prevData,
                            idcampo: field.idcampo || formData.idcampo // Ensure idcampo is updated here
                        }));
    
                        // Fetch crops after field data is fetched
                        fetchCropsData(id, fieldId); 
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
    
      


    useEffect(() => {
        if (id && idcampo) {
            fetchCropsData(id, idcampo); 
        }
    }, [id, idcampo, activeTab]);
   

    const handleLogout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        navigate('/');
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
                                    <option value="all">Todos los Cultivos</option>
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
                            
                            {selectedCrop === "all" && crops.length > 0 ? (
                                <div>
                                    <h4 className="text-xl font-bold mb-4">Resumen de Todos los Cultivos</h4>
                                    {crops.map(crop => (
                                        <div key={crop.idcrops} className="bg-gray-100 p-4 rounded-lg mb-4">
                                            <h4 className="text-xl font-bold mb-2">{crop.cultivo} - Lote {crop.numero_lote}</h4>
                                            
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="font-semibold">Tipo de Semilla:</p>
                                                    <p>{crop.tipo_semilla || 'No especificado'}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">Estado:</p>
                                                    <p>{crop.estado}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">Fecha de Siembra:</p>
                                                    <p>{formatDate(crop.fecha_siembra)}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">Fecha Estimada de Cosecha:</p>
                                                    <p>{crop.fecha_estimada_cosecha !== '0000-00-00' ? formatDate(crop.fecha_estimada_cosecha) : 'No especificada'}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">Fecha de Cosecha:</p>
                                                    <p>{crop.fecha_cosecha !== '0000-00-00' ? formatDate(crop.fecha_cosecha) : 'Pendiente'}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">Cantidad Sembrada:</p>
                                                    <p>{crop.cantidad_siembra > 0 ? `${crop.cantidad_siembra} ${crop.unidad_siembra}` : 'No especificada'}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">Cantidad Cosechada:</p>
                                                    <p>{crop.cantidad_cosecha > 0 ? `${crop.cantidad_cosecha} ${crop.unidad_cosecha}` : 'No especificada'}</p>
                                                </div>
                                            </div>
                                            
                                            {crop.notas && (
                                                <div className="mb-4">
                                                    <p className="font-semibold">Notas:</p>
                                                    <p>{crop.notas}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : selectedCropData && (
                                // Original single crop view remains the same
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
                                            <p>{formatDate(selectedCropData.fecha_siembra)}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold">Fecha Estimada de Cosecha:</p>
                                            <p>{selectedCropData.fecha_estimada_cosecha !== '0000-00-00' ? formatDate(selectedCropData.fecha_estimada_cosecha) : 'No especificada'}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold">Fecha de Cosecha:</p>
                                            <p>{selectedCropData.fecha_cosecha !== '0000-00-00' ? formatDate(selectedCropData.fecha_cosecha) : 'Pendiente'}</p>
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
                        <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-4">Tratamientos</h3>
                            <label htmlFor="cropSelect" className="block text-lg font-medium">Seleccionar Cultivo</label>
                            <select
                                id="cropSelect"
                                value={selectedCrop}
                                onChange={handleCropChange}
                                className="p-2 border rounded w-full mb-4"
                            >
                                <option value="">Seleccionar un Cultivo</option>
                                <option value="all">Todos los Cultivos</option>
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

                            {selectedCrop && (
                                <button
                                    onClick={handleAgregarTratamientoClick}
                                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    Agregar Tratamiento
                                </button>
                            )}
                        </div>
                        
                        {loadingTreatments ? (
                            <div className="text-center py-4">Cargando tratamientos...</div>
                        ) : selectedCrop ? (
                            treatments.length > 0 ? (
                                <div className="mt-4">
                                    <h3 className="text-xl font-semibold mb-4">Tratamientos</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white border border-gray-300">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    {selectedCrop === "all" && <th className="py-2 px-4 border-b text-left">Cultivo</th>}
                                                    <th className="py-2 px-4 border-b text-left">Nombre</th>
                                                    <th className="py-2 px-4 border-b text-left">Categoría</th>
                                                    <th className="py-2 px-4 border-b text-left">Subcategoría</th>
                                                    <th className="py-2 px-4 border-b text-left">Fecha</th>
                                                    <th className="py-2 px-4 border-b text-left">Condiciones</th>
                                                    <th className="py-2 px-4 border-b text-left">Temp.</th>
                                                    <th className="py-2 px-4 border-b text-left">Humedad</th>
                                                    <th className="py-2 px-4 border-b text-left">Notas</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {treatments.map((treatment) => (
                                                    <tr key={treatment.idtreatment} className="hover:bg-gray-50">
                                                        {selectedCrop === "all" && <td className="py-2 px-4 border-b">{treatment.crop_info}</td>}
                                                        <td className="py-2 px-4 border-b">{treatment.nombre}</td>
                                                        <td className="py-2 px-4 border-b">{treatment.categoria}</td>
                                                        <td className="py-2 px-4 border-b">{treatment.subcategoria}</td>
                                                        <td className="py-2 px-4 border-b">{formatDate(treatment.fecha)}</td>
                                                        <td className="py-2 px-4 border-b">{treatment.condiciones_climaticas}</td>
                                                        <td className="py-2 px-4 border-b">{treatment.temperatura}</td>
                                                        <td className="py-2 px-4 border-b">{treatment.humedad}</td>
                                                        <td className="py-2 px-4 border-b">{treatment.notas}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded text-yellow-700">
                                    No se encontraron tratamientos para este cultivo.
                                </div>
                            )
                        ) : null}
                    </div>
                )}
                {showForm && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg w-96">
                            <h2 className="text-2xl font-bold mb-4">Agregar Tratamiento</h2>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                placeholder="Nombre"
                                className="w-full p-2 mb-2 border"
                            />
                            <input
                                type="text"
                                name="categoria"
                                value={formData.categoria}
                                onChange={handleInputChange}
                                placeholder="Categoría"
                                className="w-full p-2 mb-2 border"
                            />
                            <input
                                type="text"
                                name="subcategoria"
                                value={formData.subcategoria}
                                onChange={handleInputChange}
                                placeholder="Subcategoría"
                                className="w-full p-2 mb-2 border"
                            />
                            <input
                                type="date"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleInputChange}
                                className="w-full p-2 mb-2 border"
                            />
                            <input
                                type="text"
                                name="condiciones_climaticas"
                                value={formData.condiciones_climaticas}
                                onChange={handleInputChange}
                                placeholder="Condiciones Climáticas"
                                className="w-full p-2 mb-2 border"
                            />
                            <input
                                type="number"
                                name="temperatura"
                                value={formData.temperatura}
                                onChange={handleInputChange}
                                placeholder="Temperatura"
                                className="w-full p-2 mb-2 border"
                            />
                            <input
                                type="number"
                                name="humedad"
                                value={formData.humedad}
                                onChange={handleInputChange}
                                placeholder="Humedad"
                                className="w-full p-2 mb-2 border"
                            />
                            <textarea
                                name="notas"
                                value={formData.notas}
                                onChange={handleInputChange}
                                placeholder="Notas"
                                className="w-full p-2 mb-2 border"
                            />
                            <div className="flex justify-between">
                                <button onClick={handleCancelarClick} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                                    Cancelar
                                </button>
                                <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                                    Aceptar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'insumos' && (
                    <div>
                        <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-4">Insumos</h3>
                            <label htmlFor="cropSelect" className="block text-lg font-medium">Seleccionar Cultivo</label>
                            <select
                                id="cropSelect"
                                value={selectedCrop}
                                onChange={handleCropChange}
                                className="p-2 border rounded w-full mb-4"
                            >
                                <option value="">Seleccionar un Cultivo</option>
                                <option value="all">Todos los Cultivos</option>
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

                            {selectedCrop && (
                                <button
                                    onClick={handleAgregarInsumoClick}
                                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    Agregar Insumo
                                </button>
                            )}
                        </div>
                        {loadingInputs ? (
                            <div className="text-center py-4">Cargando insumos...</div>
                        ) : selectedCrop ? (
                            inputs.length > 0 ? (
                                <div className="mt-4">
                                    <h3 className="text-xl font-semibold mb-4">Insumos</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white border border-gray-300">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    {selectedCrop === "all" && <th className="py-2 px-4 border-b text-left">Cultivo</th>}
                                                    <th className="py-2 px-4 border-b text-left">Nombre</th>
                                                    <th className="py-2 px-4 border-b text-left">Categoría</th>
                                                    <th className="py-2 px-4 border-b text-left">Subcategoría</th>
                                                    <th className="py-2 px-4 border-b text-left">Cantidad</th>
                                                    <th className="py-2 px-4 border-b text-left">Unidad</th>
                                                    <th className="py-2 px-4 border-b text-left">Proveedor</th>
                                                    <th className="py-2 px-4 border-b text-left">Tratamiento</th>
                                                    <th className="py-2 px-4 border-b text-left">Notas</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {inputs.map((input) => (
                                                    <tr key={input.idinput} className="hover:bg-gray-50">
                                                        {selectedCrop === "all" && <td className="py-2 px-4 border-b">{input.crop_info}</td>}
                                                        <td className="py-2 px-4 border-b">{input.nombre}</td>
                                                        <td className="py-2 px-4 border-b">{input.categoria}</td>
                                                        <td className="py-2 px-4 border-b">{input.subcategoria}</td>
                                                        <td className="py-2 px-4 border-b">{input.cantidad}</td>
                                                        <td className="py-2 px-4 border-b">{input.unidad}</td>
                                                        <td className="py-2 px-4 border-b">{input.proveedor}</td>
                                                        <td className="py-2 px-4 border-b">
                                                            {input.treatment_info ? 
                                                                `${input.treatment_info.split(' - ')[0]} - ${formatDate(input.treatment_info.split(' - ')[1])}` : 
                                                                'No asociado'
                                                            }
                                                        </td>
                                                        <td className="py-2 px-4 border-b">{input.notas}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded text-yellow-700">
                                    No se encontraron insumos para este cultivo.
                                </div>
                            )
                        ) : null}
                    </div>
                )}
                {showInputForm && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg w-96">
                            <h2 className="text-2xl font-bold mb-4">Agregar Insumo</h2>
                            <input
                                type="text"
                                name="nombre"
                                value={inputFormData.nombre}
                                onChange={handleInputFormChange}
                                placeholder="Nombre"
                                className="w-full p-2 mb-2 border"
                            />
                            <input
                                type="text"
                                name="categoria"
                                value={inputFormData.categoria}
                                onChange={handleInputFormChange}
                                placeholder="Categoría"
                                className="w-full p-2 mb-2 border"
                            />
                            <input
                                type="text"
                                name="subcategoria"
                                value={inputFormData.subcategoria}
                                onChange={handleInputFormChange}
                                placeholder="Subcategoría"
                                className="w-full p-2 mb-2 border"
                            />
                            <input
                                type="number"
                                name="cantidad"
                                value={inputFormData.cantidad}
                                onChange={handleInputFormChange}
                                placeholder="Cantidad"
                                className="w-full p-2 mb-2 border"
                            />
                            <input
                                type="text"
                                name="unidad"
                                value={inputFormData.unidad}
                                onChange={handleInputFormChange}
                                placeholder="Unidad"
                                className="w-full p-2 mb-2 border"
                            />
                            <input
                                type="text"
                                name="proveedor"
                                value={inputFormData.proveedor}
                                onChange={handleInputFormChange}
                                placeholder="Proveedor"
                                className="w-full p-2 mb-2 border"
                            />
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Tratamiento Asociado</label>
                                <select
                                    name="idtreatment"
                                    value={inputFormData.idtreatment}
                                    onChange={handleInputFormChange}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="">Seleccionar Tratamiento (opcional)</option>
                                    {treatments.map(treatment => (
                                        <option key={treatment.idtreatment} value={treatment.idtreatment}>
                                            {treatment.nombre} - {formatDate(treatment.fecha)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <textarea
                                name="notas"
                                value={inputFormData.notas}
                                onChange={handleInputFormChange}
                                placeholder="Notas"
                                className="w-full p-2 mb-2 border"
                            />
                            <div className="flex justify-between">
                                <button onClick={handleCancelarInsumoClick} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                                    Cancelar
                                </button>
                                <button onClick={handleSubmitInsumo} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                                    Aceptar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
