import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Landing from '../../src/app/pages/welcome';
import React from 'react';

describe('Landing Component - Frontend Tests', () => {
    beforeEach(() => {
      // Stub Axios POST requests for registration and login
      cy.stub(axios, 'post').as('axiosPost').resolves({
        status: 200,
        data: {
          body: JSON.stringify({ idcuentas: '123', username: 'testuser' }),
        },
      });
  
      // Mount the Landing component
      cy.mount(<MemoryRouter><Landing /></MemoryRouter>);
    });
  
    it('should open the login modal when "Entrar" button is clicked', () => {
      cy.get('button').contains('Entrar').click();
      cy.get('form').should('exist'); // Check if the login form exists
      cy.get('h2').should('contain', 'Entrar'); // Check the modal title
    });
  
    it('should open the registration modal when "Registrarse" button is clicked', () => {
      cy.get('button').contains('Registrarse').click();
      cy.get('form').should('exist'); // Check if the registration form exists
      cy.get('h2').should('contain', 'Registrarse'); // Check the modal title
    });
  
/*     it('should handle form submission for registration', () => {
      cy.get('button').contains('Registrarse').click();
      cy.get('#nombre').type('Test');
      cy.get('#apellido').type('User');
      cy.get('#email').type('test@example.com');
      cy.get('#nombre_usuario').type('testuser');
      cy.get('#password').type('password123');
      cy.get('#confirmPassword').type('password123');
      cy.get('button[type="submit"]').click();
  
      // Check that the form submission triggers the API call
      cy.get('@axiosPost').should('have.been.calledWith', 'https://93eodw6y34.execute-api.us-east-1.amazonaws.com/new-user/new-user');
  
      // Check if user is redirected to the correct page
      cy.url().should('include', '/123/addFields');
    }); */
  
/*     it('should handle form submission for login', () => {
      cy.get('button').contains('Entrar').click();
      cy.get('#username').type('testuser');
      cy.get('#password').type('password123');
      cy.get('button[type="submit"]').click();
  
      // Check that the form submission triggers the login API call
      cy.get('@axiosPost').should('have.been.calledWith', 'https://lksb5xp9g4.execute-api.us-east-1.amazonaws.com/login/login');
  
      // Check if user is redirected to the correct page after login
      cy.url().should('include', '/123/overviewField?idcampo=1');
    }); */
  
/*     it('should show error if passwords do not match during registration', () => {
      cy.get('button').contains('Registrarse').click();
      cy.get('#password').type('password123');
      cy.get('#confirmPassword').type('differentpassword');
      cy.get('button[type="submit"]').click();
  
      cy.get('.error').should('contain', 'Las contraseñas no coinciden');
    }); */
  
/*     it('should show an alert if login fails', () => {
      cy.stub(window, 'alert').as('alert');
  
      // Simulate a failed login attempt
      cy.get('button').contains('Entrar').click();
      cy.get('#username').type('wronguser');
      cy.get('#password').type('wrongpassword');
      cy.get('button[type="submit"]').click();
  
      // Check if alert is called
      cy.get('@alert').should('have.been.calledWith', 'Invalid username or password');
    }); */
  
    it('should close the registration modal when close button is clicked', () => {
      cy.get('button').contains('Registrarse').click();
      cy.get('button').contains('Cerrar').click();
      cy.get('form').should('not.exist'); // The modal should be closed
    });
  
    it('should close the login modal when close button is clicked', () => {
      cy.get('button').contains('Entrar').click();
      cy.get('button').contains('Cerrar').click();
      cy.get('form').should('not.exist'); // The modal should be closed
    });
  
/*     it('should redirect to the home page after logout', () => {
      cy.get('button').contains('Entrar').click();
      cy.get('#username').type('testuser');
      cy.get('#password').type('password123');
      cy.get('button[type="submit"]').click();
  
      cy.get('@axiosPost').should('have.been.calledWith', 'https://lksb5xp9g4.execute-api.us-east-1.amazonaws.com/login/login');
  
      cy.url().should('include', '/123/overviewField?idcampo=1');
      cy.get('button').contains('Sign Out').click();
      cy.url().should('include', '/');
    }); */
  
/*     it('should show an alert if registration fails due to API error', () => {
      cy.stub(axios, 'post').as('axiosPost').rejects(new Error('API error'));
      
      cy.get('button').contains('Registrarse').click();
      cy.get('#nombre').type('Test');
      cy.get('#apellido').type('User');
      cy.get('#email').type('test@example.com');
      cy.get('#nombre_usuario').type('testuser');
      cy.get('#password').type('password123');
      cy.get('#confirmPassword').type('password123');
      cy.get('button[type="submit"]').click();
  
      cy.get('@axiosPost').should('have.been.called');
      cy.get('.error').should('contain', 'Error during registration');
    }); */
  
  });
  