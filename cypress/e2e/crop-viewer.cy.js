describe('Crop Viewer Public Page', () => {
  const baseUrl = 'http://agrotrace360.s3-website-us-east-1.amazonaws.com/public';

  it('Displays crop details correctly for valid crop ID', () => {
    cy.visit(`${baseUrl}/crop-viewer.html?id=159`);

    // Wait for crop details to load and become visible
    cy.get('#loading').should('not.be.visible');
    cy.get('#cropDetails').should('be.visible');

    // Header title
    cy.contains('AgroTrace360');

    // Main fields
    cy.get('#cropTitle').should('not.be.empty');
    cy.get('#cultivo').should('not.be.empty');
    cy.get('#estado').should('not.be.empty');
    cy.get('#campoNombre').should('not.be.empty');

    // Optional fields (if they exist in DB)
    cy.get('body').then(($body) => {
      if ($body.find('#treatmentsSection h2').length) {
        cy.get('#treatmentsSection h2').should('contain.text', 'Tratamientos Aplicados');
      }
      if ($body.find('#availabilitySection h2').length) {
        cy.get('#availabilitySection h2').should('contain.text', 'Disponibilidad');
      }
    });
  });

  it('Shows error for missing crop ID', () => {
    cy.visit(`${baseUrl}/crop-viewer.html`);
    cy.get('#loading').should('not.be.visible');
    cy.get('#error').should('be.visible').and('contain.text', 'Falta el ID del cultivo');
  });

  it('Shows error for invalid crop ID', () => {
    cy.visit(`${baseUrl}/crop-viewer.html?id=999999`);
    cy.get('#loading').should('not.be.visible');
    cy.get('#error').should('be.visible').and('contain.text', 'Error al obtener datos');
  });
});
