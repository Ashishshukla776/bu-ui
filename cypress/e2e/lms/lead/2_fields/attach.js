const lead = require('../../../../selector/lead')
import { buButton } from '../../../../helpers/global'
const url = Cypress.env("url")
const module = Cypress.env("module")
const asset = Cypress.env("asset")
let updatedUrl = url.replace("one", module);

describe(`Test the functionality of attach field`, () => {
    beforeEach(() => {
        cy.intercept('GET', '**/fms/fields/available*').as("availableField");
         cy.visit(`${updatedUrl}/${asset}s`)
        const assetName = asset.charAt(0).toUpperCase() + asset.slice(1)
        buButton(`[data-testid="Create ${assetName}"]`).click()
        // cy.get(lead.typeBtn).contains(`Create ${assetName}`).click();
        cy.get(lead.typeBtn).contains("Add fields").click();


    })

    it(`Attach field`, () => {
        cy.get('[data-testid="Attach field"]').should("have.text", "Attach field").click()
        cy.wait(500)
        cy.get(`[data-testid="title-dialog"] p`).contains("Attach field")
        // cy.get('[role="dialog"] [placeholder="Search..."]').last().type("jddnn")

        cy.wait("@availableField").then(({ response }) => {

            if (response.body.result.values.length == 0) {
                cy.log("Fields are not available for attach")
                cy.get('#cancel').click()
            } else {
                let field = response.body.result.values.map(ele => ele.label)
                cy.get('[role="dialog"] [placeholder="Search..."]').last().type(field[0])
                // cy.get('.MuiDialog-container .MuiDialogContent-root > :last [placeholder="Search..."]')
                cy.wait(200)
                cy.get('[data-testid="attachfields-collapse-uvsmqfw9l"] [data-testid="propertylist-listitemtext-esgc2itka"]').contains(field[0]).click()
                cy.get('#attach').click()
                cy.wait(500)
                cy.get('[role="dialog"] [placeholder="Search..."]').type(field[0])
                cy.get('[data-testid="propertylist-box-k4wxytcqz"] [data-testid="withtruncate-wrapped-jhk5rb2jw"]').last().should("have.text", field[0])
                cy.get('[data-testid="propertylist-box-k4wxytcqz"] input').last().should("be.checked")
            }
        })
        cy.get('[data-testid="close-dialog"]').click()
        cy.get('[data-testid="title-dialog"] p').eq(1).contains("Warning")
        cy.get('[data-testid="buformeditor-typography-3mxztjea3"]')
        cy.get('[data-testid="Confirm"]').click()
    })
});
