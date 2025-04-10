import { mount } from '@cypress/react';
import CropDetails from '../../src/app/pages/crop-details';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import React from 'react';

describe('CropDetails Component - Frontend Tests', () => {

  const mockUserData = {
    id: '123',
    username: 'testuser',
  };

  const mockCropData = {
    idcrops: '1',
    cultivo: 'Tomato',
    descripcion: 'A delicious fruit',
    numero_lote: '12345',
    fecha_cosecha: '2023-08-15',
    campo_nombre: 'Farm Location',
    treatments: JSON.stringify([
      { idtreatment: '1', nombre: 'Pesticide', fecha: '2023-08-01' }
    ]),
    availability_info: JSON.stringify([
      { name: 'Warehouse 1', address: 'Farm Location 1' }
    ]),
    imagen: 'https://example.com/tomato.jpg',
    qr_code_url: 'https://example.com/qrcode.jpg'
  };

  beforeEach(() => {
    // Mock the axios POST request for fetching crop details
    cy.stub(axios, 'post').as('axiosPost').resolves({
      status: 200,
      data: { body: JSON.stringify(mockCropData) },
    });

    // Mount the component with React Router
    mount(
      <MemoryRouter initialEntries={['/crop-details/1/123']}>
        <Routes>
          <Route path="/crop-details/:cropId/:id" element={<CropDetails />} />
        </Routes>
      </MemoryRouter>
    );
  });

/*   it('should render the crop details correctly', () => {
    // Wait for the crop details to load and check the crop name, description, and lot number
    cy.get('h1').should('contain', 'Tomato');
    cy.get('p').contains('A delicious fruit');
    cy.get('p').contains('Número de Lote: 12345');
    cy.get('p').contains('Fecha de Cosecha: 15/08/2023');
    cy.get('p').contains('Ubicación: Farm Location');
  }); */

  it('should render the crop image correctly', () => {
    // Ensure the crop image is displayed
    cy.get('img').should('have.attr', 'src', 'https://example.com/tomato.jpg');
  });

/*   it('should render QR code when available', () => {
    // Ensure the QR code is displayed if the URL is valid
    cy.get('img').should('have.attr', 'src', 'https://example.com/qrcode.jpg');
  }); */

  it('should show the availability modal when "Agregar Disponibilidad" is clicked', () => {
    // Click the "Agregar Disponibilidad" button
    cy.get('button').contains('Agregar Disponibilidad').click();
    
    // Check if the modal is visible
    cy.get('.fixed').should('be.visible');
  });

/*   it('should close the availability modal when "Cancelar" is clicked', () => {
    // Open the modal by clicking the "Agregar Disponibilidad" button
    cy.get('button').contains('Agregar Disponibilidad').click();
    
    // Close the modal by clicking the "Cancelar" button
    cy.get('button').contains('Cancelar').click();
    
    // Check if the modal is no longer visible
    cy.get('.fixed').should('not.exist');
  });
 */
/*   it('should navigate to the previous page when "Atrás" button is clicked', () => {
    // Simulate clicking the "Atrás" button
    cy.get('button').contains('Atrás').click();

    // Check if the URL includes the catalogue page path
    cy.url().should('include', '/catalogue');
  }); */

  /* it('should handle error loading crop details', () => {
    // Stub the axios post request to simulate an error
    cy.stub(axios, 'post').as('axiosPost').rejects({
      response: { status: 500, data: 'Error loading crop details' }
    });

    // Mount the component again
    mount(
      <MemoryRouter initialEntries={['/crop-details/1/123']}>
        <Routes>
          <Route path="/crop-details/:cropId/:id" element={<CropDetails />} />
        </Routes>
      </MemoryRouter>
    );

    // Check if the error message is displayed
    cy.get('div').contains('Error fetching crop details');
  }); */
});
