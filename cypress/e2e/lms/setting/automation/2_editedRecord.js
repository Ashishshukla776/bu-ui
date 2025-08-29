const { faker } = require('@faker-js/faker');
const lead = require('../../../../selector/lead')
const { request, editworkflowSel, workflowActionSel } = require('../../../../selector/utility')

describe.skip(`Test the functionality of Automation`, () => {
    let reqHeader

    beforeEach(() => {
        cy.intercept("GET", "**/fms/fields/list?*").as("fieldList")
        cy.intercept("GET", "**/fms/stages?*").as("getStage")
        // cy.intercept("GET", "**/fms/stages?*").as("sourceStage")
        cy.intercept("GET", "**/wms/workflows?*").as("getWorkflow")
        //  cy.session('user', () => { cy.login() });
        cy.assetPipeline("lms")
        cy.visit(`${Cypress.env("lmsUrl")}/setting/triggers`)
    })

    it(`Trigger upon edited all record and conditions apply to all records`, () => {
        reqHeader = { Authorization: `Bearer ${Cypress.env("token")}` };

        cy.wait("@getWorkflow").then(({ response }) => {
            expect(response.body.result.values).be.length.greaterThan(0)
            let workflowLabel = response.body.result.values.map(ele => ele.label)
            let workflowId = response.body.result.values.map(ele => ele.id)
            cy.intercept("GET", `**/wms/workflows/${workflowId[0]}`).as("workflowDetail")
            cy.intercept("GET", `**/wms/actions/${workflowId[0]}`).as("getAction")
            workflowActionSel(1, 1, workflowLabel[0], "#edit");
            cy.wait("@workflowDetail", { timeout: 10000 }).then(({ response }) => {
                let sourceAsset = response.body.result.pipeline.label;
                let sourceAssetId = response.body.result.pipeline.id;
                let workLabel = response.body.result.label;
                let workDesc = response.body.result.description;
                editworkflowSel(sourceAsset, workLabel, workDesc);
                cy.get('input[name="Edited"]').click()
                cy.get('input[value="all"]').click()
                cy.get(':nth-child(2) > .MuiStepLabel-root .MuiButtonBase-root').contains("Next").click()

                cy.get('[name="All Record"]').click()
                cy.get(':nth-child(3) > .MuiStepLabel-root .MuiButtonBase-root').contains("Next").click()
                cy.get('.MuiStepper-root > :nth-child(3) .MuiStepLabel-label :nth-child(2) p').contains("All Record")
                cy.get("@getAction").then(({ response }) => {
                    let actionId = response.body.result.map(ele => ele.id)
                    expect(response.body.result).to.be.length.greaterThan(0)
                    cy.intercept("GET", `**/wms/actions/detail/${actionId[0]}`).as("actionDetail")
                    cy.get('[aria-label="edit"]').first().click()
                    cy.wait("@fieldList").then(({ response }) => {
                        let field_1 = response.body.result.values.filter(ele => ele.prop == "phn")
                        cy.wait("@actionDetail").then(({ response }) => {
                            let destAssetId = response.body.result.pipeline.id
                            // Check applied automation 
                            let gridUrl = `${Cypress.env("apiurl")}/rms/records/grid`
                            let sourceQS = { "module": "lms", "asset": "lead", "catId": sourceAssetId }
                            request("POST", gridUrl, reqHeader, sourceQS).then(({ body }) => {
                                let reordId = body.result.values.map(ele => ele.id)
                                let mob = faker.string.numeric(10)
                                let reqBody = { [field_1[0].id]: mob }
                                let editrecordUrl = `${Cypress.env("apiurl")}/rms/records/${reordId[0]}`
                                request("PATCH", editrecordUrl, reqHeader, sourceQS, reqBody).then(({ body }) => {
                                    cy.wait(15000)
                                    let destQS = { "module": "lms", "asset": "lead", "catId": destAssetId }
                                    request("POST", gridUrl, reqHeader, destQS).then(({ body }) => {
                                        expect(body.result.values[0]).have.property(field_1[0].id, mob)
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })

    it(`Trigger upon edited Specific field and conditions apply to specific field`, () => {
        reqHeader = { Authorization: `Bearer ${Cypress.env("token")}` };
        cy.wait("@getWorkflow").then(({ response }) => {
            expect(response.body.result.values).be.length.greaterThan(0)
            let workflowLabel = response.body.result.values.map(ele => ele.label)
            let workflowId = response.body.result.values.map(ele => ele.id)
            cy.intercept("GET", `**/wms/workflows/${workflowId[0]}`).as("workflowDetail")
            cy.intercept("GET", `**/wms/actions/${workflowId[0]}`).as("getAction")
            workflowActionSel(1, 1, workflowLabel[0], "#edit");
            cy.wait("@workflowDetail", { timeout: 10000 }).then(({ response }) => {
                let sourceAsset = response.body.result.pipeline.label;
                let sourceAssetId = response.body.result.pipeline.id;
                let workLabel = response.body.result.label;
                let workDesc = response.body.result.description;
                editworkflowSel(sourceAsset, workLabel, workDesc);
                // Trigger
                cy.get('input[name="Edited"]').click()
                cy.get('input[value="all"]').click()
                cy.get('input[value="specific"]').click()
                cy.get('input[name="Choose a field"]').click()
                cy.get(lead.chooseOptions).contains("Stage").click()
                cy.get(':nth-child(2) > .MuiStepLabel-root .MuiButtonBase-root').contains("Next").click()

                // cy.wait(1000)
                // Conditions
                cy.get('[value="specific"]').click()
                cy.get('[name="Field"]').first().click()
                cy.get(lead.chooseOptions).contains("Stage").click()
                cy.get('[name="Condition"]').should("have.value", "Is")
                cy.get('[placeholder="Select stage"]').click()
                cy.wait("@getStage").then(({ response }) => {
                    let stageData = response.body.result.values.slice(-1);
                    if (response.body.result.values.length > 5) {
                        cy.get('[role="tooltip"] [placeholder="Search..."]').type(stageData[0].label)
                    }
                    cy.get(`${lead.chooseOptions}`).contains(stageData[0].label).click()
                    cy.get(`[aria-label="Add"]`).click()
                    cy.get('[name="Field"]').last().click()
                    cy.get(lead.chooseOptions).contains("Owner").click()
                    cy.get('[name="Condition"]').last().click()
                    cy.get(lead.chooseOptions).contains("Isn't").click()
                    cy.get('[placeholder="Select owner"]').click()
                    cy.get(`${lead.chooseOptions} > :nth-child(1)`).click()
                    cy.get(':nth-child(3) > .MuiStepLabel-root .MuiButtonBase-root').contains("Next").click()
                    // cy.get('.MuiStepper-root > :nth-child(3) .MuiStepLabel-label :nth-child(2) p').contains("All Record")
                    cy.get("@getAction").then(({ response }) => {
                        let actionId = response.body.result.map(ele => ele.id)
                        expect(response.body.result).to.be.length.greaterThan(0)
                        cy.intercept("GET", `**/wms/actions/detail/${actionId[0]}`).as("actionDetail")
                        cy.get('[aria-label="edit"]').first().click()
                        cy.wait("@fieldList").then(({ response }) => {
                            let field_1 = response.body.result.values.filter(ele => ele.prop == "phn")
                            let field_2 = response.body.result.values.filter(ele => ele.prop == "stg")
                            cy.wait("@actionDetail").then(({ response }) => {
                                let destAssetId = response.body.result.pipeline.id
                                // Check applied automation 
                                let gridUrl = `${Cypress.env("apiurl")}/rms/records/grid`
                                let sourceQS = { "module": "lms", "asset": "lead", "catId": sourceAssetId }
                                request("POST", gridUrl, reqHeader, sourceQS).then(({ body }) => {
                                    let reordId = body.result.values.map(ele => ele.id)
                                    let mob = faker.string.numeric(10)
                                    let reqBody = { [field_1[0].id]: mob, [field_2[0].id]: stageData[0].id }
                                    let editrecordUrl = `${Cypress.env("apiurl")}/rms/records/${reordId[0]}`
                                    request("PATCH", editrecordUrl, reqHeader, sourceQS, reqBody).then(({ body }) => {
                                        cy.wait(15000)
                                        let destQS = { "module": "lms", "asset": "lead", "catId": destAssetId }
                                        request("POST", gridUrl, reqHeader, destQS).then(({ body }) => {
                                            expect(body.result.values[0]).have.property(field_1[0].id, mob)
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })
});