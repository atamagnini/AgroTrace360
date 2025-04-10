describe('Generate and Download Report', () => {
  const baseUrl = 'http://agrotrace360.s3-website-us-east-1.amazonaws.com';
  const username = 'samjones';
  const password = 'test';

  it('Logs in, filters by crop and date, then downloads report', () => {
    cy.visit(baseUrl);

    // Open login modal
    cy.contains('Entrar').click();

    // Fill login form
    cy.get('input#username').type(username);
    cy.get('input#password').type(password);
    cy.get('form').contains('Entrar').click();

    // Wait for redirect
    cy.url().should('include', '/overviewField?idcampo=');

    // Click "Reportes" from sidebar
    cy.contains('Reportes').click();
    cy.url().should('include', '/reports');

    // Ensure report table exists
    cy.get('#report-table', { timeout: 10000 }).should('exist');

    // Select a crop/field from dropdown (assuming dropdown has options)
    cy.get('select#fieldFilter').should('exist').select(1); // Select 2nd option (change if needed)

    // Set date range for siembra
    const startDate = '2023-01-01';
    const endDate = '2024-12-31';

    cy.get('input#startSiembra').clear().type(startDate);
    cy.get('input#endSiembra').clear().type(endDate);
    cy.contains('Filtrar').click();

    // Wait for filtered table to update
    cy.get('#report-table tbody tr').should('have.length.at.least', 1);

    // Click "Descargar"
    cy.contains('Descargar').click();

    
  });
});
