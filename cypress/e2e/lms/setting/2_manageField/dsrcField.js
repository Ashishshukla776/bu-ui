const lead = require('../../../../selector/lead')
const { faker } = require('@faker-js/faker')
const { editSingleSelectionField, editMultiSelectionField } = require('../../../../selector/utility')
const { buButton, cyGet, budropdownInput, buSaveButton, budropdown } = require('../../../../helpers/global')
const { labelNplaceholder, headingNsubheading, preview, searchNactionField, filedSelection } = require('../../../../helpers/field')
const globalSel = require('../../../../selector/globalSel')
const { method } = require('../../../../helpers/helper')
const fieldSel = require('../../../../selector/fieldSel')
describe(`Nevigate the setting page and test the data source fields`, () => {

    const url = Cypress.env("url")
    const module = Cypress.env("module")
    const asset = Cypress.env("asset")
    let updatedUrl = url.replace("one", module);

    beforeEach(() => {
        cy.intercept(method.get, '**/rms/assets/pipelines?view=dsrc').as("assetsPipeline")
        cy.intercept(method.get, '**/fms/fields/grid?*').as("fieldGrid")
        cy.intercept(method.get, '**/fms/fields/list?*').as("fieldList");
        cy.visit(`${updatedUrl}/setting/properties`)
    })

    it(`Create Single selction data source field`, () => {
        let dsrcField = `Data source-${new Date().valueOf()}`
        buButton(fieldSel.createFieldBtn).contains("Create field").click();
        cyGet(`${fieldSel.fieldlabelbox}`).contains("Select Field Type")
        budropdownInput(`${globalSel.muiInput} input[name="Select Field Type"]`, "Single line text", 6, `${globalSel.searchbox} input`, "Dropdown", globalSel.dialogTitleText);
        labelNplaceholder(dsrcField, `Please select the values`)
        cy.get('[data-testid="datasourcefield-typography-zui6gbl8o"]').should("have.text", "Link Asset")
        cy.get(`${globalSel.dialogContent} [data-testid="buswitch-button-79w8xnphk"]`).click()
        cy.wait("@assetsPipeline", { timeout: 10000 }).then(({ response }) => {
            const getAssets = response.body.result.values.map(ele => ele.label)
            const totalAsset = response.body.result.pages.totalRecords
            const getLeadAssets = response.body.result.values.find(ele => ele.group !== asset)
            budropdown(globalSel.dialogContent, `button ${globalSel.buttonTypography}`, getAssets[0], totalAsset, globalSel.search, getLeadAssets.label, globalSel.dialogTitleText);
        });
        headingNsubheading()
        filedSelection("Single-selection", "single").should("be.checked")
        budropdown(globalSel.dialogContent, `label`, dsrcField)
        cyGet(`${globalSel.dialogContent} [data-testid="datasourcefield-box-6mghg71wb"] [data-testid="budropdown-box-ty1opau5a"] input`)
            .should("have.attr", "placeholder", `Please select the values`)
        // preview(dsrcField, `Please select the values`)
        buSaveButton().click();
    });

    it(`Edit label and placehoder ofdata source field`, () => {
        const dsrcField = `Data source-${Date.now()}`;
        cy.wait("@fieldGrid", { timeout: 10000 }).then(({ response }) => {
            const totalPages = response.body.result.pages.totalNoOfPages;
            const editDataSource = (fieldData) => {
                cy.intercept(method.get, `**/fms/fields/${fieldData?.id}?*`).as("fieldDetail");
                searchNactionField(fieldData.label, '#edit', "Edit");
                labelNplaceholder(dsrcField, `Please select the values`);
                cy.wait("@fieldDetail").then(({ response }) => {
                    const destPip = response.body.result.catId.label;
                    cy.get(`[aria-label=${destPip}]`).parent().should("be.disabled");
                    // headingNsubheading();
                    if (fieldData.selection === "multi") {
                        editMultiSelectionField();
                    } else {
                        editSingleSelectionField();
                    }
                });
            };
            if (totalPages === 1) {
                const dsrcFieldData = response.body.result.values.find(ele => ele.prop === "dsrc");
                editDataSource(dsrcFieldData);
            } else {
                cy.get('[aria-label="pagination navigation"] ul > :last').prev().click(); // Move to last page
                cy.wait("@fieldGrid").then(({ response }) => {
                    const dsrcFieldData = response.body.result.values.find(ele => ele.prop === "dsrc");
                    editDataSource(dsrcFieldData);
                });
            }
        });
        budropdown(globalSel.dialogContent, `label`, dsrcField)
        cyGet(`${globalSel.dialogContent} [data-testid="datasourcefield-box-6mghg71wb"] [data-testid="budropdown-box-ty1opau5a"] input`)
            .should("have.attr", "placeholder", `Please select the values`)
        // preview(dsrcField, `Please select the values`)
        buSaveButton().click();
    });
})
