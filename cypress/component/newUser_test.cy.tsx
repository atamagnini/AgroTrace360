import { mount } from '@cypress/react';
import Landing from '../../src/app/pages/welcome';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';

describe('Landing Component - User Registration', () => {
  const mockUserData = {
    nombre: 'Test Name',
    apellido: 'Test LastName',
    email: 'test@example.com',
    nombre_usuario: 'testuser',
    password: 'password123',
    confirmPassword: 'password123',
  };

  beforeEach(() => {
    // Stub axios POST request and alias it
    cy.stub(axios, 'post').as('axiosPost').resolves({
      status: 200,
      data: { body: '{"idcuentas": "160"}' }, // Adjust according to your API response
    });

    // Mount the component once before each test
    mount(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Landing />} />
        </Routes>
      </MemoryRouter>
    );
  });

  it('should successfully register a new user', () => {
    // Open the registration modal
    cy.get('button').contains('Registrarse').click();

    // Fill in the registration form
    cy.get('input#nombre').type(mockUserData.nombre);
    cy.get('input#apellido').type(mockUserData.apellido);
    cy.get('input#email').type(mockUserData.email);
    cy.get('input#nombre_usuario').type(mockUserData.nombre_usuario);
    cy.get('input#password').type(mockUserData.password);
    cy.get('input#confirmPassword').type(mockUserData.confirmPassword);

    // Ensure the submit button is enabled
    cy.get('button[type="submit"]').should('not.be.disabled');

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Assert that the axios POST request was made with the correct data
    cy.get('@axiosPost').should('have.been.calledWith', 'https://93eodw6y34.execute-api.us-east-1.amazonaws.com/new-user/new-user', {
      nombre: mockUserData.nombre,
      apellido: mockUserData.apellido,
      email: mockUserData.email,
      nombre_usuario: mockUserData.nombre_usuario,
      contraseña: mockUserData.password,
    });
  });

  it('should show an error if passwords do not match', () => {
    // Open the registration modal
    cy.get('button').contains('Registrarse').click();

    // Fill in the registration form with mismatched passwords
    cy.get('input#nombre').type(mockUserData.nombre);
    cy.get('input#apellido').type(mockUserData.apellido);
    cy.get('input#email').type(mockUserData.email);
    cy.get('input#nombre_usuario').type(mockUserData.nombre_usuario);
    cy.get('input#password').type('password123');
    cy.get('input#confirmPassword').type('differentpassword');

    // Try to submit the form
    cy.get('button[type="submit"]').click();

    // Assert that the alert for password mismatch is shown
    cy.on('window:alert', (alertText) => {
      expect(alertText).to.equal('Las contraseñas no coinciden');
    });
  });

});
