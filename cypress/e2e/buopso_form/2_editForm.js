const { labelNplaceholder } = require("../../helpers/field");
const { cyGet, buSaveButton, onesecondWait, twosecondWait } = require("../../helpers/global");

// const { cyGet } = require('../../../../helpers/global')
describe(`Nevigate the form module and edit form`, () => {

    const url = Cypress.env("url");
    const module = Cypress.env("module");
    const asset = Cypress.env("asset");
    let updatedUrl = url.replace("one", module);
    let userRole;
    let createAccess;
    let pipelineIds;

    beforeEach(function () {
        cy.intercept("GET", `**/crew/users/app-auth?*`).as("appAuth")
        cy.intercept("POST", `**/rms/records/grid?*`).as("recordsGrid")
        cy.visit(`${updatedUrl}/${asset}s`)
        cy.wait("@appAuth", { timeout: 10000 }).then(({ response }) => {
            userRole = response.body.result.user.role
            if (userRole === "std") { this.skip() }
        });
        cyGet('[data-testid="buelementgroup-box-n1f8dc7ag"]').find('[aria-label="Grid view"] button').click();

        cy.wait(1000)
    })

    it(`Edit Form`, () => {
        const basLabel = `Phone ${new Date().valueOf()}`
        const chkLabel = `Email ${new Date().valueOf()}`

        // cyGet('[data-testid="Add Form"]').click()
        // cyGet('[aria-label="Field type"]').click()

        const basDraggable = '[data-rbd-drag-handle-draggable-id="newField@phn"]';
        const chkDraggable = '[data-rbd-drag-handle-draggable-id="newField@eml"]';
        const droppable = '[role="tabpanel"] [data-rbd-droppable-id="new-container"]';

        cy.wait("@recordsGrid", { timeout: 10000 }).then(({ response }) => {
            const uidField = response.body.result.view.columns.find(fld => fld.prop === "uid")
            const formId = response.body.result.values[0][uidField.id]
            cy.contains('tr', formId).find(`[data-testid="Action"]`).click();
            cyGet(`#edit`).click()

            cyGet('[aria-label="Field type"]').click()
            // Drag and Drop dropdown field
            cy.dragAndDrop(basDraggable, droppable)
            onesecondWait()
            labelNplaceholder(basLabel, `Enter ${basLabel}`)
            cyGet(`[role="dialog"] [data-testid="Save"]`).click()
            twosecondWait()
            // Drag and Drop checkbox field
            cy.dragAndDrop(chkDraggable, droppable)
            onesecondWait()
            labelNplaceholder(chkLabel, `Enter ${chkLabel}`)
            cyGet(`[role="dialog"] [data-testid="Save"]`).click()
            twosecondWait()
            // save form
            buSaveButton().click()
        });
    })
}) 
