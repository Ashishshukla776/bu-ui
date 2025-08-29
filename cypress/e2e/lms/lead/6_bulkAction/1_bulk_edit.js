const lead = require('../../../../selector/lead');
const { buSaveButton, buSearchbox, budropdownOption, cyGet } = require('../../../../helpers/global');
const messages = require('../../../../helpers/messages');
const globalSel = require('../../../../selector/globalSel');
const { handleDropdownField } = require('../../../../helpers/record');

describe(`Test the functionality of bulk edit`, () => {
    const url = Cypress.env("url");
    const module = Cypress.env("module");
    const asset = Cypress.env("asset");
    let updatedUrl = url.replace("one", module);

    beforeEach(() => {
        cy.intercept("GET", `**/rms/bulk-action/edit?*`).as("getbulkEdit")
        cy.visit(`${updatedUrl}/${asset}s`)
    });

    it(`Bulk edit the record`, () => {
        cyGet(lead.arealabelGrid).click()
        cyGet('table > thead input').check()
        cyGet('#bulkActions [data-testid="Edit"]').contains("Edit").click()
        cyGet(lead.dialogTitle).should("have.text", "Bulk record update")
        cyGet(`[aria-label="Select Field"]`).click()
        cy.wait("@getbulkEdit").then(({ response }) => {
            const bulkeditValues = response.body.result.values
            const lengthgetbulkEdit = bulkeditValues.length
            if (asset === "contact") {
                const otherField = bulkeditValues.find(ele => ele.label !== "Stage")
                if (lengthgetbulkEdit > 5) { buSearchbox(globalSel.search, otherField?.label) }
                budropdownOption(otherField?.label).first().click({ force: true })
                if (otherField.selection === "single" && otherField.prop != "dsrc") {
                    handleDropdownField(otherField, `[data-testid="fields-box-xhbyf34nj"]`, `[data-testid="buchip-chip-5r51zm55o"]`);
                } else {
                    handleDropdownField(otherField, `[data-testid="fields-box-xhbyf34nj"]`);
                }

            } else {
                let stageField = bulkeditValues.find(ele => ele.label === "Stage")
                if (lengthgetbulkEdit > 5) { buSearchbox(globalSel.search, stageField?.label) }
                budropdownOption(stageField?.label).first().click({ force: true })
                handleDropdownField(stageField, `[data-testid="fields-box-xhbyf34nj"]`, `[data-testid="buchip-chip-5r51zm55o"]`);

                if (lengthgetbulkEdit > 1) {
                    const otherField = bulkeditValues.find(ele => ele.label !== "Stage")
                    cyGet(`[data-testid="staticfieldcard-iconbutton-u6zoboy9a"]`).click();
                    cyGet(`[aria-label="Select Field"]`).click()
                    if (lengthgetbulkEdit > 5) { buSearchbox(globalSel.search, otherField?.label) }
                    budropdownOption(otherField?.label).first().click({ force: true })
                    if (otherField.selection === "single" && otherField.prop != "dsrc") {
                        handleDropdownField(otherField, `[data-testid="fields-box-xhbyf34nj"]`, `[data-testid="buchip-chip-5r51zm55o"]`);
                    } else {
                        handleDropdownField(otherField, `[data-testid="fields-box-xhbyf34nj"]`);
                    }
                }
            }
            buSaveButton().click()
            cyGet('.MuiSnackbarContent-message').should("have.text", messages.requestSuccess);
        })
    })
})