import React, {useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  // State to manage modal visibility
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Function to handle opening the modal
  const openModal = () => {
    setShowModal(true);
  };

  // Function to handle closing the modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Get form data
    const nombre = (document.getElementById('nombre') as HTMLInputElement).value;
    const apellido = (document.getElementById('apellido') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const nombreUsuario = (document.getElementById('nombre_usuario') as HTMLInputElement).value;

    // Prepare data to send to API
    const userData = {
      nombre,
      apellido,
      email,
      nombre_usuario: nombreUsuario,
      contraseña: password,
    };

    try {
      const response = await axios.post(
        'https://93eodw6y34.execute-api.us-east-1.amazonaws.com/new-user/new-user',
        userData, 
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      // Parse the response body
      const responseBody = JSON.parse(response.data.body);
      console.log('Parsed Response Data:', responseBody);

      console.log('Response Data:', response.data);
      console.log('User ID:', response.data.idcuentas);
      
      if (response.status === 200 && responseBody.idcuentas) {
        console.log('User successfully registered');
        console.log('User ID:', responseBody.idcuentas);

        localStorage.setItem('username', nombreUsuario);  // Save username for later use
        localStorage.setItem('userId', responseBody.idcuentas);  // Save user ID (idcuentas)

        closeModal();

        // Redirect to addFields.tsx
        navigate(`/${responseBody.idcuentas}/addFields`);
      } else {
        console.error('Error during registration');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

/*     // Handle form data here
    console.log('Form submitted!');
    closeModal(); */

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Logo section */}
      <div className="flex flex-col items-center mb-12">
        <img
          src="https://resources-agrotrace360.s3.us-east-1.amazonaws.com/logo.png"
          alt="AgroTrace 360 Logo"
          className="mb-4 opacity-80 rounded-full w-60 h-60 object-cover"
        />
        <h1 className="text-3xl font-extrabold text-center text-black mb-6">
          Bienvenido a AgroTrace 360!
        </h1>
      </div>

      {/* Button Section */}
      <div className="flex flex-col space-y-4">
        <button
          className="px-6 py-3 text-white bg-blue-500 rounded-full text-xl hover:bg-blue-600 transition duration-200"
        >
          Entrar
        </button>
        <button
          onClick={openModal}  // Open the modal on button click
          className="px-6 py-3 text-white bg-green-500 rounded-full text-xl hover:bg-green-600 transition duration-200"
        >
          Registrarse
        </button>
      </div>

      {/* Modal Section */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-96 h-13">
            <h2 className="text-2xl font-bold mb-4">Registrarse</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="nombre" className="block mb-2">Nombre:</label>
                <input
                  type="text"
                  id="nombre"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="apellido" className="block mb-2">Apellido:</label>
                <input
                  type="text"
                  id="apellido"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block mb-2">Correo Electrónico:</label>
                <input
                  type="email"
                  id="email"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="nombre_usuario" className="block mb-2">Nombre de usuario:</label>
                <input
                  type="text"
                  id="nombre_usuario"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block mb-2">Contraseña:</label>
                <input
                  type="password"
                  id="password"
                  className="w-full p-2 border rounded"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block mb-2">Reingresar Contraseña:</label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="w-full p-2 border rounded"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600"
              >
                Registrarse
              </button>
            </form>
            <button
              onClick={closeModal}
              className="mt-4 text-gray-500 hover:text-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
