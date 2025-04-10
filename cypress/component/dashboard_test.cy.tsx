import { mount } from '@cypress/react';
import Dashboard from '../../src/app/pages/dashboard';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import React from 'react';

describe('Dashboard Component - Frontend Tests', () => {

  beforeEach(() => {
    // Stub axios POST requests for fetching various data
    cy.stub(axios, 'post').as('axiosPost').resolves({
      status: 200,
      data: { body: '[{"idcrops": 1, "cultivo": "Tomato", "numero_lote": "12345", "estado": "Germinación", "fecha_cosecha": "2022-06-01", "fecha_siembra": "2022-01-01", "fecha_estado": "2022-01-15"}]' },
    });

    // Mount the component wrapped with MemoryRouter
    mount(
      <MemoryRouter initialEntries={['/dashboard/123']}>
        <Routes>
          <Route path="/dashboard/:id" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    );
  });

/*   it('should render the dashboard title and user name', () => {
    // Verify that the title and user name are displayed correctly
    cy.get('h1').should('contain', 'Dashboard');
    cy.get('h2').should('contain', 'testuser'); // Assuming userName is 'testuser'
  });
 */
/*   it('should display crops data correctly', () => {
    // Verify that the crops table is populated with data
    cy.get('table').should('be.visible');
    cy.get('td').should('contain', 'Tomato');
    cy.get('td').should('contain', '12345');
    cy.get('td').should('contain', 'Germinación');
  }); */

  it('should show production data chart when data is available', () => {
    // Verify that the production data chart is displayed
    cy.get('.recharts-responsive-container').should('be.visible');
    cy.get('.recharts-bar').should('have.length.greaterThan', 0); // Ensure that there are bars in the chart
  });

/*   it('should navigate to the crop details page when "Ver Detalles" is clicked', () => {
    // Simulate clicking on a crop's "Ver Detalles" link and check for navigation
    cy.get('.text-blue-600').click();
    cy.url().should('include', '/dashboard/123/crop-details/1');
  }); */

  it('should show upcoming actions', () => {
    // Verify that upcoming actions are displayed if any
    cy.get('.bg-gray-100').should('contain', 'No hay acciones próximas programadas');
  });

/*   it('should navigate to other pages when sidebar buttons are clicked', () => {
    // Test navigation to various pages from the sidebar
    cy.get('button').contains('Panel de Actividades').click();
    cy.url().should('include', '/dashboard/123');
    
    cy.get('button').contains('Ubicación').click();
    cy.url().should('include', '/123/overviewField?idcampo=');

    cy.get('button').contains('Cultivos').click();
    cy.url().should('include', '/123/crops?idcampo=');
    
    cy.get('button').contains('Catálogo').click();
    cy.url().should('include', '/123/catalogue');
    
    cy.get('button').contains('Reportes').click();
    cy.url().should('include', '/123/reports');
    
    cy.get('button').contains('Calendario').click();
    cy.url().should('include', '/123/calendar');
    
    cy.get('button').contains('Seguimiento').click();
    cy.url().should('include', '/123/tracking');
  }); */

/*   it('should log out successfully', () => {
    // Ensure logout button is visible and clicking logs the user out
    cy.get('button').contains('Sign Out').should('be.visible');
    cy.get('button').contains('Sign Out').click();
    cy.url().should('include', '/'); // Should navigate to the homepage
  }); */

});
