describe('Upload and Transaction History', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/dashboard/uploads');
  });

  it('should display the newly uploaded statement in the history', () => {
    cy.contains('kuda-statement.pdf').should('be.visible');
  });

  it('should display the new transactions on the dashboard', () => {
    cy.visit('/dashboard');
    cy.contains('Netflix Subscription').should('be.visible');
  });
});
