describe('Register New User', () => {
    const baseUrl = 'http://agrotrace360.s3-website-us-east-1.amazonaws.com';
  
    it('Registers a new user and navigates to addFields page', () => {
      const randomSuffix = Date.now(); // avoids duplicates
      const nombre = `TestNombre${randomSuffix}`;
      const apellido = `TestApellido${randomSuffix}`;
      const email = `testuser${randomSuffix}@example.com`;
      const username = `testuser${randomSuffix}`;
      const password = 'Password123!';
  
      // Visit landing page
      cy.visit(baseUrl);
  
      // Open registration modal
      cy.contains('Registrarse').click();
  
      // Fill registration form
      cy.get('input#nombre').type(nombre);
      cy.get('input#apellido').type(apellido);
      cy.get('input#email').type(email);
      cy.get('input#nombre_usuario').type(username);
      cy.get('input#password').type(password);
      cy.get('input#confirmPassword').type(password);
  
      // Submit form (button may be overlapped — force the click)
      cy.get('form button[type="submit"]').click({ force: true });
  
      // Validate redirect to addFields page
      cy.url({ timeout: 15000 }).should('include', '/addFields');
    });
  });
  