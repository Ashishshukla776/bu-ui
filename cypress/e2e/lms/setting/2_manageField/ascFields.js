const lead = require('../../../../selector/lead')
import { headingNsubheading, labelNplaceholder, searchNactionField } from '../../../../helpers/field';
import messages from '../../../../helpers/messages';
import fieldSel from '../../../../selector/fieldSel';
import globalSel from '../../../../selector/globalSel';
import { editMultiSelectionField, editSingleSelectionField } from '../../../../selector/utility';
const { method } = require('../../../../helpers/helper');
const { buButton, budropdown, budropdownInput, cyGet, butextField, buradio, buSaveButton, buSearchbox, budropdownOption } = require('../../../../helpers/global');
describe(`Nevigate the setting page and create and update association fields`, () => {
    const url = Cypress.env("url")
    const module = Cypress.env("module")
    const asset = Cypress.env("asset")
    let updatedUrl = url.replace("one", module);
    beforeEach(() => {
        cy.intercept(method.get, '**/rms/assets/pipelines?*').as("assetsPipeline");
        cy.intercept(method.get, '**/fms/fields/grid?*').as("fieldGrid");
        cy.intercept(method.get, '**/fms/fields/list?*').as("fieldList");
        cy.visit(`${updatedUrl}/setting/properties`)

    })

    const ascInput = (ascFieldLabel) => {
        cyGet('[data-testid="associationfield-typography-gueb09c03"]').should("have.text", "Edit Properties");
        butextField(globalSel.butextfield, fieldSel.fieldlabelboxId).should("have.value", ascFieldLabel);
        labelNplaceholder(ascFieldLabel, `Select ${ascFieldLabel}`);
    };

    it(`Create association field`, () => {
        buButton(fieldSel.createFieldBtn).contains("Create field").click();
        cyGet(`${fieldSel.fieldlabelbox}`).contains("Select Field Type")
        budropdownInput(`${globalSel.muiInput} input[name="Select Field Type"]`, "Single line text", 6, `${globalSel.searchbox} input`, "Association", globalSel.dialogTitleText)
        cyGet(`${fieldSel.fieldlabelbox}`).contains("Select Group");
        cyGet(`${globalSel.muiInput} input[name="Select Group"]`).should('be.disabled').and('have.value', "System Fields");
        cy.wait("@assetsPipeline");
        cy.wait("@assetsPipeline").then(({ response }) => {
            const apiLength = response.body.result.values.length
            const assetsPip = response.body.result.values.find(ele => ele.disable != true);
            cyGet(`${globalSel.withtitleinputlabel}`).contains("Select Asset")
            budropdown(globalSel.dialogContent, `button ${globalSel.buttonTypography}`, assetsPip?.label, apiLength, globalSel.search, assetsPip?.label, globalSel.dialogTitleText)
            ascInput(`${assetsPip?.label} Association`);
            headingNsubheading();
            buradio("Single-selection")
            cyGet(`[data-testid="avatarinput-textfield-ojwxr8kdk"] label`).contains(`${assetsPip?.label} Association`)
            cyGet(`[data-testid="avatarinput-textfield-ojwxr8kdk"] input`).should("have.attr", "placeholder", `Select ${assetsPip?.label} Association`);
        });
        buSaveButton().click()
    });

    it(`Verify dissabled aaset`, () => {
        buButton(fieldSel.createFieldBtn).contains("Create field").click();
        cyGet(`${fieldSel.fieldlabelbox}`).contains("Select Field Type")
        budropdownInput(`${globalSel.muiInput} input[name="Select Field Type"]`, "Single line text", 6, `${globalSel.searchbox} input`, "Association", globalSel.dialogTitleText)
        cy.wait("@assetsPipeline");
        cy.wait("@assetsPipeline").then(({ response }) => {
            const apiLength = response.body.result.values.length
            const assetspipLabels = response.body.result.values.map(ele => ele.label);
            const disableassetsPip = response.body.result.values.find(ele => ele.disable === true);
            const availablePip = response.body.result.values.find(ele => ele.disable !== true);
            if (disableassetsPip) {
                const assetDropdownContain = availablePip.label ?? `Select`
                budropdown(globalSel.dialogContent, `button ${globalSel.buttonTypography}`, assetDropdownContain)
                if (apiLength > 5) buSearchbox(globalSel.search, disableassetsPip?.label);
                budropdownOption(disableassetsPip?.label, `[data-testid="virtuallist-listitembutton-w6znzg16f"]`)
                    // .find(`[data-testid="virtuallist-listitembutton-w6znzg16f"]`)
                    .should('have.attr', 'aria-disabled', 'true')
            } else {
                cy.log("Association field not available in bin")
            }
        });
    });

    it(`Edit association field`, () => {
        cy.wait("@fieldGrid", { timeout: 10000 }).then(({ response }) => {
            const totalPages = response.body.result.pages.totalNoOfPages;
            const handleAscField = (fieldData) => {
                const ascField = fieldData.values.find(ele => ele.prop === "asc");
                cy.intercept(method.get, `**/fms/fields/${ascField.id}?*`).as("fieldDetail");
                searchNactionField(ascField.label, globalSel.edit, "Edit");
                ascInput(ascField.label);
                cy.wait("@fieldDetail").then(({ response }) => {
                    if (response.body.result.selection === "multi") {
                        editMultiSelectionField();
                    } else {
                        editSingleSelectionField();
                    }
                });
            };
            if (totalPages === 1) {
                handleAscField(response.body.result);
            } else {
                cy.get('[aria-label="pagination navigation"] ul > :last').prev().click();
                cy.wait("@fieldGrid").then(({ response }) => {
                    handleAscField(response.body.result);
                });
            }
        });
        buSaveButton().click();
        cyGet(globalSel.SnackbarMessage).invoke('text').should('include', messages.updated)
    });

});
