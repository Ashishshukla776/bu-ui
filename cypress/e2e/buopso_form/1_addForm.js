// const { faker } = require('@faker-js/faker')
// const lead = require('../../../../selector/lead')
// const { createRecordScript } = require('../../../../helpers/record')

const { labelNplaceholder } = require("../../helpers/field");
const { cyGet, buSaveButton, onesecondWait, twosecondWait } = require("../../helpers/global");

// const { cyGet } = require('../../../../helpers/global')
describe(`Nevigate the lead page and Create Lead`, () => {

    const url = Cypress.env("url");
    const module = Cypress.env("module");
    const asset = Cypress.env("asset");
    let updatedUrl = url.replace("one", module);
    let userRole;
    let createAccess;
    let pipelineIds;

    beforeEach(function () {
        cy.intercept("GET", `**/crew/users/app-auth?*`).as("appAuth")
        cy.visit(`${updatedUrl}/${asset}s`)
        cy.wait("@appAuth", { timeout: 10000 }).then(({ response }) => {
            userRole = response.body.result.user.role
            if (userRole === "std") { this.skip() }
        });
        cyGet('[data-testid="buelementgroup-box-n1f8dc7ag"]').find('[aria-label="Grid view"] button').click();

        cy.wait(1000)
    })

    it(`Add Form`, () => {
        const strLabel = `Single line ${new Date().valueOf()}`
        const txaLabel = `Multi line ${new Date().valueOf()}`

        cyGet('[data-testid="Add Form"]').click()
        cyGet('[aria-label="Field type"]').click()

        const strDraggable = '[data-rbd-drag-handle-draggable-id="newField@str"]';
        const txaDraggable = '[data-rbd-drag-handle-draggable-id="newField@txa"]';
        const droppable = '[role="tabpanel"] [data-rbd-droppable-id="new-container"]';

        // Drag and Drop single line field
        cy.dragAndDrop(strDraggable, droppable)
        onesecondWait()
        labelNplaceholder(strLabel, `Enter ${strLabel}`)
        cyGet(`[role="dialog"] [data-testid="Save"]`).click()
        twosecondWait()
        // Drag and Drop multi line field
        cy.dragAndDrop(txaDraggable, droppable)
        onesecondWait()
        labelNplaceholder(txaLabel, `Enter ${txaLabel}`)
        cyGet(`[role="dialog"] [data-testid="Save"]`).click()
        twosecondWait()
        // save form
        buSaveButton().click()
    });
});
