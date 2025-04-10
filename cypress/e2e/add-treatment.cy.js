describe('Add Treatment to Second Crop', () => {
    const baseUrl = 'http://agrotrace360.s3-website-us-east-1.amazonaws.com';
    const username = 'samjones';
    const password = 'test';
  
    it('Logs in and adds a treatment to the second crop', () => {
      cy.visit(baseUrl);
      cy.contains('Entrar').click();
      cy.get('input#username').type(username);
      cy.get('input#password').type(password);
      cy.get('form').contains('Entrar').click();
  
      cy.url().should('include', '/overviewField?idcampo=');
  
      cy.contains('Seguimiento').click();
      cy.url().should('include', '/tracking?idcampo=');
      cy.contains('Tratamientos').click();
  
      // Wait until at least 3 crop options are available (including placeholder)
      cy.get('select#cropSelect')
        .should('exist')
        .find('option')
        .should($options => {
          const validOptions = [...$options].filter(o => o.value && o.value !== 'all');
          expect(validOptions.length).to.be.gte(2); // Ensure at least 2 real crop options
        });
  
      // Select the second real crop (index 1 in valid list)
      cy.get('select#cropSelect')
        .then($select => {
          const options = [...$select[0].options].filter(o => o.value && o.value !== 'all');
          const secondCropValue = options[1].value;
          cy.wrap($select).select(secondCropValue);
        });
  
      cy.contains('Agregar Tratamiento', { timeout: 8000 }).should('be.visible').click();
  
      cy.get('input[name="nombre"]').type('Riego profundo');
      cy.get('select[name="categoria"]').select('Riego');
      cy.get('select[name="subcategoria"]').select('Riego por goteo');
      cy.get('input[name="fecha"]').type(new Date().toISOString().split('T')[0]);
      cy.get('input[name="condiciones_climaticas"]').type('Soleado');
      cy.get('input[name="temperatura"]').type('27');
      cy.get('input[name="humedad"]').type('60');
      cy.get('textarea[name="notas"]').type('Tratamiento agregado automáticamente.');
  
      cy.contains('Aceptar').click();
  
      // Assert treatment is added
      cy.contains('Riego profundo', { timeout: 6000 }).should('exist');
    });
  });
  