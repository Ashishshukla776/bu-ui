const { cyGet } = require('../../../helpers/global');
const messages = require('../../../helpers/messages');
const lead = require('../../../selector/lead')

describe(`Add User functionality test`, () => {
  const randomString = Math.random().toString(36).substring(2, 11);
  const uniqueEmail = `testuser${randomString}@example.com`;
  let templateLabel;

  beforeEach(() => {
    cy.intercept('GET', '**/crew/users/exists?*').as("userExist")
    cy.intercept('GET', '**/grd/templates*').as("getTemplate")
    cy.visit(`${Cypress.env("url")}/add-user`)
    cy.wait(1000);
  })

  it('Test with a valid unique Valid email', () => {
    cyGet('[data-testid="myprofile-box-prv1u2ywt"] * [data-testid="myprofile-typography-p9fmi6dyy"]').should("contain.text", "Add user")
    cyGet('[data-testid="myprofile-box-prv1u2ywt"] * [data-testid="chipinput-textfield-zt8ix5yqf"]').find(`input`).type(uniqueEmail)
    cy.contains("Select permission template").click()
    cy.wait("@getTemplate", { timeout: 10000 }).then(({ response }) => {
      let teplateName = response.body.result.values.map(ele => ele.label);
      // cy.log(teplateName)
      cy.wrap(teplateName).as("templates")
      if (response.body.result.values.length > 0) {
        cy.assetDropdownSel(teplateName[0]).should("have.text", teplateName[0])
      } customElements
    })
    cyGet("@templates").then((response) => {
      templateLabel = response
    })
    cyGet(lead.typeBtn).contains("Save").click()
    // cy.pause()
    cyGet('.MuiSnackbarContent-message').should("have.text", messages.requestSuccess);

  });

  it('Test with a invalid email', () => {
    let randomString_1 = Math.random().toString(36).substring(2, 11);
    let uniqueEmail_1 = `testuser${randomString_1}example.com`;
    cyGet('[data-testid="myprofile-box-prv1u2ywt"] * [data-testid="chipinput-textfield-zt8ix5yqf"]').find(`input`).type(uniqueEmail_1)
    cy.contains("Select permission template").click()
    cy.get('[data-testid="chipinput-chip-nkx7xamrs"]').trigger('mouseover');
    cy.wait(500);
    cy.get('.MuiTooltip-tooltip').should('have.text', 'Email is not valid.');
  });

  it('Test with a Exist email', () => {
    cyGet('[data-testid="myprofile-box-prv1u2ywt"] * [data-testid="chipinput-textfield-zt8ix5yqf"]').find(`input`).type(uniqueEmail)
    cy.contains("Select permission template").click()
    cy.get('[data-testid="chipinput-chip-nkx7xamrs"]').trigger('mouseover');
    cy.get('.MuiTooltip-tooltip').should('have.text', 'User already exist.');
    cy.get(lead.typeBtn).contains("Save").should("be.disabled")
  });

  it('Test For addTemplate from Add user page', () => {
    //  cy.componentLabel(lead.formLabel, "Select permission template", "button").click()
    cy.get('[data-testid="button-typography-8x5inumxs"]').first().click()  //select the template
    // cy.assetDropdownSel(templateLabel[0]).click()
    cy.get('[data-testid="dropdown-footer"]').contains('Add template').click() // add new template
    // cy.contains('Add template').click();
    cy.url().should('eq', `${Cypress.env("url")}/template`);
    cy.contains('Create')
      .should('be.visible').should('not.be.disabled').click();
  });

})