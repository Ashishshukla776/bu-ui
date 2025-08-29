const { cyGet, buSaveButton, twosecondWait } = require('../../../../helpers/global')
const { propwiseFields } = require('../../../../helpers/record')
const { createctmTemplate, validatectmRecord } = require('../../../../helpers/forms')
const { de } = require('@faker-js/faker')
const url = Cypress.env("url")
const module = Cypress.env("module")
const asset = Cypress.env("asset")
let updatedUrl = url.replace("one", module);

describe(`Test the functionality of custom form`, function () {

    beforeEach(() => {
        cy.intercept("POST", `**/fms/pipelines/exists?*`).as("existsPipeline")
        cy.intercept("GET", "**/fms/biztabs?*").as("getBiztab")
        cy.intercept("GET", "**/fms/forms/?*").as("getFormDetail")
        cy.intercept("GET", "**/templates/records?*").as("getTemplateRecord")
        cy.intercept("GET", "**/rms/dependent?*").as("getDependent")
        cy.visit(`${updatedUrl}/${asset}s`)
        cyGet('[data-testid="splitview-g-w1aobu38w"]').click({ force: true })
    });

    function gotocreatectmrecordForm() {
        return cy.wait("@existsPipeline", { timeout: 10000 }).then(() => {
            return cy.wait("@getBiztab", { timeout: 10000 }).then(({ response }) => {
                const ctmField = response.body.result.find(ele => ele.prop === "ctm");
                cyGet(`[aria-label="Simple Tab"] [aria-label="${ctmField?.label}"]`)
                    .contains(ctmField?.label)
                    .click()
                cyGet(`[data-testid="Add"]`).contains("Add").click()
                return cy.wrap(ctmField)
            })
        })
    }

    it(`Add row in grid, save template and create custom form record`, function () {
        gotocreatectmrecordForm().then((ctmfieldData) => {
            cy.wait("@getFormDetail", { timeout: 10000 }).then(({ response }) => {
                const formfields = Object.values(response.body.result.fields);
                propwiseFields(formfields, {}, [], true)
                createctmTemplate()
                buSaveButton().click()   // click on save record
            })
        })
    });

    it(`Verify custom form record listing after create record`, function () {
        cy.wait("@existsPipeline", { timeout: 10000 }).then(() => {
            cy.wait("@getBiztab", { timeout: 10000 }).then(({ response }) => {
                const ctmField = response.body.result.find(ele => ele.prop === "ctm");
                cyGet(`[aria-label="Simple Tab"] [aria-label="${ctmField?.label}"]`)
                    .contains(ctmField?.label)
                    .click()
                cy.wait("@getDependent", { timeout: 10000 }).then(({ response }) => {
                    const totalRecord = response.body.result.values.length;
                    const view = response.body.result.view;
                    if (totalRecord > 0) {
                        const dependenRecord = response.body.result.values[0];
                        validatectmRecord(dependenRecord, view)
                    } else { throw new Error(`Custom form record not available`) }
                });
            });
        });
    });

    it(`Retrieve data from template and create record`, function () {
        gotocreatectmrecordForm().then((ctmfieldData) => {
            buSaveButton().should("be.disabled")
            cyGet(`[data-testid="create-iconbutton-dqbsjv0je"]`).click();
            cy.wait("@getTemplateRecord", { timeout: 10000 }).then(({ response }) => {
                const templateData = response.body.result.values.slice(0, 1);
                cyGet(`[data-testid="templates-textfield-1k2cknyxa"] [placeholder="Search..."]`).type(templateData[0].label);
                cyGet(`[data-testid="templates-listitembutton-j1lf8cl9p"] [aria-label="${templateData[0].label}"]`)
                    .should("contain.text", templateData[0].label)
                    .click()
                twosecondWait()
                buSaveButton().click()   // click on save record
            })
        })
    });

    it(`Update custom form record`, function () {
        cy.wait("@existsPipeline", { timeout: 10000 }).then(() => {
            cy.wait("@getBiztab", { timeout: 10000 }).then(({ response }) => {
                const ctmField = response.body.result.find(ele => ele.prop === "ctm");
                cyGet(`[aria-label="Simple Tab"] [aria-label="${ctmField?.label}"]`)
                    .contains(ctmField?.label)
                    .click()
                cy.wait("@getDependent", { timeout: 10000 }).then(({ response }) => {
                    const totalRecord = response.body.result.values.length
                    if (totalRecord > 0) {
                        cyGet(`[data-testid="customform-box-jpf6ej62l"]`).first()
                            .find(`[data-testid="busimpledropdown-iconbutton-81obeefh3"]`)
                            .click()
                        cyGet(`#edit * [data-testid="busimpledropdown-typography-pkpid4cdj"]`)
                            .should("contain.text", "Edit")
                            .click()
                        cy.wait("@getFormDetail", { timeout: 10000 }).then(({ response }) => {
                            const formfields = Object.values(response.body.result.fields);
                            propwiseFields(formfields, {}, [], true)
                            cyGet(`[data-testid="Update"]`).click()   // click on save record
                        })
                    } else { throw new Error(`Custom form record not available`) }
                })
            })
        })
    });
});
