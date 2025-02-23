import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function OverviewField() {
    const { id } = useParams();
    const [fieldName, setFieldName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
  
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
            { idcuentas: userId }, // Send the body with idcuentas
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
            setUserName(field.idcuentas || 'No user name available');
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
  
    if (loading) {
      return <p>Loading...</p>;
    }
  
    if (error) {
      return <p>Error: {error}</p>;
    }
  
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1>{fieldName}</h1>
      </div>
    );
  }