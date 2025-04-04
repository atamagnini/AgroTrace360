describe('Add Treatment in Tracking Page', () => {
  const userId = '213';
  const fieldId = '202';

  before(() => {
    // Use the full URL to visit the page with query parameters
    cy.visit(`http://localhost:3000/${userId}/tracking?idcampo=${fieldId}`);
  });

  it('should load the tracking page and select a crop', () => {
    cy.contains('Loading...').should('be.visible'); // Ensure loading state is shown

    cy.get('select#cropSelect')
      .select('1') // Replace with actual crop ID in your test
      .should('have.value', '1');

    cy.contains('Tratamientos').should('be.visible');

    cy.get('button').contains('Agregar Tratamiento').click();

    cy.get('div.bg-white').should('be.visible');
  });

  it('should fill in the treatment form and submit', () => {
    cy.get('div.bg-white').should('be.visible');

    cy.get('input[name="nombre"]').type('Tratamiento de Prueba');
    cy.get('input[name="categoria"]').type('Fertilización');
    cy.get('input[name="subcategoria"]').type('Nitrogenado');
    cy.get('input[name="fecha"]').type('2024-04-01');
    cy.get('input[name="condiciones_climaticas"]').type('Soleado');
    cy.get('input[name="temperatura"]').type('25');
    cy.get('input[name="humedad"]').type('60');
    cy.get('textarea[name="notas"]').type('Tratamiento para mejorar el crecimiento.');

    cy.get('button').contains('Aceptar').click();

    cy.contains('Tratamiento added successfully').should('be.visible');
  });

  it('should display the new treatment in the list of treatments', () => {
    cy.get('table').should('be.visible');

    cy.get('table')
      .contains('Tratamiento de Prueba')
      .should('be.visible');
    cy.get('table')
      .contains('Fertilización')
      .should('be.visible');
    cy.get('table')
      .contains('Nitrogenado')
      .should('be.visible');
    cy.get('table')
      .contains('25')
      .should('be.visible');
  });
});