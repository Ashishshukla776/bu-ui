const lead = require('../../../../selector/lead')
const { workflowActionSel } = require('../../../../selector/utility')

describe.skip(`Test the functionality of delete automation`, () => {

    beforeEach(() => {
        cy.intercept("GET", "**/wms/workflows?*").as("getWorkflow")
        cy.intercept("DELETE", "**/wms/workflows").as("delWorkflow")
        //  cy.session('user', () => { cy.login() });
        cy.assetPipeline("lms")
        cy.visit(`${Cypress.env("lmsUrl")}/setting/triggers`)
    })

    it(`Delete Automation`, () => {
        let descMsg = `Are you sure! Do you want to delete this trigger?`
        // cy.get(".MuiGrid-root h6").should("have.text", "Automation")
        // cy.get('.MuiBox-root > .MuiTypography-caption').should("have.text", "Make use of automation to trigger, map, and arrange your asset’s fields into the desired asset.");
        cy.wait("@getWorkflow").then(({ response }) => {
            expect(response.body.result.values).be.length.greaterThan(0)
            let workflowLabel = response.body.result.values.map(ele => ele.label)
            workflowActionSel(1, 1, workflowLabel[0], "#delete");
            cy.roleDialog(lead.dialogTitle, "Delete trigger", lead.dialogDesc, descMsg, `[role="dialog"] ${lead.typeBtn}`, "Delete")
            cy.wait("@delWorkflow").then(({ response }) => {
                expect(response.body).have.property("success", true)
                expect(response.body).have.property("message", 'Deleted successfully.')
            })
            // cy.get('.MuiSnackbarContent-message').should("have.text", 'Deleted successfully')
        })
    })
});