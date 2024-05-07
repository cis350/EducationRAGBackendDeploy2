describe('our first E2E test', () => {
  it('test signup flow', () => {
    //cy.visit('http://localhost:3001/signup')
    cy.visit('https://education-rag-6f6c688e8b93.herokuapp.com/signup')
    //cy.get('#email').type('abcde@gmail.com')
    //cy.get('#username').type('abc')
    //cy.get('#password').type('abcdefghijk')

    cy.get('#email').type('neilkapoor11@gmail.com')
    cy.get('#username').type('nk')
    cy.get('#password').type('password123')

    //cy.get('button').click('Sign Up')
    //cy.contains('button', 'Sign Up').click();
    cy.get('#signup').click();
    // add a new student
    //cy.get('#name').type('Matt')
    //cy.get('#email').type('Matt@matt.edu')
    //cy.get('#major').type('Music')
    //cy.get('#new').click()
    //cy.get('table').contains('Matt')

  })
  
  it('Testing login flow', () => {
    //cy.visit('http://localhost:3001/login')
    cy.visit('https://education-rag-6f6c688e8b93.herokuapp.com/login')
    //cy.get('#email').type('abcde@gmail.com')
    //cy.get('#password').type('abcdefghijk')
    
    cy.get('#email').type('neilkapoor11@gmail.com')
    cy.get('#password').type('password123')
    cy.contains('button', 'Log In').click();
    
    cy.contains('button', 'Settings').click()
    cy.contains('button', 'Go to FAQ').click()
    cy.contains('button', 'Back to Chat').click()
    cy.contains('button', 'New Chat').click()
    cy.contains('button', 'Cancel').click()
    cy.contains('button', 'Logout').click()
    //cy.get('button').contains('Logout')
    //cy.contains('button', 'Logout').click()
  })

  it('Testing chat', () => {
    //cy.visit('http://localhost:3001/login')
    cy.visit('https://education-rag-6f6c688e8b93.herokuapp.com/login')
    //cy.get('#email').type('abcde@gmail.com')
    //cy.get('#password').type('abcdefghijk')
    
    cy.get('#email').type('neilkapoor11@gmail.com')
    cy.get('#password').type('password123')
    cy.contains('button', 'Log In').click();
    
    cy.contains('button', 'Settings').click()
    cy.contains('button', 'Go to FAQ').click()
    cy.contains('button', 'Back to Chat').click()
    cy.contains('button', 'New Chat').click()
    cy.get('input[type="text"]').type('chat2')
    cy.contains('button', 'Confirm').click()

    cy.contains('button', 'chat2').click()

    cy.get('input[type="text"]').type('Can you help me with CIS 121?')
    cy.contains('button', 'Send').click()

    cy.get('input[type="text"]').type('What is a trie?')
    cy.contains('button', 'Send').click()

    cy.contains('button', 'Go to FAQ').click()
    cy.contains('button', 'Back to Chat').click()
    cy.contains('button', 'chat2').click()

    cy.contains('button', 'X').click()
    cy.contains('button', 'Logout').click()
  })

  
})