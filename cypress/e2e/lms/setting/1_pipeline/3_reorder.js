const { buButton, buCaption, busimpledropdown } = require("../../../../helpers/global");
const { method } = require("../../../../helpers/helper");
const messages = require("../../../../helpers/messages");
const globalSel = require("../../../../selector/globalSel");
const pipelineSel = require("../../../../selector/pipelineSel");

const url = Cypress.env("url")
const module = Cypress.env("module")
const asset = Cypress.env("asset")
let updatedUrl = url.replace("one", module);


describe('Navigate the setting page and reorder pipeline', () => {
    beforeEach(function () {
        cy.intercept(method.get, '**/fms/pipelines?*').as("getPipeline");
        if (asset === "contact") { this.skip() };
        cy.visit(`${updatedUrl}/setting/${asset}`)
    });

    it('Reorder pipeline', () => {
        const movements = 1;
        const subHeadingText = `You can Create/ Rename/ Delete Pipeline for ${asset} only.`
        buCaption(pipelineSel.captionbox, pipelineSel.captionHeading, `${asset}s`, pipelineSel.captionSubHeading, subHeadingText)
        // cy.get("#app-routes p").contains("leads")
        // cy.get('.MuiTypography-caption').contains("You can Create/ Rename/ Delete Pipeline for lead only.")
        cy.wait(1000)

        busimpledropdown(pipelineSel.options, messages.pipAction, globalSel.reorder, messages.reorderPip)

        // cy.get('.MuiPaper-root > :nth-child(2) > div > .MuiButtonBase-root').should("have.text", "Options").click()
        // cy.get("#reorder").click()
        // get the pipeline-id using intercept and wait method
        cy.wait("@getPipeline").then(({ response }) => {
            let pipId = response.body.result.values.map(ele => ele.id)
            cy.get(`[data-rbd-draggable-id=${pipId[0]}]`).as('item');
            cy.get('@item').invoke('attr', 'data-rbd-drag-handle-draggable-id').as('item-id');
            cy.get('@item').invoke('attr', 'tabindex').as('item-index').should('equal', '0');
            // lift the element
            cy.get('@item').focus().trigger('keydown', { keyCode: 32 })
                .get('@item');  // need to re-query for a clone
            cy.wrap(Array.from({ length: movements })).each(() => {
                cy.get('@item').trigger('keydown', { keyCode: 40, force: true })
                    .wait(1000);
            });
            // drop an element
            cy.get('@item').trigger('keydown', { keyCode: 32, force: true });
            cy.get('@item-id').then(() => {
                cy.get(`[data-rbd-draggable-id=${pipId[0]}]`).invoke('attr', 'tabindex')
            });
            // cy.get('#cancel').should("have.text", "Cancel")
            // cy.get("#save").click()
            buButton(globalSel.canceltestid).should("have.text", "Cancel")
            buButton(globalSel.savetestid).should("have.text", "Save").click({ force: true })
        })
    });
});