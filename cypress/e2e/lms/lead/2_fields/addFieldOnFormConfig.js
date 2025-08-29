const lead = require('../../../../selector/lead')
const { busimpledropdown, butextField, buButton } = require('../../../../helpers/global');
const { method } = require('../../../../helpers/helper');
const url = Cypress.env("url")
const module = Cypress.env("module")
const asset = Cypress.env("asset")
let updatedUrl = url.replace("one", module);

describe(`Navigate on field config page`, () => {
    beforeEach(() => {

        cy.intercept(method.get, '**/fms/forms/config/create?*').as("fieldConfig")
        cy.visit(`${updatedUrl}/${asset}s`)
        cy.wait(2000)
        const assetName = asset.charAt(0).toUpperCase() + asset.slice(1)
        buButton(`[data-testid="Create ${assetName}"]`).click()
        // cy.get('[data-testid="Create Approval"]').click()
        // cy.get(lead.typeBtn).contains("Add fields").click()
        cy.get(`[data-testid="newtab-path-kag527has"]`).click({ force: true })
    })

    it(`Verify the presence of the "Attach Field", "Create field", "Cancel" and "Apply" button`, () => {

        cy.get('[data-testid="title-dialog"]').should("have.text", "Edit fields");
        cy.get('[data-testid="Attach field"]').should("have.attr", "type", "button").and("have.text", "Attach field")
        cy.get('[data-testid="Create field"]').should("have.attr", "type", "button").and("have.text", "Create field")
        cy.get('[data-testid="cancel"]').should("have.attr", "type", "button").and("have.text", "cancel")
        cy.get('[data-testid="Apply"]').should("have.attr", "type", "button").and("have.text", "Apply")

    })
    it('Verify the presence of the System required field on form config', () => {
        cy.wait('@fieldConfig').then((interception) => {
            const responseBody = interception.response.body;
            const values = responseBody.result.values;

            const filteredFields = values.filter(field => field.system && field.required);
            const labels = filteredFields.map(field => field.label);

            cy.log(labels.join(', '));
            cy.get('[data-testid="buformeditor-listitemtext-ofe56xosa"]').contains("System Fields");
            labels.forEach(label => {
                cy.get('[data-testid="buformeditor-textfield-ml5m9m9l0"] input[placeholder="Search..."]')
                    .clear({ force: true })
                    .type(label, { force: true });
                cy.get('[data-testid="propertylist-listitemtext-esgc2itka"]')
                    .first().should('have.text', label);
                cy.get('[data-testid="propertylist-checkbox-9qc6i0a6w"] input')
                    .should('have.attr', 'disabled')
                // .and('have.attr', 'checked');
            });
        });
    });

    it('Verify the System field should be checkable or uncheckable on form config', () => {
        cy.wait('@fieldConfig').then((interception) => {
            const responseBody = interception.response.body;
            const values = responseBody.result.values;

            const filteredFields = values.filter(field => field.system);
            const labels = filteredFields.map(field => field.label);

            cy.log(labels.join(', '));
            cy.get('[data-testid="buformeditor-listitemtext-ofe56xosa"]').contains("System Fields");
            labels.forEach(label => {
                cy.get('[data-testid="buformeditor-textfield-ml5m9m9l0"] input[placeholder="Search..."]')
                    .clear({ force: true })
                    .type(label, { force: true });
                cy.get('[data-testid="propertylist-listitemtext-esgc2itka"]')
                    .first().should('have.text', label);
                cy.get('[data-testid="propertylist-checkbox-9qc6i0a6w"] input').then($input => {
                    if ($input.is(':checked')) {
                        cy.wrap($input).uncheck({ force: true });
                    } else {
                        cy.wrap($input).check({ force: true });
                    }
                });
            });
        });
    });


    it.skip(`Select property and Make required and remove required and de-select property `, () => {
        //Check field from field config, make required and add on form config

        cy.wait("@fieldConfig").then(({ response }) => {
            let fieldData = response.body.result.values.filter(item => item.system === false).slice(-1)
            let fieldId = fieldData[0].id.toString()
            let fieldName = fieldData[0].label.toString()
            cy.get('.MuiFormControl-root [placeholder="Search..."]').type(fieldName)
            cy.get(':nth-child(1) > .MuiListItem-root > .MuiFormControlLabel-root input').check()
            cy.get(`[data-rbd-droppable-id="column"]`).children(`[data-rbd-draggable-id=${fieldId}]`).contains(fieldName)
        })

        // cy.get(':nth-child(1) > .MuiListItem-root > .MuiFormControlLabel-root input').check()
        // cy.get('.MuiGrid-item > :last')

        // cy.get('.MuiFormControl-root [placeholder="Search..."]')
        // .type(Cypress.env("fieldName"))
        // cy.get('input[name="checkedB"]').check(fieldName)
        // cy.get('[data-rbd-droppable-id="column"]').find('[type="checkbox"]').last().check()
        // cy.get(lead.typeBtn).contains("Apply").click()
        // cy.get('#create-lead .MuiFormControl-root label').contains(Cypress.env("fieldName"))
        // cy.get(`#create-lead .MuiFormControl-root [placeholder='Enter ${Cypress.env("fieldName")}']`).
        //     should("have.attr", "required")

        // //uncheck the field from field config

        // cy.get(lead.typeBtn).contains("Add fields").click()
        // cy.get('[data-rbd-droppable-id="column"]').find('[type="checkbox"]').last().uncheck()
        // cy.get('.MuiFormControl-root [placeholder="Search..."]').type(Cypress.env("fieldName"))
        // cy.get('input[name="checkedB"]').uncheck()
        // cy.get(lead.typeBtn).contains("Apply").click()
    })
})
