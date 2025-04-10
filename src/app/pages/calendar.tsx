/* eslint-disable */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaRegCalendarAlt, FaRegListAlt, FaSearch, FaChartBar, FaFileAlt, FaSignOutAlt, FaUser, FaTrashAlt, FaMapMarkerAlt, FaSeedling, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';

export default function Calendar() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [fieldName, setFieldName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [selectedField, setSelectedField] = useState<string | null>(null);
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
    
    
    // Calendar state
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [events, setEvents] = useState<any[]>([]);
    
    // Handler function to log out
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
                    }
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching field details:', error);
                    setError('Failed to fetch field details');
                    setLoading(false);
                }
            };
    
            fetchFieldDetails();
            
            // Fetch events for this field
            // This is where you'll fetch your events from your API
            // Example:
            /*
            const fetchEvents = async () => {
                try {
                    const response = await axios.post(
                        'your-events-api-endpoint',
                        { idcuentas: id, idcampo: fieldId },
                        { headers: { 'Content-Type': 'application/json' } }
                    );
                    
                    setEvents(response.data);
                } catch (error) {
                    console.error('Error fetching events:', error);
                }
            };
            
            fetchEvents();
            */
        }
    }, [id, location.search]);

    useEffect(() => {
        const fetchEvents = async () => {
            if (selectedField) {
                try {
                    const response = await axios.post(
                        'https://u8ixzl5vj9.execute-api.us-east-1.amazonaws.com/get-dates/get-dates',
                        { idcuentas: id, idcampo: selectedField },
                        { headers: { 'Content-Type': 'application/json' } }
                    );
                    
                    const data = JSON.parse(response.data.body);
                    const formattedEvents: {date: Date, title: string, type: string}[] = [];
                    
                    // Process treatments as "Actividades"
                    if (data) {
                        // Add treatments as "Actividades"
                        data.forEach((item: any) => {
                            if (item.fecha_tratamiento) {
                                formattedEvents.push({
                                    date: new Date(item.fecha_tratamiento),
                                    title: item.nombre_tratamiento || 'Tratamiento',
                                    type: 'activity'
                                });
                            }
                            
                            // Add "Siembras"
                            if (item.fecha_siembra) {
                                formattedEvents.push({
                                    date: new Date(item.fecha_siembra),
                                    title: 'Siembra: ' + (item.cultivo || ''),
                                    type: 'inspection'
                                });
                            }
                            
                            // Add "Cosechas"
                            if (item.fecha_cosecha) {
                                formattedEvents.push({
                                    date: new Date(item.fecha_cosecha),
                                    title: 'Cosecha: ' + (item.cultivo || ''),
                                    type: 'harvest'
                                });
                            }
                        });
                    }
                    
                    setEvents(formattedEvents);
                } catch (error) {
                    console.error('Error fetching events:', error);
                    setEvents([]);
                }
            }
        };
        
        fetchEvents();
    }, [id, selectedField]);

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

    // Calendar navigation functions
    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    // Calendar rendering functions
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const daysInMonth = getDaysInMonth(year, month);
        const firstDayOfMonth = getFirstDayOfMonth(year, month);
        
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        
        // Generate calendar days
        const days = [];
        
        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="h-20 border bg-gray-100"></div>);
        }
        
        // Cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayEvents = events.filter(event => 
                event.date.getDate() === day && 
                event.date.getMonth() === month && 
                event.date.getFullYear() === year
            );
            
            days.push(
                <div key={day} className="h-20 border p-1 relative">
                    <div className="font-bold">{day}</div>
                    {dayEvents.map((event, idx) => (
                        <div 
                            key={idx} 
                            className={`text-xs rounded p-1 mb-1 truncate ${
                                event.type === 'activity' ? 'bg-green-200' : 
                                event.type === 'inspection' ? 'bg-blue-200' : 
                                event.type === 'harvest' ? 'bg-yellow-200' : 'bg-gray-200'
                            }`}
                        >
                            {event.title}
                        </div>
                    ))}
                </div>
            );
        }
        
        return (
            <div className="bg-white rounded-lg shadow">
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="text-xl font-bold">{`${monthNames[month]} ${year}`}</div>
                    <div className="flex space-x-2">
                        <button onClick={prevMonth} className="p-2 rounded hover:bg-gray-200">
                            <FaChevronLeft />
                        </button>
                        <button onClick={nextMonth} className="p-2 rounded hover:bg-gray-200">
                            <FaChevronRight />
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-7">
                    {weekDays.map(day => (
                        <div key={day} className="py-2 text-center font-semibold border-b">
                            {day}
                        </div>
                    ))}
                    {days}
                </div>
            </div>
        );
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
                        className="flex items-center space-x-3 bg-blue-600 p-3 rounded">
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
                
                {/* Calendar Section */}
                <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-4">Calendario de Actividades</h3>
                    
                    {/* Calendar Legend */}
                    <div className="mb-4 flex space-x-4">
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-green-200 rounded mr-2"></div>
                            <span>Actividades</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-blue-200 rounded mr-2"></div>
                            <span>Siembras</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-yellow-200 rounded mr-2"></div>
                            <span>Cosechas</span>
                        </div>
                    </div>
                    
                    {renderCalendar()}
                </div>
            </div>
        </div>
    );
}