import { mount } from '@cypress/react';
import Catalogue from '../../src/app/pages/catalogue';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import React from 'react';

describe('Catalogue Component - Frontend Tests', () => {

  const mockUserData = {
    id: '123',
    username: 'testuser',
  };

  beforeEach(() => {
    // Mock the axios POST request for fetching crops data
    cy.stub(axios, 'post').as('axiosPost').resolves({
      status: 200,
      data: { body: JSON.stringify([{ 
        idcrops: '1', 
        cultivo: 'Tomato', 
        descripcion: 'A delicious fruit', 
        numero_lote: '12345', 
        location: 'Farm Location',
        imagen: 'https://example.com/tomato.jpg',
        qr_code_url: 'https://example.com/qrcode.jpg' 
      }]) },
    });

    // Mount the component with React Router
    mount(
      <MemoryRouter initialEntries={['/catalogue/123']}>
        <Routes>
          <Route path="/catalogue/:id" element={<Catalogue />} />
        </Routes>
      </MemoryRouter>
    );
  });

/*   it('should render the catalogue title and user name', () => {
    // Wait for the loading to be false before checking user data
    cy.get('h1').should('contain', 'Catálogo');
    
    // Wait for the user name to render properly
    cy.get('h2').should('contain', 'testuser');
  }); */

  it('should render crops data correctly', () => {
    // Ensure the crop details are displayed correctly
    cy.get('.grid').should('be.visible');
    cy.get('.grid .border').should('have.length', 1); // Assuming 1 crop is rendered
    cy.get('.grid .text-xl').should('contain', 'Tomato');
    cy.get('img').should('have.attr', 'src', 'https://example.com/tomato.jpg');
    cy.get('.mt-2.text-blue-600').should('contain', 'Ver Detalles');
  });

/*   it('should navigate to crop details when "Ver Detalles" is clicked', () => {
    // Ensure clicking on "Ver Detalles" navigates to the correct page
    cy.get('.mt-2.text-blue-600').click();
    
    // Allow some time for the navigation to occur and check if the URL changes
    cy.url().should('include', '/crop-details/');
  }); */

/*   it('should show a message when no crops are available', () => {
    // Modify the mock response to return an empty array
    cy.stub(axios, 'post').as('axiosPost').resolves({
      status: 200,
      data: { body: '[]' },
    });

    // Re-mount the component with the new mock
    mount(
      <MemoryRouter initialEntries={['/catalogue/123']}>
        <Routes>
          <Route path="/catalogue/:id" element={<Catalogue />} />
        </Routes>
      </MemoryRouter>
    );

    // Check if the "No tienes cosechas" message is displayed
    cy.get('h1').should('contain', 'No tienes cosechas');
  }); */

/*   it('should log out successfully', () => {
    // Ensure the logout button is visible
    cy.get('button').contains('Sign Out').should('be.visible');

    // Simulate logout by clicking the logout button
    cy.get('button').contains('Sign Out').click();

    // Assert that the user is logged out and redirected to the homepage
    cy.url().should('include', '/');
  }); */

});
