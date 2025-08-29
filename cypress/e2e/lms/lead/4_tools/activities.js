const lead = require('../../../../selector/lead')
const { faker } = require('@faker-js/faker')

describe.skip(`Test the functionality of Activity log`, () => {
    beforeEach(() => {
        cy.intercept(`**/fams/records/grid?*`).as("recordGrid")
        cy.intercept(`**/lens/records/activities?*`).as("activity")
        //  cy.session('user', () => { cy.login() });
        cy.visit(`${Cypress.env("lmsUrl")}/leads`)
        cy.wait(2000)
    })

    // it.skip(`Activity log of create record`, () => {
    //     // cy.get('table > tbody > :nth-child(1)').click()

    //     // cy.get('.MuiTableBody-root > :nth-child(3) > :nth-child(2)').click()
    //     // cy.wait(1000)
    //     cy.get('[aria-label="Activities"] > .MuiButtonBase-root').click()
    //     cy.get('.MuiTooltip-tooltip').should("have.text", "Activities")
    //     cy.wait("@activity").then(({response})=>{
    //         let userIdKey = Object.keys(response.body.result.users[0])
    //         cy.log(JSON.stringify(userIdKey))
    //         // cy.get(`${lead.chooseOptions} > :last strong`).should("have.text", response.body.result.users[userIdKey].label)
    //     })

    // })

    it(`Activity log of update record`, () => {
        // cy.get('table > tbody > :nth-child(1)').click()
        cy.wait(1000)
        cy.componentLabel(lead.formLabel, "Mobile number", "input").clear()
        cy.componentLabel(lead.formLabel, "Mobile number", "input").type(faker.string.numeric(10))
        cy.get(lead.typeBtn).contains("Save").click()
        cy.wait(1000)
        cy.get('[aria-label="Activities"] > .MuiButtonBase-root').click()
        cy.get('.MuiTooltip-tooltip').should("have.text", "Activities")
        cy.wait("@activity").then(({ response }) => {
            // let preValue = response.body.result.values[0].prev
            let curValue = response.body.result.values[0].currentValue
            // let previousValue = preValue.toString()
            let currentValue = (`${curValue} `).toString()
            // let userIdKey = Object.keys(response.body.result.users)
            // cy.get(`${lead.chooseOptions} > :first`).find("aria-label",previousValue).should("have.text", previousValue)
            // cy.get(`.ReactVirtualized__Grid__innerScrollContainer [aria-label=${previousValue}]`).should("have.text", previousValue)
            cy.get(`.ReactVirtualized__Grid__innerScrollContainer [aria-label=${currentValue}]`).should("have.text", currentValue)
        })

    })
})

