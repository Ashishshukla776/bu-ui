const lead = require('../../../../selector/lead')
const { faker } = require('@faker-js/faker')
import { buButton, budropdownInput, buSaveButton, butextField } from '../../../../helpers/global'
import { labelNplaceholder, preview, textCaseFormat } from '../../../../helpers/field'
import messages from '../../../../helpers/messages'
import globalSel from '../../../../selector/globalSel'
const url = Cypress.env("url")
const module = Cypress.env("module")
const asset = Cypress.env("asset")
let updatedUrl = url.replace("one", module);

describe(`Nevigate the lead page and create new fields`, () => {
    beforeEach(() => {
        cy.intercept('GET', '**/fms/groups/list?*').as("groupList");
        cy.visit(`${updatedUrl}/${asset}s`)
        const assetName = asset.charAt(0).toUpperCase() + asset.slice(1)
        buButton(`[data-testid="Create ${assetName}"]`).click()
        cy.get(lead.typeBtn).contains("Add fields").click();
        cy.get(lead.typeBtn).contains("Create field").click();
    })

    it(`Create single line text field`, () => {
        let stringField = `String-${new Date().valueOf()}`
        cy.get(lead.inputField).should("have.value", "Single line text")
        cy.wait("@groupList").then(({ response }) => {
            let privateGroup = response.body.result.values.filter(ele => ele.scope == "private")
            cy.get(`input[name="Select Group"]`).should("have.value", privateGroup[0].label)
        })
        labelNplaceholder(stringField, `Enter ${stringField}`)
        butextField(`[data-testid="commonstringsettings-box-mbdj984uh"] > :first ${globalSel.butextfield}`, "input").type(3)  // set min
        butextField(`[data-testid="commonstringsettings-box-mbdj984uh"] > :last ${globalSel.butextfield}`, "input").type(30) // set max
        textCaseFormat()
        preview(stringField, `Enter ${stringField}`)
        buSaveButton().click()
        cy.get('.MuiSnackbarContent-message', { timeout: 10000 }).should("have.text", messages.created)
    })

    it(`Create dropdown field`, () => {
        let dropdownField = `Dropdown-${new Date().valueOf()}`
        budropdownInput(`${globalSel.muiInput} input[name="Select Field Type"]`, "Single line text", 6, `${globalSel.searchbox} input`, "Dropdown", globalSel.dialogTitleText);
        cy.wait("@groupList").then(({ response }) => {
            let publicGroup = response.body.result.values.filter(ele => ele.scope == "public")
            cy.get(`input[name="Select Group"]`).click()
            cy.get(lead.chooseOptions).contains(publicGroup[0].label).click()
        })
        labelNplaceholder(dropdownField, `Enter ${dropdownField}`);
        cy.get(`[data-testid="optionslist-textfield-ud6koj7f1"] input`).should("have.value", "Option 1")
        cy.get(lead.typeBtn).contains("Add option").click()
        cy.get('[data-testid="optionslist-textfield-ud6koj7f1"] input').eq(1).should("have.value", "Option 2")
        cy.get(lead.typeBtn).contains("Add option").click()
        cy.get('[data-testid="optionslist-textfield-ud6koj7f1"] input').eq(2).should("have.value", "Option 3")
        buSaveButton().click()
        cy.get('.MuiSnackbarContent-message', { timeout: 10000 }).should("have.text", messages.created)
    })
})
