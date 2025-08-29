describe(`Test case for ${Cypress.spec["fileName"]}`, () => {
  let baseUrl = Cypress.env("url")

  beforeEach(() => {
    cy.visit(`${baseUrl}/login`, { 'failOnStatusCode': false })
    cy.intercept("**/auth/login").as("loginApi")
    cy.get("input[name='email']").as("email")
    cy.get("input[name='password']").as("password")
  })

  it(`Pass invalid email`, () => {
    cy.get("form").within(() => {
      cy.get("@email").type("abc.xyzgmail.com")
      cy.get('.MuiFormHelperText-root').should("contain", "Please provide proper username")
      cy.get("@password").type(Cypress.env("password"))
      cy.root().submit()
    })
    cy.get('.MuiSnackbarContent-message').should("contain", "Please enter a valid email.")
  });

  it(`Pass wrong email`, () => {
    cy.get("form").within(() => {
      cy.get("@email").type("abc@xyx.com")
      cy.get("@password").type(Cypress.env("password"))
      cy.root().submit()
    })
    cy.get('.MuiSnackbarContent-message').should("contain", "user not found.")
  });

  it(`Pass invalid password`, () => {
    cy.get("form").within(() => {
      cy.get("@email").type(Cypress.env("email"))
      cy.get("@password").type(132134344)
      cy.root().submit()
    })
    cy.get('.MuiSnackbarContent-message').should("contain", "Invalid username or password.")
  });

  it(`Pass wrong password`, () => {
    cy.get("form").within(() => {
      cy.get("@email").type(Cypress.env("email"))
      cy.get("@password").type("AAsdf1234")
      cy.root().submit()
    })
    cy.get('.MuiSnackbarContent-message').should("contain", "Invalid username or password.")
  });

  it(`Pass the valid email in upper-case`, () => {
    let email = Cypress.env("email").toUpperCase()
    cy.get("form").within(() => {
      cy.get("@email").type(email)
      cy.get("@password").type(Cypress.env("password"))
      cy.root().submit()
    })
    cy.wait("@loginApi").then(({ response }) => {

      if (response.body.result === "session_exists") {
          cy.get('[role="presentation"] .MuiDialog-container .MuiPaper-root button').contains("Ok").click()
      }
  })
    cy.get('[aria-label="User Profile"] > .MuiButtonBase-root').click()
    cy.get('.MuiPaper-root .MuiTypography-root').contains("Sign out").click()
  });
});