const lead = require('../../../../selector/lead')
const { faker } = require('@faker-js/faker')
const { setFieldOnViewConfig, request } = require('../../../../selector/utility')
const { cyGet, onesecondWait } = require('../../../../helpers/global')


describe(`Nevigate the lead page and test grid view componet`, () => {
    const url = Cypress.env("url")
    const module = Cypress.env("module")
    const asset = Cypress.env("asset")
    let updatedUrl = url.replace("one", module);
    const moduleName = module.toUpperCase()

    beforeEach(() => {
        cy.intercept('POST', `**/rms/records/grid?*`).as("recordGrid")
        cy.intercept("POST", `**/fms/pipelines/exists?*`).as("existPipeline")
        cy.intercept("POST", `**/rms/bulk-action/delete?*`).as("deleteRecord")
        cy.intercept("GET", `**/fms/views/grid?*`).as("gridViewConfig")
        cy.intercept("PATCH", `**/fms/views/kanban?*`).as("kanbanViewEdit")
        cy.visit(`${updatedUrl}/${asset}s`)
        cyGet('#bu-layout [aria-label="Grid view"]').click()
    });

    it(`Add Field on grid view`, () => {

        cy.wait("@existPipeline", { timeout: 10000 }).then(({ response }) => {
            const { label, catId } = response.body.result
            cyGet('#fields').click()
            cyGet('#editCol').click()
            cy.wait("@gridViewConfig", { timeout: 10000 }).then(({ response }) => {
                const allGroup = response.body.result.values.filter(ele => ele.group === label);
                const selectedField = response.body.result.selectedProperties;
                const lastIndexfield = allGroup.slice(-1);
                if (selectedField.length >= 20) {
                    const attachFieldOnView = selectedField.slice(0, 10);
                    const apiUrl = Cypress.env("apiurl");
                    const gridViewUrl = `${apiUrl}/fms/views/grid`;
                    const reqQs = { module, asset, "catId": catId };
                    const reqHeader = { Authorization: "Bearer " + Cypress.env("token") };
                    const payload = { fields: [...attachFieldOnView] }
                    request("PATCH", gridViewUrl, reqHeader, reqQs, payload).then(({ body }) => {
                        expect(body).to.have.property("success", true);
                    })
                    cyGet(`[data-testid="cancel"]`).click()
                    cyGet('#fields').click()
                    cyGet('#editCol').click()
                }
                setFieldOnViewConfig('[role="dialog"] [type="text"]', lastIndexfield[0].label, lead.chkbxOnfieldConfig)
                cyGet(lead.typeBtn).contains("Apply").click()
                cyGet('.MuiSnackbarContent-message').should("have.text", "Updated successfully.")
                cy.wait("@recordGrid")
                cy.wait("@recordGrid").then(({ response }) => {
                    let fieldView = response.body.result.view.columns.filter(ele => ele.label == lastIndexfield[0].label)
                    expect(fieldView[0].label).to.eq(lastIndexfield[0].label)
                });
            });
        });
    });

    it(`Remove Field from grid view`, () => {
        cy.wait("@existPipeline", { timeout: 10000 }).then(({ response }) => {
            let pipName = response.body.result.label;
            cyGet('#fields').click()
            cyGet('#editCol').click()
            cy.wait("@gridViewConfig", { timeout: 10000 }).then(({ response }) => {
                let allGroup = response.body.result.values.filter(ele => ele.group == pipName)
                let lstindexfield = allGroup.slice(-1)
                cy.get('[role="dialog"] [type="text"]').clear().type(lstindexfield[0].label)
                cy.get('.MuiBox-root > .MuiListItem-root input').first().then(($ele) => {
                    if ($ele.is(':checked')) {
                        cy.wrap($ele).first().click()
                    } else {
                        cy.wrap($ele).first().click()   //check then
                        cy.wrap($ele).first().click()   // uncheck
                    }
                })
                cy.get(lead.typeBtn).contains("Apply").click()
                cy.get('.MuiSnackbarContent-message').should("have.text", "Updated successfully.")
                cy.wait("@recordGrid")
                cy.wait("@recordGrid").then(({ response }) => {
                    let fieldView = response.body.result.view.columns.map(ele => ele.label)
                    fieldView.forEach((ele) => {
                        expect(ele).be.not.eq(lstindexfield[0].label)
                    })
                })
            })
        })

    });

    it(`Re-order field on grid view config page`, function () {
        cy.wait("@existPipeline", { timeout: 10000 }).then(() => {
            cyGet('#fields').click();
            cyGet('#editCol').click();
            cy.wait("@gridViewConfig", { timeout: 10000 }).then(({ response }) => {
                let selectedProp = response.body.result.selectedProperties;
                if (selectedProp.length > 3) {
                    cy.dragAndDrop(`[data-rbd-draggable-id="${selectedProp[1]}"]`, `[data-rbd-draggable-id="${selectedProp[2]}"]`);
                    onesecondWait()
                    cyGet(lead.typeBtn).contains("Apply").click()
                    cy.wait("@recordGrid")
                    cy.wait("@recordGrid").then(({ response }) => {
                        expect(response.body.result.view.columns[1]).have.property("id", selectedProp[2])
                        expect(response.body.result.view.columns[2]).have.property("id", selectedProp[1])
                    })
                } else { this.skip() }
            })
        });

    });

    it(`Redirect on field setting page after clicking on "manage field" button`, () => {
        cy.wait("@existPipeline", { timeout: 10000 })
        cyGet('#fields').click()
        cyGet('#editCol').click()
        cyGet(`[data-testid="Manage fields"]`).contains("Manage fields").click()
        cy.url().should("eq", `${updatedUrl}/setting/properties`)
        cyGet('.MuiTypography-caption').contains(`Fields store information about ${moduleName}.`)
    });

    // it.skip('Column drag and drop', () => {
    //     cy.get('#bu-layout [aria-label="Grid view"]').click()
    //     // cy.wait("@recordGrid").then(({ response }) => {
    //         // let stageOnKanban = response.body.result.displayOrder;
    //         // let stageData_1 = response.body.result.values[stageOnKanban[1]]
    //         // let itemId_1 = stageData_1.items.map(ele => ele.id)
    //         cy.dragAndDrop(`table thead > :nth-child(1) > :nth-child(3)`, `table thead > :nth-child(1) > :nth-child(4)`);
    //         cy.wait(2000)
    //         // cy.wait("@kanbanStage").then(({ response }) => {
    //         //     expect(response.body).have.property("message", "Updated successfully.")
    //         //     expect(response.body.result.source).have.property("id", stageOnKanban[1])
    //         //     expect(response.body.result.target).have.property("id", stageOnKanban[0])
    //         // })
    //     // })
    // });

    it(`Should redirected to the detail page`, () => {
        cy.wait("@recordGrid").then(({ response }) => {
            const recordId = response.body.result.values[0].id;
            const uidField = response.body.result.view.columns.find(ele => ele.prop === "uid");
            const uidFieldValue = response.body.result.values[0][uidField.id];
            cy.contains(`tr`, uidFieldValue).find(`td`).contains(uidFieldValue).click({ force: true });
            cy.url().should("contain", `${updatedUrl}/${asset}s/${recordId}`);
        })
    });
});

