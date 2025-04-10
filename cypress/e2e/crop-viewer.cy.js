describe('Crop Viewer Public Page', () => {
    const baseUrl = 'http://agrotrace360.s3-website-us-east-1.amazonaws.com/public';
  
    it('Displays crop details correctly for valid crop ID', () => {
      cy.visit(`${baseUrl}/crop-viewer.html?id=159`);
  
      cy.contains('AgroTrace360');
      cy.get('#cropTitle').should('exist');
      cy.get('#cultivo').should('not.be.empty');
      cy.get('#estado').should('not.be.empty');
  
      // Optional: check for treatments and availability if you expect them
      cy.contains('Tratamientos Aplicados');
      cy.contains('Disponibilidad');
    });
  
    it('Shows error for missing crop ID', () => {
      cy.visit(`${baseUrl}/crop-viewer.html`);
      cy.contains('Error: No crop ID specified');
    });
  
    it('Shows error for invalid crop ID', () => {
      cy.visit(`${baseUrl}/crop-viewer.html?id=999999`);
      cy.contains('Error: Crop not found or error fetching data');
    });
  });
  