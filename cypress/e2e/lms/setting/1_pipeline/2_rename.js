const { faker } = require('@faker-js/faker')
const lead = require('../../../../selector/lead')
const globalSel = require('../../../../selector/globalSel')
const { busimpledropdown, butextField, buButton, budropdown } = require('../../../../helpers/global')
const pipelineSel = require('../../../../selector/pipelineSel')
const messages = require('../../../../helpers/messages')
const { method } = require('../../../../helpers/helper')

const url = Cypress.env("url")
const module = Cypress.env("module")
const asset = Cypress.env("asset")
let updatedUrl = url.replace("one", module);

describe(`Nevigate the setting page and rename pipeline`, () => {
    beforeEach(function () {
        cy.intercept(method.get, '**/fms/pipelines?*').as("getPipeline")
        if (asset === "contact") { this.skip() };
        cy.visit(`${updatedUrl}/setting/${asset}`)
    });

    it(`Rename pipeline`, () => {
        let editedPIpLabel = `${faker.commerce.product()}-${new Date().valueOf()}`
        cy.wait("@getPipeline", { timeout: 10000 }).then(({ response }) => {
            let pipLabel = response.body.result.values.map(ele => ele.label)
            budropdown(globalSel.settinglayoutbox, `button ${globalSel.buttonTypography}`, pipLabel[0]);
            busimpledropdown(pipelineSel.options, messages.pipAction, globalSel.rename, messages.renamePip)
            cy.get("#customized-dialog-title p").should("have.text", messages.renamePip)
            butextField(pipelineSel.renamepiptextfield, "label").should("have.text", messages.renamePip)
            butextField(pipelineSel.renamepiptextfield, "input").should("have.value", pipLabel[0])
            cy.get(globalSel.helpertext).should("have.text", messages.existsPip1)
            buButton(globalSel.renametestid).should("be.disabled")

            // Rename the pipeline name
            butextField(pipelineSel.renamepiptextfield, "input").clear().type(editedPIpLabel);
            buButton(globalSel.renametestid).click()
            cy.get('.MuiSnackbarContent-message').should("have.text", messages.updated)
        })
    })

    it(`Pipeline already exist`, () => {
        cy.wait("@getPipeline", { timeout: 10000 }).then(({ response }) => {
            let pipLabel = response.body.result.values.map(ele => ele.label)
            budropdown(globalSel.settinglayoutbox, `button ${globalSel.buttonTypography}`, pipLabel[0])
            busimpledropdown(pipelineSel.options, messages.pipAction, globalSel.rename, messages.renamePip)
            butextField(pipelineSel.renamepiptextfield, "input").clear().type(pipLabel[1]);
            cy.get(globalSel.helpertext).should("have.text", messages.existsPip1);
            buButton(globalSel.renametestid).should("be.disabled").and("have.text", "Rename")
        })
    })
    it(`Pipeline name cant't be blank`, () => {
        cy.wait("@getPipeline", { timeout: 10000 }).then(({ response }) => {
            let pipLabel = response.body.result.values.map(ele => ele.label)
            budropdown(globalSel.settinglayoutbox, `button ${globalSel.buttonTypography}`, pipLabel[0])
            busimpledropdown(pipelineSel.options, messages.pipAction, globalSel.rename, messages.renamePip)
            butextField(pipelineSel.renamepiptextfield, "input").clear();
            cy.get(globalSel.helpertext).should("have.text", messages.blankPip);
            buButton(globalSel.renametestid).should("be.disabled").and("have.text", "Rename")
        })
    })
})