import { searchNactionField } from '../helpers/field';
import globalSel from './globalSel';

const { faker } = require('@faker-js/faker');
const lead = require('../selector/lead')
const asset = Cypress.env("asset")
const module = Cypress.env("module")
const assetName = asset.charAt(0).toUpperCase() + asset.slice(1)

export function editMultiSelectionField() {
    cy.get('.MuiFormGroup-root > :nth-child(1) > .MuiButtonBase-root').should("have.attr", "aria-disabled", "true")
    cy.get('.MuiFormGroup-root > :nth-child(1) > .MuiTypography-root').should("have.text", "Single-selection")
    cy.get('.MuiFormGroup-root > :nth-child(2) > .MuiButtonBase-root').should("have.attr", "aria-disabled", "true")
    cy.get('.MuiFormGroup-root > :nth-child(2) > .MuiTypography-root').should("have.text", "Multi-selection")
}

export function editSingleSelectionField() {
    cy.get('.MuiFormGroup-root > :nth-child(1) > .MuiButtonBase-root').click()
    cy.get('.MuiFormGroup-root > :nth-child(1) > .MuiTypography-root').should("have.text", "Single-selection")
    cy.get('.MuiFormGroup-root > :nth-child(2) > .MuiButtonBase-root')
    cy.get('.MuiFormGroup-root > :nth-child(2) > .MuiTypography-root').should("have.text", "Multi-selection")
}

export const reqHeader = () => {
    let reqData = {
        Authorization: `Bearer ${Cypress.env("token")}`,
        // Cookie: Cypress.env("set_cookie")
    }
    return reqData
}

export const request = (setM, setUrl, setH, setQs, setBody, showTeststatus) => {
    return cy.request({
        method: setM,
        url: setUrl,
        headers: setH,
        qs: setQs,
        body: setBody,
        failOnStatusCode: showTeststatus
    });
};

export const workflowSel = (sourceAsset) => {
    cy.log("sourceAsset", JSON.stringify(sourceAsset))
    cy.addFieldDialog(lead.inputAsset, lead.tooltipHolder, sourceAsset, "1")
    cy.componentLabel(lead.formLabel, "Trigger name", '#label').type(faker.lorem.word(8))
    cy.componentLabel(lead.formLabel, "Description", '#description').type(faker.lorem.words(10))
    cy.get(':nth-child(1) > .MuiStepLabel-root .MuiButtonBase-root').contains("Next").click()
};

export const triggerSel = (pip) => {
    cy.get('input[name="Created"]').click()
    cy.get(':nth-child(2) > .MuiStepLabel-root .MuiButtonBase-root').contains("Next").click()
    cy.get('.MuiStepper-root > :nth-child(2) .MuiStepLabel-label :nth-child(2) p').as("verifyTrigger").contains("Trigger this workflow when")
    cy.get('@verifyTrigger').contains(`${pip} 's record`)
    cy.get('@verifyTrigger').contains("created")
};

export const actionSel = (destAsset) => {
    cy.get(lead.typeBtn).contains("Add Action").click()
    cy.get('#create-record').click()
    cy.addFieldDialog(lead.inputTsset, lead.tooltipHolder, destAsset, "1")
    cy.componentLabel(lead.formLabel, "Title", 'input').type(faker.lorem.word())
    cy.get('.MuiGrid-root .field button > :first').click()
};

export const verifyAutomation = (field1, field2, field2Value, srcQs, destAsset) => {
    let mob = faker.string.numeric(10)
    let reqBody = { [field1]: mob, [field2]: field2Value }
    let recordCreateUrl = `${Cypress.env("apiurl")}/rms/records`
    request("POST", recordCreateUrl, reqHeader({}), srcQs, reqBody).then(({ body }) => {
        cy.wait(15000)
        let destQS = { "module": "lms", "asset": "lead", "catId": destAsset }
        let gridUrl = `${Cypress.env("apiurl")}/rms/records/grid`
        request("POST", gridUrl, reqHeader({}), destQS).then(({ body }) => {
            expect(body.result.values[0]).have.property(field1, mob)
            //   cy.wait("@workflow").then(({response})=>{
            //      let workflowId = response.body.result.id
            //      let patchWorkflowUrl = `${Cypress.env("apiurl")}/wms/workflows/${workflowId}`;
            //      let updateBody = { "active": false }
            //      request("PATCH", patchWorkflowUrl, reqHeader({}), null, updateBody).then(({ body, status }) => {
            //         expect(body).have.property("message", "Updated successfully.")
            //     })
            //   }) 
        })
    })
};

export const workflowActionSel = (nth1, nth2, label, actionSel) => {
    cy.get(`${lead.tbody} :nth-child(${nth1}) > :nth-child(${nth2})`).find("p").contains(label)
    cy.get(`${lead.tbody} :nth-child(${nth1}) > :nth-child(${nth2})`).find("button").click()
    cy.get(actionSel).click()
    cy.wait(1000)
}

export const editworkflowSel = (asset, workflowName, workflowDesc) => {
    cy.get(lead.inputAsset).should("have.value", asset)
    cy.componentLabel(lead.formLabel, "Trigger name", '#label').should("have.value", workflowName)
    cy.componentLabel(lead.formLabel, "Trigger name", '#label').clear().type(faker.lorem.word(8))
    cy.componentLabel(lead.formLabel, "Description", '#description').should("have.value", workflowDesc)
    cy.componentLabel(lead.formLabel, "Description", '#description').clear().type(faker.lorem.words(10))
    cy.get(':nth-child(1) > .MuiStepLabel-root .MuiButtonBase-root').contains("Next").click()
}
export const setFieldOnViewConfig = (SrchBoxSel, fieldName, fieldInputSel) => {
    cy.get(SrchBoxSel).clear().type(fieldName)
    cy.get(fieldInputSel).first().then(($ele) => {
        if (fieldName === `${assetName} Id`) {
            cy.get($ele).should("be.checked").and("be.disabled")
        } else {
            if ($ele.is(':checked')) {
                cy.wrap($ele).first().click()   // Uncheck the 
                cy.wrap($ele).first().click()   // check

            } else {
                cy.wrap($ele).first().click()   // check
            };
        };
    });
};

export const fieldType = {
    str: "Single line text",
    txa: "Multi line text",
    phn: "Mobile number",
    url: "URL",
    eml: "Email",
    num: "Number",
    bas: "Dropdown",
    img: "Image",
    dat: "Date",
    tim: "Time",
    dtm: "Date and Time",
    chk: "Checkbox",
    rad: "Radio",
    atc: "Attachment",
    fx: "Formula",
    grd: "Grid",
    rtg: "Rating",
    gloc: "Geo location"
}