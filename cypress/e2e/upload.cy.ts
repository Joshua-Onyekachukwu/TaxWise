describe('Statement Upload', () => {
  beforeEach(() => {
    cy.login(); // Custom command to log in the user
    cy.visit('/dashboard/uploads/create');
  });

  it('should allow a user to upload a bank statement', () => {
    cy.get('input[type="file"]').attachFile('kuda-statement.pdf');
    cy.get('select').select('My Personal Account');
    cy.get('button').contains('Upload').click();

    cy.contains('Upload successful').should('be.visible');
  });
});
