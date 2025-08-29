const lead = require('../../../../selector/lead')
import { buButton, buSaveButton } from '../../../../helpers/global';
import { labelNplaceholder, textCaseFormat } from '../../../../helpers/field';
import messages from '../../../../helpers/messages';
const url = Cypress.env("url")
const module = Cypress.env("module")
const asset = Cypress.env("asset")
let updatedUrl = url.replace("one", module);
const { faker } = require('@faker-js/faker')
describe(`Nevigate the lead page and Update fields`, () => {
    beforeEach(() => {
        cy.intercept('GET', '**/fms/forms/config/create?*').as("fieldList");
        cy.intercept('GET', '**/fms/groups/list?*').as("groupList");
        //  cy.session('user', () => { cy.login() });
        cy.visit(`${updatedUrl}/${asset}s`)
        const assetName = asset.charAt(0).toUpperCase() + asset.slice(1)
        buButton(`[data-testid="Create ${assetName}"]`).click()
        cy.get(lead.typeBtn).contains("Add fields").click();
    })

    it(`Edit Single line text field`, () => {
        let singleField = `Single line-${new Date().valueOf()}`
        cy.wait("@fieldList", { timeout: 10000 }).then(({ response }) => {
            let fieldData = response.body.result.values.filter((ele) => ele.required == false && ele.system == false && ele.prop == "str").slice(-1);
            cy.get('[data-testid="buformeditor-textfield-ml5m9m9l0"] input').type(fieldData[0].label);
            cy.get('[data-testid="actions-iconbutton-4zbo8fvnl"]').first().click();
            cy.get('[data-testid="actions-box-qexr9sum4"]')
                .contains('Edit')
                .click({ force: true });
            cy.get('[data-testid="input-muiinput-t8mkcx347"] input[name="Select Field Type"]').should("have.value", "Single line text");
            // Field label and Placeholder
            labelNplaceholder(singleField, `Enter ${singleField}`)
            // Min and Max
            cy.get('[data-testid="withtitle-box-mp6w6v7ka"] label').contains("Min Length").next().clear().type(faker.number.int({ min: 3, max: 9 }));
            cy.get('[data-testid="withtitle-box-mp6w6v7ka"] label').contains("Max Length").next().clear().type(faker.number.int({ min: 15, max: 100 }));
            // Text Case
            textCaseFormat()
            // Preview
            cy.get('#single_text_field-label').should("have.text", singleField);
            cy.get('#single_text_field').should("have.attr", "placeholder", `Enter ${singleField}`);
        });
        buSaveButton().click()
        cy.get('.MuiSnackbarContent-message', { timeout: 10000 }).should("have.text", messages.updated)
    });

    it(`Edit dropdown field`, () => {
        let basField = `Dropdown-${new Date().valueOf()}`
        cy.wait(500)
        cy.wait("@fieldList").then(({ response }) => {
            let fieldData = response.body.result.values.filter((ele) => ele.required == false && ele.system == false && ele.prop == "bas").slice(-1);
            // cy.log("fieldData", JSON.stringify(fieldData[0].label))
            cy.get('[data-testid="buformeditor-textfield-ml5m9m9l0"] input').type(fieldData[0].label);
            cy.get('[data-testid="actions-iconbutton-4zbo8fvnl"]').first().click();
            cy.get('[data-testid="actions-box-qexr9sum4"]')
                .contains('Edit')
                .click({ force: true });
            cy.get('[data-testid="input-muiinput-t8mkcx347"] input[name="Select Field Type"]').should("have.value", "Dropdown").and("have.prop", "disabled");
            labelNplaceholder(basField, `Enter ${basField}`);
        });
        cy.get(`[data-testid="optionslist-textfield-ud6koj7f1"]`).first().clear().type("Edited Option 1");
        cy.get(lead.typeBtn).contains("Add option").click();
        cy.get(`[data-testid="optionslist-textfield-ud6koj7f1"]`).last().clear().type(`Option-${new Date().valueOf()}`);
        cy.get('[data-testid="buradiogroup-radiogroup-tdw0bqbm7"] input[value="multi"]').then(($ele) => {
            if ($ele.is(':disabled')) {
                cy.log("Multi-selection option type can't be edit")
            } else {
                cy.get('[value="single"]').click();
                cy.get('[value="multi"]').click();
            }
        })
        buSaveButton().click()
        cy.get('.MuiSnackbarContent-message', { timeout: 10000 }).should("have.text", messages.updated)
    });
});
