const { buCaption, buSaveButton, cyGet } = require('../../../../helpers/global');
const { method } = require('../../../../helpers/helper');
const messages = require('../../../../helpers/messages');
const globalSel = require('../../../../selector/globalSel');
const pipelineSel = require('../../../../selector/pipelineSel');

describe('Navigate the setting page and reorder stage', () => {
    const url = Cypress.env("url")
    const module = Cypress.env("module")
    const asset = Cypress.env("asset")
    const updatedUrl = url.replace("one", module);

    beforeEach(function () {
        cy.intercept(method.get, '**/fms/stages?*').as("getStage");
        if (asset === "contact") { this.skip() };
        cy.visit(`${updatedUrl}/setting/${asset}`)
    });

    it('Reorder stage', () => {
        const movements = 1;
        const subHeadingText = `You can Create/ Rename/ Delete Pipeline for ${asset} only.`
        buCaption(pipelineSel.captionbox, pipelineSel.captionHeading, `${asset}s`, pipelineSel.captionSubHeading, subHeadingText)
        cy.wait("@getStage").then(({ response }) => {
            const stageId = response.body.result.values.map(ele => ele.id)
            expect(response.body.result.values).to.be.length.greaterThan(1)
            if (stageId.length > 1) {
                cyGet(`[data-rbd-draggable-id=${stageId[0]}]`).as('item');
                cy.get('@item').invoke('attr', 'data-rbd-drag-handle-draggable-id').as('item-id');
                cy.get('@item').invoke('attr', 'tabindex').as('item-index').should('equal', '0');
                // lift the element
                cy.get('@item').focus().trigger('keydown', { keyCode: 32, position: "left" })
                    .get('@item');  // need to re-query for a clone
                cy.wrap(Array.from({ length: movements })).each(() => {
                    cy.get('@item').trigger('keydown', { keyCode: 40, force: true }).wait(1000);
                });
                // drop an element
                cy.get('@item').trigger('keydown', { keyCode: 32, force: true });
                cy.get('@item-id').then(() => {
                    cyGet(`[data-rbd-draggable-id=${stageId[0]}]`).invoke('attr', 'tabindex');
                });
                buSaveButton().should("have.text", "Save").click();
                cyGet(globalSel.SnackbarMessage).invoke('text').should('include', messages.requestSuccess)
            } else {
                cy.log(`Stage must be more than 1 but stage found: ${stageId.length}`)
            }

        });
    });
});