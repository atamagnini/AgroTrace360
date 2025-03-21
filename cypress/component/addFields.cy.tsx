import { mount } from '@cypress/react';
import Campo from '../../src/app/pages/addFields'; // Path to your component
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';

describe('Campo Component', () => {
  const mockUserId = '160';

  beforeEach(() => {
    // Stub axios POST request only once
    cy.stub(axios, 'post').resolves({
      status: 200,
      data: { body: '{"message": "Farm added successfully"}' },
    });

    // Set up the React Router context
    mount(
      <MemoryRouter initialEntries={[`/${mockUserId}/addField`]}>
        <Routes>
          <Route path="/:id/addField" element={<Campo />} />
        </Routes>
      </MemoryRouter>
    );
  });

  it('should submit the form with valid data and make the API call', () => {
    // Fill in the form
    cy.get('input#nombre').type('Test Field');
    cy.get('input#cantidad_ha').type('100');
  
    // Simulate map click to set lat and long
    cy.window().then((win) => {
      const map = win.document.querySelector('div[role="application"]');
      
      if (map) {
        const mockLatLng = { lat: 45.123, lng: -67.123 };
        // Dispatch the click event to set lat and long
        map.dispatchEvent(
          new MouseEvent('click', { bubbles: true, clientX: 100, clientY: 200 })
        );
      } else {
        console.error('Map element not found');
      }
    });
  
    // Directly check if latitud and longitud are correctly set in the state or the component
    // Assuming latitud and longitud are stored in the component's state, and you can get them directly from the window
    cy.window().should('have.property', 'latitud', 45.123);
    cy.window().should('have.property', 'longitud', -67.123);
  
    // Ensure the button is enabled after filling the form and map click
    cy.get('button[type="submit"]').should('not.be.disabled');
  
    // Submit the form
    cy.get('button[type="submit"]').click();
  
    // Assert that the axios POST request was made with the correct data
    cy.get('@axios.post').should('have.been.calledWith', 'https://3vck6sr1aa.execute-api.us-east-1.amazonaws.com/agregar-campo/agregar-campo', {
      nombre: 'Test Field',
      cantidad_ha: '100',
      latitud: 45.123,
      longitud: -67.123,
      idcuentas: mockUserId,
    });
  
    // You can also mock the window alert for success message if needed
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Farm added successfully');
    });
  });
  

  it('should show an error if form validation fails (empty fields)', () => {
    // Try submitting the form with missing data
    cy.get('button[type="submit"]').click();

    // Check for validation error message (this assumes that you have a validation error message in the component)
    cy.get('.error-message').should('contain.text', 'All fields must be filled.');
  });

  it('should show an error if API submission fails', () => {
    // Mock axios POST request to fail
    cy.stub(axios, 'post').rejects(new Error('Error submitting farm data'));

    // Fill in the form
    cy.get('input#nombre').type('Test Field');
    cy.get('input#cantidad_ha').type('100');

    // Simulate map click to set lat and long
    cy.window().then((win) => {
      const map = win.document.querySelector('div[role="application"]');

      if (map) {
        const mockLatLng = { lat: 45.123, lng: -67.123 };
        map.dispatchEvent(
          new MouseEvent('click', { bubbles: true, clientX: 100, clientY: 200 })
        );
      } else {
        console.error('Map element not found');
      }
    });

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Assert that the error message is displayed
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Error submitting farm data');
    });
  });
});
