describe('AgroTrace360 - Login and View Crops', () => {
  const baseUrl = 'http://agrotrace360.s3-website-us-east-1.amazonaws.com';

  it('Logs in and navigates to the crops page', () => {
    cy.visit(baseUrl);

    // Open login modal
    cy.contains('Entrar').click();

    // Fill login form inside modal
    cy.get('#username').type('samjones');
    cy.get('#password').type('test');

    // Submit login form
    cy.get('form').contains('Entrar').click();

    // Wait for redirect to overview or crops page
    cy.url().should('include', '/overviewField');

    // Click on "Cultivos" in sidebar
    cy.contains('Cultivos').click();

    // Verify that the crop table loads
    cy.get('table').should('exist');

    // Optionally verify a crop row or fallback message
    cy.get('tbody').then(($tbody) => {
      if ($tbody.find('tr').length > 0) {
        cy.get('tbody tr').should('exist');
      } else {
        cy.contains('No tienes cultivos');
      }
    });
  });
});
