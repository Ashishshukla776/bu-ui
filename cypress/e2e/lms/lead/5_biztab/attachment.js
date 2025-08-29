const { cyGet } = require('../../../../helpers/global')
const lead = require('../../../../selector/lead')

describe(`Test the functionality of Attachment`, () => {
    beforeEach(() => {
        //  cy.session('user', () => { cy.login() });
        cy.visit(`${Cypress.env("lmsUrl")}/leads`)
        cyGet('#bu-layout [aria-label="Split view"]').click()
    })

    it(`Attach file`, () => {
        cyGet(lead.simpleTab).contains("Attachment").click()
        cyGet(lead.tabpanelBtn).contains("Add").click()
        cyGet('input[type="file"]').selectFile("cypress/fixtures/data.csv", { force: true })
        cyGet('[role="tabpanel"] .MuiTypography-noWrap').first().dblclick()
        // cy.wait(1000)
        //cyGet(lead.dialogTitle).contains("data.csv")
        cyGet(`#customized-dialog-title ${lead.typeBtn}`).contains("Download")
        cyGet('#customized-dialog-title .MuiIconButton-root').click()
    })

    it(`Download file`, () => {
        cyGet(lead.simpleTab).contains("Attachment").click()
        cyGet('#attachment-action').click()
        cyGet('#download').click()
    })

    it(`delete attached file`, () => {
        let msg2 = "Are you sure want to delete this file?"
        cyGet(lead.simpleTab).contains("Attachment").click()
        cyGet('#attachment-action').click()
        cyGet('#delete').click()
        cy.roleDialog(lead.dialogTitle, "Confirmation", lead.dialogDesc, msg2, `.MuiDialogActions-root ${lead.typeBtn}`, "Delete");
    })
})

