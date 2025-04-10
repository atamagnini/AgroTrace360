/* eslint-disable */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaRegCalendarAlt, FaRegListAlt, FaSearch, FaChartBar, FaFileAlt, FaSignOutAlt, FaTrashAlt, FaMapMarkerAlt, FaSeedling, FaUser } from 'react-icons/fa';

export default function Crops() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [fieldName, setFieldName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [lat, setLat] = useState<number | null>(null);
    const [lon, setLon] = useState<number | null>(null);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [crops, setCrops] = useState<any[]>([]);
    const [selectedField, setSelectedField] = useState<string | null>(null);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [currentCropId, setCurrentCropId] = useState<string | null>(null);
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

    const toBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
    };
    
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          const base64Image = await toBase64(file);
          
          setFormData({
            ...formData,
            imagen: base64Image,
          });
        } catch (error) {
          console.error("Error converting image to base64:", error);
        }
      }
    };
        
    const handleLogout = () => {
      localStorage.removeItem('username');
      localStorage.removeItem('userId');
      
      navigate('/');
    };

    const [formData, setFormData] = useState({
      cultivo: '',
      customCultivo: '',
      descripcion: '',
      numero_lote: '',
      tipo_semilla: '',
      fecha_siembra: '',
      fecha_estimada_cosecha: '',
      cantidad_siembra: '',
      unidad_siembra: '',
      notas: '',
      estado: '',
      customEstado: '',
      fecha_estado: '',
      fecha_cosecha: '',
      cantidad_cosecha: '',
      unidad_cosecha: '',
      imagen: '',
      idcuentas: id || '',
      idcampo: '',
    });

    const fetchCropsData = async (userId: string, fieldId: string) => {
        try {
          const response = await axios.post(
            'https://zosi7bcnv4.execute-api.us-east-1.amazonaws.com/get-crop-data/get-crop-data',
            { idcuentas: userId, idcampo: fieldId },
            { headers: { 'Content-Type': 'application/json' } }
          );
          const data = JSON.parse(response.data.body);
          if (response.status === 200) {
            setCrops(data);  // Store the crops data in state
          }
        } catch (error) {
          setError('Failed to fetch crops data');
          setCrops([]);
        }
    };
    
    const handleDeleteCrop = async (cropId: string | number) => {
      if (window.confirm('¿Estás seguro de que deseas eliminar este cultivo?')) {
        try {
          const response = await axios.post(
            'https://c7ms0vkkal.execute-api.us-east-1.amazonaws.com/delete-crop/delete-crop',
            { 
              idcuentas: id, 
              idcampo: selectedField || formData.idcampo, 
              idcrops: cropId 
            },
            { headers: { 'Content-Type': 'application/json' } }
          );
    
          if (response.status === 200) {
            alert('Cultivo eliminado exitosamente');
            fetchCropsData(id!, selectedField || formData.idcampo);
          } else {
            alert('Error al eliminar el cultivo');
          }
        } catch (error) {
          console.error('Error deleting crop:', error);
          alert('Error al eliminar el cultivo');
        }
      }
    };
    
    const handleEditCrop = (crop: any) => {
      setCurrentCropId(crop.idcrops);
      setFormData({
        cultivo: crop.cultivo,
        customCultivo: '',
        descripcion: crop.descripcion || '',
        numero_lote: crop.numero_lote || '',
        tipo_semilla: crop.tipo_semilla || '',
        fecha_siembra: crop.fecha_siembra || '',
        fecha_estimada_cosecha: crop.fecha_estimada_cosecha || '',
        cantidad_siembra: crop.cantidad_siembra || '',
        unidad_siembra: crop.unidad_siembra || '',
        notas: crop.notas || '',
        estado: crop.estado || '',
        customEstado: '',
        fecha_estado: crop.fecha_estado || '',
        fecha_cosecha: crop.fecha_cosecha || '',
        cantidad_cosecha: crop.cantidad_cosecha || '',
        unidad_cosecha: crop.unidad_cosecha || '',
        imagen: '', // This won't be used for updates
        idcuentas: id || '',
        idcampo: selectedField || formData.idcampo || '',
      });
      setEditMode(true);
      setShowForm(true);
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
                      setFormData(prevData => ({ ...prevData, idcampo: fieldId }));
                      fetchCropsData(id!, fieldId);
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
        if (id && formData.idcampo) { 
            console.log("Fetching crops data...");
          fetchCropsData(id, formData.idcampo); 
        }
    }, [id, formData.idcampo]);

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
  
    /* const fetchFieldData = async (userId: string) => {
      try {
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
            const field = data[0];
            setFieldName(field.nombre || 'No field name available');
            setUserName(field.nombre_usuario || 'No user name available');
            setLat(field.latitud); 
            setLon(field.longitud);
            
            setFormData((prevFormData) => ({
              ...prevFormData,
              idcampo: field.idcampo,
            }));
            
            setLoading(false);
        } else {
            setError('No field data found.');
            setLoading(false);
        }
      } catch (error) {
        setError('Failed to fetch field data');
        setLoading(false);
      }
    }; */

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData({
          ...formData,
          [name]: value,
      });

      if (name === 'estado' && value !== 'Cosecha') {
          setFormData(prevFormData => ({
          ...prevFormData,
          [name]: value,
          fecha_cosecha: '',
          cantidad_cosecha: '',
          unidad_cosecha: '',
          imagen: '',
          }));
      }
    };

    const handleAgregarCultivoClick = () => {
        setShowForm(true);
    };

    const handleCancelarClick = () => {
      setFormData({
        cultivo: '',
        customCultivo: '',
        descripcion: '',
        numero_lote: '',
        tipo_semilla: '',
        fecha_siembra: '',
        fecha_estimada_cosecha: '',
        cantidad_siembra: '',
        unidad_siembra: '',
        notas: '',
        estado: '',
        customEstado: '',
        fecha_estado: '',
        fecha_cosecha: '',
        cantidad_cosecha: '',
        unidad_cosecha: '',
        imagen: '',
        idcuentas: id || '',
        idcampo: selectedField || formData.idcampo || '',
      });
      setShowForm(false);
      setEditMode(false);
      setCurrentCropId(null);
    };
    
    const formatDateLatinAmerican = (dateString: string | null | undefined): string => {
      if (!dateString || dateString === "0000-00-00") return '';
      
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
    
    const handleSubmit = async () => {
      if (!formData.idcampo && selectedField) {
        setFormData(prev => ({...prev, idcampo: selectedField}));
      }
      try {
        let submitData = { ...formData };
        if (submitData.estado === 'custom' && submitData.customEstado) {
          submitData.estado = submitData.customEstado;
        }

        if (submitData.cultivo === 'custom' && submitData.customCultivo) {
          submitData.cultivo = submitData.customCultivo;
        }

        let imageUrl = "";
        
        if (formData.imagen) {
          const imageUploadResponse = await axios.post(
            'https://wuk3ueg3wk.execute-api.us-east-1.amazonaws.com/upload-image/upload-image',
            {
              base64Image: formData.imagen,
            }
          );

          console.log('Lambda 1 response:', imageUploadResponse.data); 

          if (imageUploadResponse.status === 200) {
            const responseBody = JSON.parse(imageUploadResponse.data.body); 
            imageUrl = responseBody.imageUrl;
          } else {
            alert('Failed to upload image');
            return;
          }
        }

        let response;

        if (editMode && currentCropId) {
          console.log('Updating crop data with ID:', currentCropId);

          const { imagen, ...updateDataWithoutImage } = submitData;

          response = await axios.post(
            'https://j5bvcnob9b.execute-api.us-east-1.amazonaws.com/update-crop/update-crop',
            {
              ...updateDataWithoutImage,
              cropId: currentCropId
            },
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          if (response.status === 200) {
            alert('Cultivo updated successfully');
          } else {
            alert('Failed to update cultivo');
          }
        } else {
          // Create new crop
          console.log('Sending new crop data to Lambda 2:', imageUrl); 
          
          response = await axios.post(
            'https://axzrjq6ya9.execute-api.us-east-1.amazonaws.com/add-crop/add-crop',
            {
              ...submitData, 
              imageUrl: imageUrl, 
            },
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          if (response.status === 200) {
            alert('Cultivo added successfully');
          } else {
            alert('Failed to add cultivo');
          }
        }

        if (response.status === 200) {
          setShowForm(false);
          setEditMode(false);
          setCurrentCropId(null);

          setFormData({
            cultivo: '',
            customCultivo: '',
            descripcion: '',
            numero_lote: '',
            tipo_semilla: '',
            fecha_siembra: '',
            fecha_estimada_cosecha: '',
            cantidad_siembra: '',
            unidad_siembra: '',
            notas: '',
            estado: '',
            customEstado: '',
            fecha_estado: '',
            fecha_cosecha: '',
            cantidad_cosecha: '',
            unidad_cosecha: '',
            imagen: '',
            idcuentas: id || '',
            idcampo: selectedField || formData.idcampo || '',
          });

          if (id && formData.idcampo) {
            fetchCropsData(id, formData.idcampo);
          } else {
            console.error('Missing id or idcampo');
          }
        }
      } catch (error) {
        console.error("Error submitting the form:", error);
        alert('Error submitting the form');
      }
    };          

      
    if (loading) {
      return <p>Loading...</p>;
    }
  
    if (error) {
      return <p>Error: {error}</p>;
    }

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
    
            {/* Add Cultivo Button */}
            <div className="mb-4 flex justify-between">
              <button 
                onClick={handleAgregarCultivoClick}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Agregar cultivo
              </button>
              
            </div>

    
            {/* Form for Agregar Cultivo */}
            {showForm && (
              <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto p-4">
                <div className="bg-white p-6 rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold mb-4">Registro de nuevo cultivo</h2>
    
                  <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold mb-1">Cultivo</label>
                    <select
                      name="cultivo"
                      value={formData.cultivo}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Seleccionar cultivo</option>
                      <option value="Maíz">Maíz</option>
                      <option value="Trigo">Trigo</option>
                      <option value="Arroz">Arroz</option>
                      <option value="Soja">Soja</option>
                      <option value="Papa">Papa</option>
                      <option value="Tomate">Tomate</option>
                      <option value="Frijol">Frijol</option>
                      <option value="Cebada">Cebada</option>
                      <option value="Avena">Avena</option>
                      <option value="Girasol">Girasol</option>
                      <option value="Caña de Azúcar">Caña de Azúcar</option>
                      <option value="Café">Café</option>
                      <option value="Algodón">Algodón</option>
                      <option value="Cacao">Cacao</option>
                      <option value="Cebolla">Cebolla</option>
                      <option value="Zanahoria">Zanahoria</option>
                      <option value="Lechuga">Lechuga</option>
                      <option value="Pepino">Pepino</option>
                      <option value="Calabaza">Calabaza</option>
                      <option value="Pimiento">Pimiento</option>
                      <option value="Ajo">Ajo</option>
                      <option value="Aguacate">Aguacate</option>
                      <option value="Plátano">Plátano</option>
                      <option value="Naranja">Naranja</option>
                      <option value="Limón">Limón</option>
                      <option value="Uva">Uva</option>
                      <option value="custom">Otro cultivo...</option>
                    </select>
                  </div>

                  {formData.cultivo === 'custom' && (
                    <div className="mb-2">
                      <label className="block text-gray-700 text-sm font-bold mb-1">Cultivo personalizado</label>
                      <input
                        type="text"
                        name="customCultivo"
                        placeholder="Ingrese nombre del cultivo"
                        value={formData.customCultivo || ''}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            customCultivo: e.target.value,
                          });
                        }}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  )}

                  <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold mb-1">Descripción</label>
                    <input
                      type="text"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold mb-1">Número de Lote</label>
                    <input
                      type="text"
                      name="numero_lote"
                      value={formData.numero_lote}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold mb-1">Tipo de Semilla</label>
                    <input
                      type="text"
                      name="tipo_semilla"
                      value={formData.tipo_semilla}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold mb-1">Fecha de Siembra</label>
                    <input
                      type="date"
                      name="fecha_siembra"
                      value={formData.fecha_siembra}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold mb-1">Fecha Estimada de Cosecha</label>
                    <input
                      type="date"
                      name="fecha_estimada_cosecha"
                      value={formData.fecha_estimada_cosecha}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="flex space-x-2 mb-2">
                    <div className="w-1/2">
                      <label className="block text-gray-700 text-sm font-bold mb-1">Cantidad de Siembra</label>
                      <input
                        type="number"
                        name="cantidad_siembra"
                        value={formData.cantidad_siembra}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-gray-700 text-sm font-bold mb-1">Unidad de Siembra</label>
                      <select
                        name="unidad_siembra"
                        value={formData.unidad_siembra}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Seleccionar unidad</option>
                        <option value="kg">kg</option>
                        <option value="g">grs</option>
                        <option value="t">ton</option>
                        <option value="lb">lbs</option>
                        <option value="bolsas">bolsas</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold mb-1">Notas</label>
                    <input
                      type="text"
                      name="notas"
                      value={formData.notas}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="flex space-x-2 mb-2">
                  <div className="w-1/2">
                    <label className="block text-gray-700 text-sm font-bold mb-1">Etapa</label>
                    <div className="relative">
                      <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded appearance-none"
                      >
                        <option value="">Seleccionar etapa</option>
                        <option value="Germinación">Germinación</option>
                        <option value="Vegetativa">Vegetativa</option>
                        <option value="Floración">Floración</option>
                        <option value="Cosecha">Cosecha</option>
                        <option value="custom">Otra etapa...</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {formData.estado === 'custom' && (
                    <div className="w-full mt-2">
                      <label className="block text-gray-700 text-sm font-bold mb-1">Etapa personalizada</label>
                      <input
                        type="text"
                        name="customEstado"
                        placeholder="Ingrese etapa personalizada"
                        value={formData.customEstado || ''}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            customEstado: e.target.value,
                          });
                        }}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  )}
                    <div className="w-1/2">
                      <label className="block text-gray-700 text-sm font-bold mb-1">Fecha de Registro</label>
                      <input
                        type="date"
                        name="fecha_estado"
                        value={formData.fecha_estado}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>

                  {/* Conditionally render the "Cosecha" related fields */}
                  {formData.estado === 'Cosecha' && (
                    <>
                      <div className="mb-2">
                        <label className="block text-gray-700 text-sm font-bold mb-1">Fecha de Cosecha</label>
                        <input
                          type="date"
                          name="fecha_cosecha"
                          value={formData.fecha_cosecha}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      
                      <div className="flex space-x-2 mb-2">
                        <div className="w-1/2">
                          <label className="block text-gray-700 text-sm font-bold mb-1">Cantidad de Cosecha</label>
                          <input
                            type="number"
                            name="cantidad_cosecha"
                            value={formData.cantidad_cosecha}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div className="w-1/2">
                          <label className="block text-gray-700 text-sm font-bold mb-1">Unidad de Cosecha</label>
                          <select
                            name="unidad_cosecha"
                            value={formData.unidad_cosecha}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                          >
                            <option value="">Seleccionar unidad</option>
                            <option value="kg">kg</option>
                            <option value="g">grs</option>
                            <option value="t">ton</option>
                            <option value="lb">lb</option>
                            <option value="bolsas">bolsas</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* Only show image upload in create mode, not edit mode */}
                      {!editMode && (
                        <div className="mb-2">
                          <label className="block text-gray-700 text-sm font-bold mb-1">Imagen</label>
                          <input
                            type="file"
                            name="imagen"
                            onChange={handleImageUpload}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      )}
                    </>
                  )}
    
                  <div className="flex justify-between">
                    <button
                      onClick={handleCancelarClick}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Aceptar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Link to go to "Ir a Detalles" aligned to the right */}
            <div className="mb-4 flex justify-end">
              <span 
                onClick={() => navigate(`/${id}/tracking?idcampo=${selectedField}`)}
                className="text-blue-500 cursor-pointer hover:underline"
              >
                Ir a Detalles
              </span>
            </div>

            {/* Table for crops */}
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse border border-gray-800">
                <thead className="bg-gray-800 text-white">
                  <tr>
                  <th className="px-6 py-3 text-left">Cultivo y Lote</th>
                    <th className="px-6 py-3 text-left">Etapa</th>
                    <th className="px-6 py-3 text-left">Fecha de siembra</th>
                    <th className="px-6 py-3 text-left">Fecha de cosecha</th>
                    <th className="px-6 py-3 text-left">Cantidad cosechada</th>
                    <th className="px-6 py-3 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(crops) && crops.length > 0 ? (
                    crops.map((crop) => (
                      <tr key={crop.idcrops}>
                        <td className="px-6 py-4 border-t border-gray-200">
                          {crop.cultivo} - Lote {crop.numero_lote}
                        </td>
                        <td className="px-6 py-4 border-t border-gray-200">{crop.estado}</td>
                        <td className="px-6 py-4 border-t border-gray-200">{formatDateLatinAmerican(crop.fecha_siembra)}</td>
                        <td className="px-6 py-4 border-t border-gray-200">{formatDateLatinAmerican(crop.fecha_cosecha)}</td>
                        <td className="px-6 py-4 border-t border-gray-200">
                          {crop.cantidad_cosecha ? `${crop.cantidad_cosecha} ${crop.unidad_cosecha || ''}` : ''}
                        </td>
                        <td className="px-6 py-4 border-t border-gray-200 flex space-x-2">
                        <button 
                          onClick={() => handleEditCrop(crop)}
                          className="p-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                          <button 
                            onClick={() => handleDeleteCrop(crop.idcrops)}
                            className="p-1 rounded bg-red-500 text-white hover:bg-red-600"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center">
                        No tienes cultivos
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          </div>
        </div>
      );
  }