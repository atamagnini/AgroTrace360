import React from 'react';

export default function Landing() {
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
          className="px-6 py-3 text-white bg-green-500 rounded-full text-xl hover:bg-green-600 transition duration-200"
        >
          Registrarse
        </button>
      </div>
    </div>
  );
}
