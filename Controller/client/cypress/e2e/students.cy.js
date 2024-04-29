describe('our first E2E test', () => {
  it('test signup flow', () => {
    cy.visit('http://localhost:5173/signup')
    cy.get('#email').type('abc@gmail.com')
    cy.get('#username').type('abc')
    cy.get('#password').type('abcdefghijk')
    //cy.get('button').click('Sign Up')
    //cy.contains('button', 'Sign Up').click();
    cy.get('#someID').click();
    // add a new student
    //cy.get('#name').type('Matt')
    //cy.get('#email').type('Matt@matt.edu')
    //cy.get('#major').type('Music')
    //cy.get('#new').click()
    //cy.get('table').contains('Matt')

  })
  
  /**it('Testing login flow', () => {
    cy.visit('http://localhost:5173/login')
    cy.get('#email').type('neilkapoor11@gmail.com')
    cy.get('#password').type('password123')
    //cy.get('button').click('Sign Up')
    cy.contains('button', 'Log In').click();
    
  
    //cy.get('button').contains('Logout')
    cy.contains('button', 'Logout').click()
  })*/

  
})