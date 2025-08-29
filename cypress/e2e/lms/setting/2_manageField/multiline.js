const { labelNplaceholder, preview, searchField, fieldTypeFilterOnSetting, textCaseFormat } = require('../../../../helpers/field');
const { buButton, cyGet, budropdownInput, buSaveButton, butextField, budropdown, onesecondWait } = require('../../../../helpers/global');
const messages = require('../../../../helpers/messages');
const fieldSel = require('../../../../selector/fieldSel');
const globalSel = require('../../../../selector/globalSel');
const { request, reqHeader } = require('../../../../selector/utility')
const { faker } = require('@faker-js/faker')

describe(`Navigate to setting page and create and update fields`, () => {

    let assetPipelineId
    const url = Cypress.env("url")
    const module = Cypress.env("module")
    // const asset = Cypress.env("asset")
    let updatedUrl = url.replace("one", module);

    beforeEach(() => {
        cy.intercept('GET', '**/rms/assets/pipelines?*').as("assetsPipeline")
        cy.intercept('GET', '**/fms/fields/grid?*').as("fieldGrid")
        cy.visit(`${updatedUrl}/setting/properties`)
    })

    it(`Create Multi line text field`, () => {
        let fieldLabel = `Multiline-${new Date().valueOf()}`
        buButton(fieldSel.createFieldBtn).contains("Create field").click();
        cyGet(`${fieldSel.fieldlabelbox}`).contains("Select Field Type");
        budropdownInput(`${globalSel.muiInput} input[name="Select Field Type"]`, "Single line text", 6, `${globalSel.searchbox} input`, "Multi line text", globalSel.dialogTitleText);
        labelNplaceholder(fieldLabel, `Enter ${fieldLabel}`)
        butextField(`[data-testid="commonstringsettings-box-mbdj984uh"] > :first ${globalSel.butextfield}`, "input").type(3)  // set min
        butextField(`[data-testid="commonstringsettings-box-mbdj984uh"] > :last ${globalSel.butextfield}`, "input").type(100) // set max
        // butextField(globalSel.butextfield, "#max").type(100)
        textCaseFormat()
        cyGet(`[data-testid="butextarea-textfield-nvtcklezl"] > label`).should("have.text", fieldLabel)
        cyGet(`[data-testid="butextarea-textfield-nvtcklezl"]`).find("textarea").should("have.attr", "placeholder", `Enter ${fieldLabel}`)
        // preview(fieldLabel, `Enter ${fieldLabel}`)
        buSaveButton().click()
        cyGet('.MuiSnackbarContent-message').should("have.text", messages.created)
    });

    it(`Edit Multi line text field`, () => {
        let fieldLabel = `Multiline-${new Date().valueOf()}`;
        cy.visit(`${Cypress.env("lmsUrl")}/setting/properties`)
        cy.wait("@assetsPipeline", { timeout: 10000 }).then(({ response }) => {
            let assetPipId = response.body.result.values.map(ele => ele.id)
            cy.wrap(assetPipId[0]).as("assetPipId")
        })
        cy.get("@assetPipId").then((response) => { assetPipelineId = response })
        budropdown(globalSel.settinglayoutbox, `button ${globalSel.buttonTypography}`, "All field types")
        fieldTypeFilterOnSetting("Multi line text")
        budropdown(globalSel.settinglayoutbox, `button ${globalSel.buttonTypography}`, "Multi line text")
        searchField("txa", null, 'Edit')
        labelNplaceholder(fieldLabel, `Enter ${fieldLabel}`)
        butextField(`[data-testid="commonstringsettings-box-mbdj984uh"] > :first ${globalSel.butextfield}`, "input").clear().type(3)  // edit min
        butextField(`[data-testid="commonstringsettings-box-mbdj984uh"] > :last ${globalSel.butextfield}`, "input").clear().type(150) // edit max
        textCaseFormat()
        cyGet(`[data-testid="butextarea-textfield-nvtcklezl"] > label`).should("have.text", fieldLabel)
        cyGet(`[data-testid="butextarea-textfield-nvtcklezl"]`).find("textarea").should("have.attr", "placeholder", `Enter ${fieldLabel}`)
        buSaveButton().click()
        cyGet('.MuiSnackbarContent-message', { timeout: 10000 }).should("have.text", messages.updated)
    })
});



