const { faker } = require('@faker-js/faker')
const { method } = require('../../../../helpers/helper');
const { busimpledropdown, butextField, buButton } = require('../../../../helpers/global');
const pipelineSel = require('../../../../selector/pipelineSel');
// const global = require('../../../../selector/globalSel');
const messages = require('../../../../helpers/messages');
const globalSel = require('../../../../selector/globalSel');
const url = Cypress.env("url")
const module = Cypress.env("module")
const asset = Cypress.env("asset")
let updatedUrl = url.replace("one", module);

describe(`Nevigate the setting page and create pipeline`, () => {
    beforeEach(function () {
        cy.intercept(method.get, '**/fms/pipelines?*').as("getPipeline");
        if (asset === "contact") { this.skip() };
        cy.visit(`${updatedUrl}/setting/${asset}`)
        cy.wait(2000)
    });

    it(`Pipeline name can't be blank`, () => {
        busimpledropdown(pipelineSel.options, messages.pipAction, globalSel.create, messages.newPip)
        butextField(pipelineSel.piptextfield, "input").click()
        cy.get('.MuiFormHelperText-root').should("contain", `${messages.blankPip}.`)
        buButton(globalSel.savetestid).should("be.disabled").click({ force: true })
        cy.get('.MuiTooltip-tooltip').should("contain", `${messages.blankPip}.`)
    });

    it(`Pipeline already exist `, () => {
        cy.wait("@getPipeline").then(({ response }) => {
            let piplabel = response.body.result.values[0].label
            busimpledropdown(pipelineSel.options, messages.pipAction, globalSel.create, messages.newPip)
            butextField(pipelineSel.piptextfield, "input").type(piplabel)
        });
        cy.get('.MuiFormHelperText-root').should("have.text", messages.existsPip)
        buButton(globalSel.savetestid).should("be.disabled").click({ force: true })
        cy.get('.MuiTooltip-tooltip').should("contain", messages.existsPip)
    });

    it(`Add new pipeline`, () => {
        busimpledropdown(pipelineSel.options, messages.pipAction, globalSel.create, messages.newPip)
        butextField(pipelineSel.piptextfield, "input").type(`${faker.commerce.product()}-${new Date().valueOf()}`)
        buButton(globalSel.savetestid).should("not.be.disabled").click()
    });

    it.skip(`Should pipeline selectable`, () => {
        cy.wait("@getPipeline").then(({ response }) => {
            let pipelines = response.body.result.values;
            let lastPip = pipelines[pipelines.length - 1].label;

            // cy.log(`Total Pipelines: ${pipelines.length}`);
            // cy.log(`Last Item: ${lastPip}`);

            if (pipelines.length > 5) {
                cy.get('[data-testid="pipeline-box-hlum28yao"] > [data-testid="budropdown-box-ty1opau5a"] > [data-testid="button-box-72cmtvy8r"] > .MuiButtonBase-root > .MuiButton-icon > [data-testid="button-stack-alorzfaoj"] > [data-testid="busvgicon-svgicon-5xuxnhkcv"]').click()
                cy.get('[data-testid="searchbox-textfield-8k19ikenc"]').type(lastPip);
            } else {
                cy.get('[data-testid="pipeline-box-hlum28yao"] > [data-testid="budropdown-box-ty1opau5a"] > [data-testid="button-box-72cmtvy8r"] > .MuiButtonBase-root > .MuiButton-icon > [data-testid="button-stack-alorzfaoj"] > [data-testid="busvgicon-svgicon-5xuxnhkcv"]').click()
                cy.contains(lastPip).click();
            }
        });

    });
});