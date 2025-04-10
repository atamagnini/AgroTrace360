import { mount } from '@cypress/react';
import OverviewField from '../../src/app/pages/overviewField';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import React from 'react';

describe('OverviewField Component - Frontend Tests', () => {

  beforeEach(() => {
    // Stub axios POST requests for fetching data
    cy.stub(axios, 'post').as('axiosPost').resolves({
      status: 200,
      data: { 
        body: '[{"idcampo": "1", "nombre": "Field 1", "nombre_usuario": "testuser", "latitud": 40.7128, "longitud": -74.0060}]'
      }
    });

    cy.stub(axios, 'get').as('axiosGet').resolves({
      status: 200,
      data: { 
        main: { temp: 25, humidity: 60 },
        weather: [{ description: 'Clear sky' }],
        wind: { speed: 10 },
        name: 'New York'
      }
    });

    // Mount the component wrapped with MemoryRouter
    mount(
      <MemoryRouter initialEntries={['/overviewField/123?idcampo=1']}>
        <Routes>
          <Route path="/overviewField/:id" element={<OverviewField />} />
        </Routes>
      </MemoryRouter>
    );
  });

/*   it('should render the field name and user name correctly', () => {
    cy.get('h1').should('contain', 'Field 1');
    cy.get('h2').should('contain', 'testuser');
  }); */

/*   it('should display weather data if available', () => {
    cy.get('h2').should('contain', 'New York');
    cy.get('p').should('contain', '25°C');
    cy.get('p').should('contain', 'Clear sky');
    cy.get('p').should('contain', 'Wind: 10 km/h');
    cy.get('p').should('contain', 'Humidity: 60%');
  }); */

/*   it('should render the field location map', () => {
    cy.get('iframe').should('have.attr', 'src').should('include', 'lat=40.7128&lon=-74.0060');
  }); */

/*   it('should navigate to other pages when sidebar buttons are clicked', () => {
    cy.get('button').contains('Panel de Actividades').click();
    cy.url().should('include', '/dashboard/123');
    
    cy.get('button').contains('Ubicación').click();
    cy.url().should('include', '/123/overviewField?idcampo=1');

    cy.get('button').contains('Cultivos').click();
    cy.url().should('include', '/123/crops?idcampo=1');
    
    cy.get('button').contains('Catálogo').click();
    cy.url().should('include', '/123/catalogue');
    
    cy.get('button').contains('Reportes').click();
    cy.url().should('include', '/123/reports');
    
    cy.get('button').contains('Calendario').click();
    cy.url().should('include', '/123/calendar');
    
    cy.get('button').contains('Seguimiento').click();
    cy.url().should('include', '/123/tracking');
  }); */

  it('should allow the user to change the field', () => {
    cy.get('select').select('Field 1');
    cy.get('@axiosPost').should('have.been.calledWith', 
      'https://0ddnllnpb5.execute-api.us-east-1.amazonaws.com/get-first-field/get-first-field');
  });

/*   it('should log out successfully', () => {
    cy.get('button').contains('Sign Out').should('be.visible');
    cy.get('button').contains('Sign Out').click();
    cy.url().should('include', '/'); // Should navigate to the homepage
  }); */

/*   it('should delete the field when delete button is clicked', () => {
    cy.get('button').contains('Eliminar Campo').click();
    cy.get('@axiosPost').should('have.been.calledWith', 
      'https://gu9rxaxf33.execute-api.us-east-1.amazonaws.com/delete-field/delete-field');
  }); */

});
