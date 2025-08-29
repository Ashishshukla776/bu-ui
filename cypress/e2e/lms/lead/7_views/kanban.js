const lead = require('../../../../selector/lead')
const { faker } = require('@faker-js/faker')
const { setFieldOnViewConfig } = require('../../../../selector/utility');
const { onesecondWait, cyGet } = require('../../../../helpers/global');

describe(`Nevigate the lead page and test kanban view componet`, () => {

    const url = Cypress.env("url")
    const module = Cypress.env("module")
    const asset = Cypress.env("asset")
    let updatedUrl = url.replace("one", module);
    const assetName = asset.charAt(0).toUpperCase() + asset.slice(1)

    beforeEach(function () {
        cy.intercept("POST", `**/fms/pipelines/exists?*`).as("existPipeline")
        cy.intercept('POST', `**/rms/records/kanban?*`).as("recordKanben")
        cy.intercept("PATCH", `**/rms/records/kanban/stage?*`).as("kanbanStage")
        cy.intercept("POST", `**/rms/bulk-action/delete?*`).as("deleteRecord")
        cy.intercept("GET", `**/fms/views/kanban?*`).as("kanbanViewConfig")
        cy.intercept("PATCH", `**/fms/views/kanban?*`).as("kanbanViewEdit")
        if (asset === "contact") { this.skip() };
        cy.visit(`${updatedUrl}/${asset}s`)
        cyGet('#bu-layout [aria-label="Kanban view"]').click()
        cy.wait(1000)
    });

    // after(() => { cy.signOut() });

    it(`Verify uid field should be required and selected on kanban view`, () => {
        cy.wait("@existPipeline", { timeout: 10000 })
        cyGet('#fields').click()
        cyGet('#editKanbanViewCard').click()
        cy.wait("@kanbanViewConfig", { timeout: 10000 }).then(({ response }) => {
            const getKanbanResult = response.body.result
            const uidField = getKanbanResult.values.find(ele => ele.required === true)
            expect(uidField).has.property("label", `${assetName} Id`)
            expect(uidField).has.property("required", true)
            expect(uidField).has.property("selected", true)
            cyGet('[variant="standard"] [type="search"]').type(uidField?.label)
            cyGet(lead.chkbxOnfieldConfig).first().should("be.checked").and("be.disabled")
        })
    });

    it(`Add Field on Kanban view if selected field less than 5`, () => {
        cy.wait("@existPipeline", { timeout: 10000 })
        cyGet('#fields').click()
        cyGet('#editKanbanViewCard').click()
        cy.wait("@kanbanViewConfig", { timeout: 10000 }).then(({ response }) => {
            const getKanbanResult = response.body.result
            const selectedFields = getKanbanResult.selectedProperties
            if (selectedFields.length < 5) {
                const unselectedFields = getKanbanResult.values.find(ele => ele.selected === false);
                cy.log(JSON.stringify(selectedFields))
                cy.log(JSON.stringify(unselectedFields))
                setFieldOnViewConfig('[variant="standard"] [type="search"]', unselectedFields?.label, lead.chkbxOnfieldConfig);
                cyGet(lead.typeBtn).contains("Save").click()
            } else {
                cy.log(`5 field already selected`)
            }
        });
    });

    it(`Remove Field on Kanban view`, () => {
        cy.wait("@existPipeline", { timeout: 10000 })
        cyGet('#fields').click()
        cyGet('#editKanbanViewCard').click()
        cyGet('[data-rbd-droppable-id="column"]').children().then((childlength) => {
            let count = Cypress.$(childlength).length
            let nth = count - 1
            cy.log('option count: ', count);
            cyGet(`[data-rbd-droppable-id="column"] > :nth-child(${nth}) > :nth-child(1) > :nth-child(1) > :nth-child(2)`).click()
        })
        cyGet(lead.typeBtn).contains("Save").click()
    });

    it(`Card style: Compact`, () => {
        cy.wait("@existPipeline", { timeout: 10000 })
        cyGet('#fields').click()
        cyGet('#editKanbanViewCard').click()
        cyGet(`[name="compact"]`).then(($ele) => {
            if ($ele.is(':checked')) {
                cy.log(`Compact already checked`)
            } else { cy.wrap($ele).check() }
        })
        cyGet(lead.typeBtn).contains("Save").click()
        cy.wait("@recordKanben")
        cy.wait("@recordKanben", { timeout: 10000 }).then(({ response }) => {
            expect(response.body.result.config).have.property("cardStyle", "compact")
        })
    });

    it(`Card style: Default`, () => {
        cy.wait("@existPipeline", { timeout: 10000 })
        cyGet('#fields').click()
        cyGet('#editKanbanViewCard').click()
        cyGet(`[name="default"]`).then(($ele) => {
            if ($ele.is(':checked')) {
                cy.log(`Default already checked`)
            } else { cy.wrap($ele).check() }
        })
        cyGet(lead.typeBtn).contains("Save").click()
        cy.wait(1000)
        cy.wait("@recordKanben")
        cy.wait("@recordKanben", { timeout: 10000 }).then(({ response }) => {
            expect(response.body.result.config).have.property("cardStyle", "default")
        })
    });

    it(`Re-order field on kanban view config page`, () => {
        cy.wait("@existPipeline", { timeout: 10000 })
        cyGet('#fields').click()
        cyGet('#editKanbanViewCard').click()
        cy.wait("@kanbanViewConfig", { timeout: 10000 }).then(({ response }) => {
            let selectedProp = response.body.result.selectedProperties;
            expect(response.body.result.selectedProperties).be.length.greaterThan(2);
            cy.dragAndDrop(`[data-rbd-draggable-id="${selectedProp[1]}"]`, `[data-rbd-draggable-id="${selectedProp[2]}"]`);
            onesecondWait()
            cyGet(lead.typeBtn).contains("Save").click()
            cy.wait("@recordKanben")
            cy.wait("@recordKanben").then(({ response }) => {
                expect(response.body.result.config.fields[0]).have.property("id", selectedProp[2])
                expect(response.body.result.config.fields[1]).have.property("id", selectedProp[1])
            })
        })
    });

    it(`Should redirected to the create record form after clicking the "Add Lead" button`, () => {
        cy.wait("@existPipeline", { timeout: 10000 })
        cy.wait("@recordKanben", { timeout: 10000 }).then(({ response }) => {
            let stageOnKanban = response.body.result.displayOrder;
            let stageData = response.body.result.values[stageOnKanban[1]];
            cyGet(`[data-rbd-draggable-id="${stageOnKanban[1]}"] > :nth-child(1) > :nth-child(1)> :nth-child(1) > :nth-child(1)`).should("have.text", stageData.label);
            cyGet(`[data-rbd-draggable-id="${stageOnKanban[1]}"] > :nth-child(1) > :nth-child(4) button`).click()
            cy.componentLabel(lead.formLabel, "Mobile number", "input").type(faker.string.numeric(10))
            cy.componentLabel(lead.formLabel, "Stage", "span").should("have.text", stageData.label)
            cyGet(lead.saveBtn).click()
            cyGet('.MuiSnackbarContent-message').should("have.text", "Created successfully.")
        })
    });

    it('Drag and drop an item one stage to another stage', () => {
        cy.wait("@existPipeline", { timeout: 10000 })
        cy.wait("@recordKanben", { timeout: 10000 }).then(({ response }) => {
            let stageOnKanban = response.body.result.displayOrder;
            let stageData_1 = response.body.result.values[stageOnKanban[1]]
            let itemId_1 = stageData_1.items.map(ele => ele.id)
            cy.dragAndDrop(`[data-rbd-draggable-id="${itemId_1[0]}"]`, `[data-rbd-draggable-id="${stageOnKanban[0]}"]`);
            cy.wait(1000)
            cy.wait("@kanbanStage").then(({ response }) => {
                expect(response.body).have.property("message", "Updated successfully.")
                expect(response.body.result.source).have.property("id", stageOnKanban[1])
                expect(response.body.result.target).have.property("id", stageOnKanban[0])
            })
        })
    });

    it(`Should redirected to the detail page after clicking the "edit" button`, () => {
        cy.wait("@existPipeline", { timeout: 10000 })
        cy.wait("@recordKanben", { timeout: 10000 }).then(({ response }) => {
            let stageOnKanban = response.body.result.displayOrder;
            let stageData_1 = response.body.result.values[stageOnKanban[0]]
            let itemId_1 = stageData_1.items.map(ele => ele.id)
            cyGet(`[data-rbd-draggable-id="${itemId_1[0]}"] [aria-controls="more"]`).click()
            cyGet('[role="menu"] > :nth-child(1) > li').first().find("span").contains("Edit").click()
            cy.url().should("contain", `${updatedUrl}/${asset}s/${itemId_1[0]}`)
        })
    });

    it(`delete record from kanban view page`, () => {
        cy.wait("@existPipeline", { timeout: 10000 })
        cy.wait("@recordKanben", { timeout: 10000 }).then(({ response }) => {
            let dialogDecs = `Are you sure you want to delete this ${asset}?`
            let stageOnKanban = response.body.result.displayOrder;
            let stageData_1 = response.body.result.values[stageOnKanban[0]]
            let itemId_1 = stageData_1.items.map(ele => ele.id)
            cyGet(`[data-rbd-draggable-id="${itemId_1[0]}"] [aria-controls="more"]`).click()
            cyGet('[role="menu"] > :nth-child(1) > li').last().find("span").contains("Delete").click()
            cy.roleDialog(lead.dialogTitle, `Delete ${asset}`, lead.dialogDesc, dialogDecs, '#delete', "Delete");
            cy.wait("@deleteRecord").then(({ response }) => {
                expect(response.body).have.property("message", "Deleted successfully.")
            })
        })
    });
});

