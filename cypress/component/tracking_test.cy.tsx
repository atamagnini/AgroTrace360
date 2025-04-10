import React from 'react';
import { mount } from '@cypress/react';
import Tracking from '../../src/app/pages/tracking';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

describe('Tracking Component - Form and Tab Navigation', () => {

  const mockCropsData = [
    { idcrops: 1, cultivo: 'Tomato', numero_lote: 'Lot 1' },
    { idcrops: 2, cultivo: 'Lettuce', numero_lote: 'Lot 2' },
  ];

  beforeEach(() => {
    // Stub the axios requests that would typically fetch data and replace them with mock data
    cy.intercept('POST', '**/get-crop-data/get-crop-data', {
      statusCode: 200,
      body: JSON.stringify(mockCropsData),
    }).as('getCrops');

    // Mount the component with React Router
    mount(
      <MemoryRouter initialEntries={['/tracking/1/123']}>
        <Routes>
          <Route path="/tracking/:id/:idcampo" element={<Tracking />} />
        </Routes>
      </MemoryRouter>
    );
  });

/*   it('should populate crop dropdown and allow selecting a crop', () => {
    // Wait for crops data to be loaded
    cy.wait('@getCrops'); 
    
    cy.get('select#cropSelect').should('have.length', 1);
    cy.get('select#cropSelect').find('option').should('have.length', 3);  // Ensure there are 3 options
    
    // Ensure the dropdown has the correct options and select the first one
    cy.get('select#cropSelect').select('1').should('have.value', '1');
}); */


  it('should show tab content for "Detalles" when clicked', () => {
    // Click the "Detalles" tab
    cy.get('button').contains('Detalles').click();

    // Ensure that the "Detalles" tab content is displayed
    cy.get('h3').contains('Detalles del Cultivo').should('exist');
  });

  it('should show tab content for "Tratamientos" when clicked', () => {
    // Click the "Tratamientos" tab
    cy.get('button').contains('Tratamientos').click();

    // Ensure that the "Tratamientos" tab content is displayed
    cy.get('h3').contains('Tratamientos').should('exist');
  });

  it('should show tab content for "Insumos" when clicked', () => {
    // Click the "Insumos" tab
    cy.get('button').contains('Insumos').click();

    // Ensure that the "Insumos" tab content is displayed
    cy.get('h3').contains('Insumos').should('exist');
  });

/*   it('should handle form input change and show the updated value', () => {
    // Wait for the crops to be loaded
    cy.wait('@getCrops');

    // Open the "Agregar Tratamiento" form
    cy.get('button').contains('Agregar Tratamiento').should('be.visible').click();

    // Fill in the form fields
    cy.get('input[name="nombre"]').type('Test Treatment');
    cy.get('input[name="categoria"]').type('Fertilizer');
    cy.get('input[name="subcategoria"]').type('Organic');
    cy.get('input[name="fecha"]').type('2023-12-01');
    cy.get('input[name="condiciones_climaticas"]').type('Sunny');
    cy.get('input[name="temperatura"]').type('25');
    cy.get('input[name="humedad"]').type('60');
    cy.get('textarea[name="notas"]').type('Test notes for treatment');

    cy.get('input[name="nombre"]').should('have.value', 'Test Treatment');
    cy.get('input[name="categoria"]').should('have.value', 'Fertilizer');
    cy.get('input[name="subcategoria"]').should('have.value', 'Organic');
    cy.get('input[name="fecha"]').should('have.value', '2023-12-01');
    cy.get('input[name="condiciones_climaticas"]').should('have.value', 'Sunny');
    cy.get('input[name="temperatura"]').should('have.value', '25');
    cy.get('input[name="humedad"]').should('have.value', '60');
    cy.get('textarea[name="notas"]').should('have.value', 'Test notes for treatment');
}); */


/* it('should show and close the form when Cancel button is clicked', () => {
    // Wait for crops data to be loaded
    cy.wait('@getCrops');
    
    // Open the form
    cy.get('button').contains('Agregar Tratamiento').should('be.visible').click();
    
    // Verify that the form is visible
    cy.get('input[name="nombre"]').should('be.visible');
    
    // Close the form by clicking 'Cancelar'
    cy.get('button').contains('Cancelar').click();
    
    // Verify that the form is closed
    cy.get('input[name="nombre"]').should('not.be.visible');
}); */


});
