// const lead = require('../../../selector/lead');
describe(`search User functionality test`, () => {     
    beforeEach(() => {
      cy.intercept('POST', '**/crew/users/grid?*').as("userList")
    //   cy.intercept('POST', '**/crew/users/grid?page=1&search=userName').as("userList")
      cy.visit(`${Cypress.env("url")}/profile?tab=manageUsers`)
      cy.wait(1000);
    })
    it('Search user by search user functionality on second page', () => {
        cy.wait("@userList", {timeout: 10000}).then(({response})=>{
            const userName = response.body.result.values.filter(ele => ele.status > 0);
            const user = userName.slice(-1)[0]
            cy.get('[placeholder="search...."]').type(user.label)

        cy.wait("@userList", {timeout: 10000}).then(({response})=>{
            expect(response.body.result.values[0]).has.property("label", user.label)
        })
        })
        })
  })