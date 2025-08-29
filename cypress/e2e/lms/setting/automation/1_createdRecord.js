const lead = require('../../../../selector/lead');
const { faker } = require('@faker-js/faker');
const { request, workflowSel, triggerSel, actionSel, verifyAutomation, editworkflowSel, workflowActionSel } = require('../../../../selector/utility')

describe.skip(`Test the functionality of Automation`, () => {
   let reqHeader
   let sourceQS
   let stageUrl = `${Cypress.env("apiurl")}/fms/stages`;
   // let storedToken

   beforeEach(() => {
      cy.intercept("GET", "**/fms/fields/list?*").as("fieldList")
      cy.intercept("GET", "**/fms/stages?*").as("getStage")
      cy.intercept("GET", "**/wms/workflows?*").as("getWorkflow")
      cy.intercept("POST", "**/wms/workflows*").as("workflow")
      // cy.session('user', () => {
      //    cy.login()
      // });
      // cy.checkAndRenewToken();
      // if (!Cypress.env('token')) {
      //    cy.readFile('cypress/fixtures/token.json').then((data) => {
      //       Cypress.env('token', data.apiToken);
      //       localStorage.setItem('authToken', data.apiToken);
      //    });
      // };
      cy.assetPipeline("lms")
      cy.visit(`${Cypress.env("lmsUrl")}/setting/triggers`)
   })

   it(`Create and verify automation :Trigger upon created and conditions apply to all records`, () => {
      let lmsPip_0 = Cypress.env("lmsIndexZeroPip");
      let lmsPip_1 = Cypress.env("lmsIndexFirstPip");
      reqHeader = { Authorization: `Bearer ${Cypress.env("token")}` };
      sourceQS = { "module": "lms", "asset": "lead", "catId": Cypress.env("lmsIndexZeroPipId") }
      cy.wait(2000)
      cy.get(':nth-child(6) > [style="flex-grow: 1;"] > .MuiButtonBase-root > .MuiListItemText-root > .MuiTypography-root').should("have.text", "Automation").click()
      cy.get('.MuiBox-root > .MuiTypography-caption').should("have.text", "Make use of automation to trigger, map, and arrange your asset’s fields into the desired asset.");
      cy.get(lead.typeBtn).contains("Add Automation").click({ force: true })
      // Workflow
      workflowSel(lmsPip_0)
      // Trigger
      triggerSel(lmsPip_0)
      // Condition
      cy.get('[name="All Record"]').should("be.checked")
      cy.get(':nth-child(3) > .MuiStepLabel-root .MuiButtonBase-root').contains("Next").click()
      cy.get('.MuiStepper-root > :nth-child(3) .MuiStepLabel-label :nth-child(2) p').contains("All Record")
      // Action
      actionSel(lmsPip_1)
      cy.wait("@fieldList").then(({ response }) => {
         let field_1 = response.body.result.values.filter(ele => ele.prop == "phn")
         let field_2 = response.body.result.values.filter(ele => ele.prop == "stg")
         cy.get(lead.chooseOptions).contains(field_1[0].label).click()
         cy.get('.MuiGrid-root .field button > :first').contains(field_1[0].label).click()
         cy.get('body').click(0, 0);
         cy.get('[data-testid="staticfieldcard-grid-agfa38xxl"]').click()
         cy.get(`${lead.chooseOptions}`).find(`[data-testid="${field_2[0].label}"]`).click()
         cy.componentLabel(lead.formLabel, "Stage", 'input').click()
         cy.get(`${lead.chooseOptions} > :nth-child(1)`).click()
         cy.get('#save').click()
         cy.wait(1000)
         cy.get('.MuiButton-contained').click()
         // Check applied automation 
         request("GET", stageUrl, reqHeader, sourceQS).then(({ body }) => {
            let stageId = body.result.values.map(ele => ele.id)
            verifyAutomation(field_1[0].id, field_2[0].id, stageId[0], sourceQS, Cypress.env("lmsIndexFirstPipId"));
            cy.wait("@workflow").then(({ response }) => {
               let workflowId = response.body.result.id
               let patchWorkflowUrl = `${Cypress.env("apiurl")}/wms/workflows/${workflowId}`;
               let updateBody = { "active": false }
               request("PATCH", patchWorkflowUrl, reqHeader, null, updateBody).then(({ body, status }) => {
                  expect(body).have.property("message", "Updated successfully.")
               })
            })
         })
      })
   })

   it(`Edit and verify automation :Trigger upon created and conditions apply to condition based on stage field`, () => {
      reqHeader = { Authorization: `Bearer ${Cypress.env("token")}` };
      sourceQS = { module: "lms", asset: "lead", catId: Cypress.env("lmsIndexZeroPipId") };
      cy.wait("@getWorkflow").then(({ response }) => {
         expect(response.body.result.values).be.length.greaterThan(0)
         let workflowLabel = response.body.result.values.map(ele => ele.label)
         let workflowId = response.body.result.values.map(ele => ele.id)
         cy.intercept("GET", `**/wms/workflows/${workflowId[0]}`).as("workflowDetail")
         cy.intercept("GET", `**/wms/actions/${workflowId[0]}`).as("getAction")
         cy.intercept("GET", `**/wms/conditions/${workflowId[0]}`).as("getConditions")
         workflowActionSel(1, 1, workflowLabel[0], "#edit");
         cy.wait("@workflowDetail", { timeout: 10000 }).then(({ response }) => {
            let sourceAsset = response.body.result.pipeline.label;
            let workLabel = response.body.result.label;
            let workDesc = response.body.result.description;
            editworkflowSel(sourceAsset, workLabel, workDesc);
            triggerSel(sourceAsset);
            // Condition
            cy.get('[value="specific"]').click()
            cy.get('[name="Field"]').click({ timeout: 10000 })
            cy.wait("@fieldList", { timeout: 10000 }).then(({ response }) => {
               let stage = response.body.result.values.filter(ele => ele.label == 'Stage')
               cy.wait("@getConditions").then(({ response }) => {
                  let conditionField = response.body.result.map(elem => elem.field);
                  if (conditionField.length == 0) {

                     cy.get(lead.chooseOptions).contains(stage[0].label).click({ force: true })
                     cy.get('[placeholder="Select a condition"]').should("have.value", "Is")
                     cy.get('[placeholder="Select stage"]').click()
                     cy.wait("@getStage").then(({ response }) => {
                        let stageName = response.body.result.values.map(ele => ele.label)
                        cy.get(lead.chooseOptions).contains(stageName[1]).click({ force: true })
                        cy.get(':nth-child(3) > .MuiStepLabel-root .MuiButtonBase-root').contains("Next").click()
                        cy.get('.MuiStepper-root > :nth-child(3) .MuiStepLabel-label :nth-child(2) p').contains(`${sourceAsset} matching certain conditions`)
                        cy.get('.MuiStepper-root > :nth-child(3) .MuiStepLabel-label :nth-child(3) p').as("verifyCondition").contains(`Stage`)
                        cy.get('@verifyCondition').contains(`Is`)
                        cy.get('@verifyCondition').contains(stageName[1])
                     });
                  } else if (stage[0].label == conditionField[0].label) {
                     cy.log(`${stage[0].label} already mapped in condition`)
                  }
               })
            });
         })

         cy.get('[aria-label="edit"]').first().click()
         cy.componentLabel(lead.formLabel, "Title", 'input').clear().type(faker.lorem.word(8))
         cy.wait("@fieldList").then(({ response }) => {
            let field_1 = response.body.result.values.filter(ele => ele.prop == "phn")
            let field_2 = response.body.result.values.filter(ele => ele.prop == "stg")
            let field_3 = response.body.result.values.filter(ele => ele.prop == "own")
            cy.get('.MuiGrid-container > :nth-child(1) button ').contains(field_1[0].label)
            // cy.get('[data-testid="add_row"]').click()
            cy.get('[data-testid="dynamicmapping-box-5cgc8mkm3"]')
               .find('[data-testid="withtooltip-div-3ron7uhye"]')
               .click()
            cy.get('.MuiGrid-root .field button').contains("Select").first().click()
            cy.get(lead.chooseOptions).contains(field_3[0].label).click()
            cy.get('.MuiGrid-root .field button').contains(field_3[0].label).first().next().click()
            cy.get('[data-testid="dynamicmapping-box-yl5khpt8x"]').contains('Mapped').click()
            cy.get('[data-testid="options"]').click()
            cy.get('.MuiInputBase-root:nth-child(1) > .MuiInputAdornment-root:nth-child(2) .MuiButtonBase-root').first().click()
            cy.get(`${lead.chooseOptions} > :nth-child(1)`).click()
            cy.get('#base_fields_mapping #save').click()
            cy.get(`[aria-label="${field_2[0].label}"]`).should("have.text", field_2[0].label)
            cy.get('[role="dialog"] #save').click()
            cy.wait(2000)
            cy.get('.MuiButton-contained').contains("Save").click()
            // Check applied automation 
            request("GET", stageUrl, reqHeader, sourceQS).then(({ body }) => {
               let stageId = body.result.values.map(ele => ele.id)
               verifyAutomation(field_1[0].id, field_2[0].id, stageId[1], sourceQS, Cypress.env("lmsIndexFirstPipId"));
            })
         });
      })
   });
});