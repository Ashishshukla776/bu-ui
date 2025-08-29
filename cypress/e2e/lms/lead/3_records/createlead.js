const { faker } = require('@faker-js/faker')
const lead = require('../../../../selector/lead')
const { createRecordScript } = require('../../../../helpers/record')
const { cyGet } = require('../../../../helpers/global')
describe(`Nevigate the lead page and Create Lead`, () => {

    const url = Cypress.env("url");
    const module = Cypress.env("module");
    const asset = Cypress.env("asset");
    let updatedUrl = url.replace("one", module);
    let userRole;
    let createAccess;
    let pipelines;

    beforeEach(() => {
        cy.intercept(`**/lens/records/activities?*`).as("activity")
        cy.intercept("GET", `**/crew/users/app-auth?*`).as("appAuth")
        cy.intercept("POST", `**/fms/pipelines/exists?*`).as("existsPipeline")
        cy.intercept("GET", `**/fms/forms/create?*`).as("getfieldOnForm")
        cy.intercept('GET', '**/fms/pipelines?*').as("getPipeline")
        cy.visit(`${updatedUrl}/${asset}s`)
        cyGet('[data-testid="buelementgroup-box-n1f8dc7ag"]').find('[aria-label="Grid view"] button').click();

        cy.wait("@appAuth", { timeout: 10000 }).then(({ response }) => {
            userRole = response.body.result.user.role
        })
        cy.wait("@existsPipeline", { timeout: 10000 }).then(({ response }) => {
            createAccess = response.body.result.tools.create
        })
        cyGet(`[data-testid="butoolbar-grid-2yad1y8r5"] [data-testid="budropdown-box-ty1opau5a"] button`).click({ force: true })
        cy.wait("@getPipeline", { timeout: 10000 }).then(({ response }) => {
            pipelines = response.body.result.values
        });

    })

    context("Create record", () => {

        it(`Create record with "str" field`, () => { createRecordScript(["str"], userRole, createAccess, pipelines) });
        it(`Create record with "phn" field`, () => { createRecordScript(["phn"], userRole, createAccess, pipelines) });
        it(`Create record with "num" field`, () => { createRecordScript(["num"], userRole, createAccess, pipelines) });
        it(`Create record with "txa" field`, () => { createRecordScript(["txa"], userRole, createAccess, pipelines) });
        it(`Create record with "eml" field`, () => { createRecordScript(["eml"], userRole, createAccess, pipelines) });
        it(`Create record with "url" field`, () => { createRecordScript(["url"], userRole, createAccess, pipelines) });
        it(`Create record with "bas" field`, () => { createRecordScript(["bas"], userRole, createAccess, pipelines) });
        // it(`Create record with "rtg" field`, () => { createRecordScript(["rtg"], userRole, createAccess, pipelines) });
        it(`Create record with "dsrc" field`, () => { createRecordScript(["dsrc"], userRole, createAccess, pipelines) });
        it(`Create record with "asc" field`, () => { createRecordScript(["asc"], userRole, createAccess, pipelines) });
        it(`Create record with "rad" field`, () => { createRecordScript(["rad"], userRole, createAccess, pipelines) });
        it(`Create record with "chk" fields`, () => { createRecordScript(["chk"], userRole, createAccess, pipelines) });



        // it(`Activity log of create record`, () => {
        //     cy.get('[aria-label="Activities"] > .MuiButtonBase-root').click()
        //     cy.get('.MuiTooltip-tooltip').should("have.text", "Activities")
        //     cy.wait("@activity").then(({ response }) => {
        //         let userIdKey = Object.keys(response.body.result.users)
        //         cy.get(`${lead.chooseOptions} > :last strong`).should("have.text", response.body.result.users[userIdKey].label)
        //     });
        // });
    });;

    // context.skip("Create record validations", () => {
    //     it.skip(`Create button should be disable without input required fields on primary form`, () => {
    //         cy.get(lead.typeBtn).contains("Create Lead")
    //             .should("have.css", "background-color", "rgb(245, 124, 0)").click()
    //         cy.componentLabel(`#create-lead ${lead.formLabel}`, "Mobile number", "input").should("have.prop", "required", true)
    //         cy.componentLabel(`#create-lead ${lead.formLabel}`, "Stage", "input").should("have.prop", "required", true)
    //         // Create button  
    //         cy.get(lead.saveBtn).should("have.text", "Create").and("have.attr", "disabled")
    //         cy.get(lead.saveBtn).trigger('mouseover', { force: true })
    //         cy.get('.MuiTooltip-tooltip').should("have.text", "There is some error in form.")

    //         // Create and add another button
    //         cy.get('.MuiDialogActions-root > :nth-child(2) > .MuiButtonBase-root')
    //             .should("have.text", "Create and add another").and("have.attr", "disabled")
    //         cy.get('.MuiDialogActions-root > :nth-child(2) > .MuiButtonBase-root').trigger('mouseover', { force: true })
    //         cy.get('.MuiTooltip-tooltip').should("have.text", "There is some error in form.")
    //     })

    //     // it(`Mobile number should not accept invalid value`, () => {
    //     //     cy.get(lead.typeBtn).contains("Create Lead").click()
    //     //     cy.componentLabel(`#create-lead ${lead.formLabel}`, "Mobile number", "input").type("abcdefghij")
    //     //     cy.get('.MuiFormHelperText-root').contains('Mobile number is not valid')
    //     //     cy.get(lead.saveBtn).should("have.text", "Create").and("be.disabled")
    //     // })

    //     it(`Mobile number should not accept invalid value`, () => {
    //         const invalidValue = faker.string.alpha()
    //         createRecordScript("phn", userRole, createAccess, pipelineIds, invalidValue)
    //     });

    //     it.skip(`Check cancel button working functionalty on primary form`, () => {
    //         cy.get(lead.typeBtn).contains("Create Lead").click()
    //         cy.get('.MuiDialogActions-root > :nth-child(1) > .MuiButtonBase-root').should("have.text", "Cancel").click()
    //     })
    // });
})