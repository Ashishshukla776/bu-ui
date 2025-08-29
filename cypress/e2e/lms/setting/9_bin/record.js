const { faker } = require('@faker-js/faker')
const lead = require('../../../../selector/lead')
const url = Cypress.env("url")
const module = Cypress.env("module")
const asset = Cypress.env("asset")
let updatedUrl = url.replace("one", module);
describe(`Test the functionality of restore ${asset} from bin`, () => {

    let uidFeild;

    beforeEach(() => {
        cy.intercept(`**/fms/pipelines?*`).as("getPipeline")
        cy.intercept(`**/rms/tools/bin/list?*`).as("binRecord")
        cy.visit(`${updatedUrl}/setting/bin`)
    });


    it(`Check if the Cancel button is working when restoring ${asset} from bin`, () => {
        cy.get(lead.typeBtn).contains("Delete").should("be.disabled")
        cy.get(lead.typeBtn).contains("Restore").should("be.disabled")
        cy.wait("@binRecord").then(({ response }) => {
            let recordLength = response.body.result.values.length;
            let totalRecord = response.body.result.pages.totalRecords;
            uidFeild = response.body.result.view.columns.find(fld => fld.prop === "uid");
            const msg1 = `Restore ${recordLength} ${asset} ?`
            const msg2 = `Are you sure you want to restore ${recordLength} ${asset} ? `
            if (totalRecord === 0) {
                cy.contains(`tr`, uidFeild.label).find(`input[type="checkbox"]`).should("be.disabled");
                expect(totalRecord).to.be.eq(0)
            } else {
                cy.contains(`tr`, uidFeild.label).find(`input[type="checkbox"]`).check();
                cy.get(lead.typeBtn).contains("Restore").click()
                cy.roleDialog(lead.dialogTitle, msg1, lead.dialogDesc, msg2, lead.typeBtn, "Cancel")
                cy.wait(500)
                cy.get(lead.countOnGrid).contains(totalRecord)
            }
        })
    })

    it(`Restore the ${asset} from bin`, () => {
        cy.wait("@binRecord").then(({ response }) => {
            let recordLength = response.body.result.values.length
            let totalRecord = response.body.result.pages.totalRecords
            let remainsRecord = totalRecord - recordLength
            let msg1 = `Restore ${recordLength} lead ?`
            let msg2 = `Are you sure you want to restore ${recordLength} lead ? `
            if (recordLength === 0) {
                cy.contains(`tr`, uidFeild.label).find(`input[type="checkbox"]`).should("be.disabled")
                expect(recordLength).to.be.eq(0)
            } else {
                cy.contains(`tr`, uidFeild.label).find(`input[type="checkbox"]`).check();
                cy.get(lead.typeBtn).contains("Restore").click()
                cy.roleDialog(lead.dialogTitle, msg1, lead.dialogDesc, msg2, `.MuiDialogActions-root ${lead.typeBtn}`, "Restore")
                cy.get('.MuiSnackbarContent-message').should("have.text", "Request successful.")
                cy.get(lead.countOnGrid).contains(remainsRecord)
            }
        })
    })

    it(`Check if the Cancel button is working when deleting ${asset} from bin`, () => {
        cy.wait("@binRecord").then(({ response }) => {
            let recordLength = response.body.result.values.length
            let totalRecord = response.body.result.pages.totalRecords
            let msg1 = `Delete ${recordLength} ${asset} ?`
            let msg2 = `Are you sure you want to delete ${recordLength} ${asset} ? `
            if (recordLength === 0) {
                cy.contains(`tr`, uidFeild.label).find(`input[type="checkbox"]`).should("be.disabled");
                expect(recordLength).to.be.eq(0)
            } else {
                cy.contains(`tr`, uidFeild.label).find(`input[type="checkbox"]`).check();
                cy.get(lead.typeBtn).contains("Delete").click()
                cy.roleDialog(lead.dialogTitle, msg1, lead.dialogDesc, msg2, lead.typeBtn, "Cancel")
                cy.wait(500)
                cy.get(lead.countOnGrid).contains(totalRecord)
            }
        })
    })

    it(`Delete the ${asset} from bin`, () => {
        cy.wait("@binRecord").then(({ response }) => {
            let recordLength = response.body.result.values.length;
            let totalRecord = response.body.result.pages.totalRecords;
            let remainsRecord = totalRecord - recordLength;
            let msg1 = `Delete ${recordLength} ${asset} ?`;
            let msg2 = `Are you sure you want to delete ${recordLength} ${asset} ? `;
            if (recordLength === 0) {
                cy.contains(`tr`, uidFeild.label).find(`input[type="checkbox"]`).should("be.disabled");
                expect(recordLength).to.be.eq(0)
            } else {
                cy.contains(`tr`, uidFeild.label).find(`input[type="checkbox"]`).check();
                cy.get(lead.typeBtn).contains("Delete").click()
                cy.roleDialog(lead.dialogTitle, msg1, lead.dialogDesc, msg2, `[role="dialog"] ${lead.typeBtn}`, "Delete")
                cy.get('.MuiSnackbarContent-message').should("have.text", "Deleted successfully.")
                cy.get(lead.countOnGrid).contains(remainsRecord)
            }
        })
    })
})