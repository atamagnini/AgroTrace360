// cypress/integration/addCrop.cy.ts
describe('Add Crop Form - End to End Test', () => {
    const userId = '160';  // Replace with the user ID you're using
    const fieldId = '156';   // Replace with the field ID you're using
  
    beforeEach(() => {
      // Intercept the GET request for the field data
      cy.intercept('POST', 'https://cbv6225k4g.execute-api.us-east-1.amazonaws.com/get-field-data/get-field-data', {
        statusCode: 200,
        body: JSON.stringify([{ idcampo: fieldId, nombre: 'Field Name', nombre_usuario: 'User Name', latitud: 0, longitud: 0 }]),
      }).as('getFieldData');
  
      // Intercept the POST request to add the crop
      cy.intercept('POST', 'https://axzrjq6ya9.execute-api.us-east-1.amazonaws.com/add-crop/add-crop', {
        statusCode: 200,
        body: { message: 'Cultivo added successfully' },
      }).as('addCrop');
  
      // Visit the page (adjust the URL to where the component is rendered in your app)
      cy.visit(`/${userId}/crops`);
    });
  
    it('should display the form when "Agregar cultivo" button is clicked', () => {
      // Ensure the button is visible and click it
      cy.get('button').contains('Agregar cultivo').click();
  
      // Check if the form is displayed
      cy.get('input[name="cultivo"]').should('exist');
      cy.get('input[name="descripcion"]').should('exist');
      cy.get('input[name="numero_lote"]').should('exist');
      cy.get('input[name="tipo_semilla"]').should('exist');
      cy.get('input[name="fecha_siembra"]').should('exist');
      cy.get('input[name="fecha_estimada_cosecha"]').should('exist');
      cy.get('input[name="cantidad_siembra"]').should('exist');
      cy.get('input[name="unidad_siembra"]').should('exist');
      cy.get('input[name="notas"]').should('exist');
      cy.get('input[name="estado"]').should('exist');
      cy.get('input[name="fecha_estado"]').should('exist');
    });
  
    it('should submit the form with valid data and make the API call', () => {
      // Open the form
      cy.get('button').contains('Agregar cultivo').click();
  
      // Fill in the form fields
      cy.get('input[name="cultivo"]').type('Maíz');
      cy.get('input[name="descripcion"]').type('Maíz amarillo');
      cy.get('input[name="numero_lote"]').type('1234');
      cy.get('input[name="tipo_semilla"]').type('Híbrido');
      cy.get('input[name="fecha_siembra"]').type('2025-05-23');
      cy.get('input[name="fecha_estimada_cosecha"]').type('2025-11-01');
      cy.get('input[name="cantidad_siembra"]').type('1000');
      cy.get('input[name="unidad_siembra"]').type('kg');
      cy.get('input[name="notas"]').type('Cultivo en crecimiento');
      cy.get('input[name="estado"]').type('Cosecha');
      cy.get('input[name="fecha_estado"]').type('2025-05-23');
  
      // Submit the form
      cy.get('button').contains('Aceptar').click();
  
      // Assert that the add-crop API was called with the correct payload
      cy.wait('@addCrop').its('request.body').should('deep.equal', {
        cultivo: 'Maíz',
        descripcion: 'Maíz amarillo',
        numero_lote: '1234',
        tipo_semilla: 'Híbrido',
        fecha_siembra: '2025-05-23',
        fecha_estimada_cosecha: '2025-11-01',
        cantidad_siembra: '1000',
        unidad_siembra: 'kg',
        notas: 'Cultivo en crecimiento',
        estado: 'Cosecha',
        fecha_estado: '2025-05-23',
        fecha_cosecha: '',
        cantidad_cosecha: '',
        unidad_cosecha: '',
        imagen: '',
        idcuentas: userId,
        idcampo: fieldId,
      });
  
      // Verify that the response is successfully processed
      cy.get('@addCrop').its('response.body').should('deep.equal', { message: 'Cultivo added successfully' });
  
      // Optionally, verify that the form is cleared after submission and that the success message appears
      cy.get('input[name="cultivo"]').should('have.value', '');
      cy.get('input[name="descripcion"]').should('have.value', '');
      cy.get('input[name="numero_lote"]').should('have.value', '');
      cy.get('input[name="tipo_semilla"]').should('have.value', '');
      cy.get('input[name="fecha_siembra"]').should('have.value', '');
      cy.get('input[name="fecha_estimada_cosecha"]').should('have.value', '');
      cy.get('input[name="cantidad_siembra"]').should('have.value', '');
      cy.get('input[name="unidad_siembra"]').should('have.value', '');
      cy.get('input[name="notas"]').should('have.value', '');
      cy.get('input[name="estado"]').should('have.value', '');
      cy.get('input[name="fecha_estado"]').should('have.value', '');
    });
  });
  