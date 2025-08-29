const lead = require("../selector/lead")
const { faker } = require('@faker-js/faker')
import 'cypress-real-events/support';
import { cyGet } from '../helpers/global';

let apiToken
let loginResult
let baseUrl = Cypress.env("url")
let apiUrl = Cypress.env("apiurl")

Cypress.Commands.add('login', (email, password) => {
    cy.intercept("**/auth/login").as("loginApi")
    cy.intercept("**/auth/renew").as("renewApi")
    const uid = email ?? Cypress.env("email");
    const pass = password ?? Cypress.env("password");
    cy.visit(`${baseUrl}/login`)

    cyGet("input[name='email']").type(uid)
    cyGet("input[name='password']").type(pass)
    cyGet('[data-testid="Log in"]').click()

    cy.wait("@loginApi", { timeout: 10000 }).then(({ response }) => {

        if (response.body.result === "session_exists") {
            cyGet('[role="presentation"] .MuiDialog-container .MuiPaper-root button').contains("Ok").click()
        }
    })

    cy.wait("@renewApi", { timeout: 10000 }).then(({ response }) => {
        apiToken = response.body.result.token
        const tokenTimestamp = new Date().getTime();
        Cypress.env("token", apiToken)
        Cypress.env("tokenTimestamp", tokenTimestamp);
        cy.writeFile('cypress/fixtures/token.json', { apiToken, tokenTimestamp });
        localStorage.setItem('authToken', apiToken);
    })
})

Cypress.Commands.add('checkAndRenewToken', () => {
    const tokenTimestamp = Cypress.env('tokenTimestamp');
    const now = new Date().getTime();
    const tenMinutes = 10 * 60 * 1000;

    if (now - tokenTimestamp >= tenMinutes) {
        cy.log('Token expired, renewing...');
        cy.request({
            method: 'GET',
            url: `${baseUrl}/auth/renew`,  // Your renew endpoint
            headers: { Authorization: 'Bearer ' + Cypress.env('token') }
        }).then(({ body }) => {
            const newToken = body.result.token;
            const newTimestamp = new Date().getTime();
            Cypress.env("token", newToken);
            Cypress.env("tokenTimestamp", newTimestamp);
            cy.writeFile('cypress/fixtures/token.json', { apiToken: newToken, tokenTimestamp: newTimestamp });
            localStorage.setItem('authToken', newToken);
        });
    };
});


Cypress.Commands.add("signOut", () => {
    cy.request({
        method: "POST",
        url: `${apiUrl}/auth/logout`,
        headers: { Authorization: "Bearer " + Cypress.env("token") },
        body: { "reason": "manually" }
    }).then(({ body }) => {
        cy.log("logout successfull")
    })
})

Cypress.SelectorPlayground.defaults({
    selectorPriority: ['data-testid', 'id', 'class']
});

Cypress.Commands.add('pipelineData', (module, asset) => {
    const setmodule = module ?? Cypress.env("module")
    const setasset = asset ?? Cypress.env("asset")
    return cy.request({
        method: "GET",
        url: `${apiUrl}/fms/pipelines`,
        headers: { Authorization: "Bearer " + Cypress.env("token") },
        qs: { "module": setmodule, "asset": setasset, showCount: true, rows: 100, },
        failOnStatusCode: false
    }).then(({ body }) => {
        const pipValues = body.result.values
        Cypress.env("pipValues", pipValues)
        return pipValues
    })
})

// Cypress.Commands.add('stageData', (pipId) => {

//     cy.request({
//         method: "GET",
//         url: `${apiUrl}/fms/stages`,
//         headers: { Authorization: "Bearer " + Cypress.env("token") },
//         qs: { module: "lms", asset: "lead", "catId": pipId },
//         failOnStatusCode: false
//     })
// })

// Cypress.Commands.add("owner", (pipId) => {

//     cy.request({
//         method: "GET",
//         url: `${apiUrl}/crew/owners`,
//         headers: { Authorization: "Bearer " + Cypress.env("token") },
//         qs: { module: "lms", asset: "lead", "catId": pipId },
//         failOnStatusCode: false
//     })
// })

Cypress.Commands.add('listfieldApi', (module, asset, pipId, complexity) => {
    cy.log(JSON.stringify(Cypress.env("token")))
    cy.request({
        method: "GET",
        url: `${apiUrl}/fms/fields/list`,
        headers: { Authorization: "Bearer " + Cypress.env("token") },
        qs: { "module": module, "asset": asset, "rows": "all", "catId": pipId, "complexity": complexity },
        failOnStatusCode: false
    })
    // .then(({body})=>{
    //     let strField = body.result.values.filter(ele => ele.prop == "str")
    //     // cy.log(JSON.stringify(strField))

    //     Cypress.env("strFieldName", strField[0].label)
    //     cy.log(JSON.stringify(strField[0].label))
    // })
})



// Cypress.Commands.add('formConfig', () => {
//     cy.request({
//         method: "GET",
//         url: `${apiUrl}/fms/properties/grid`,
//         headers: { Authorization: "Bearer " + Cypress.env("token") },
//         qs: { module: "lms", asset: "lead", rows: 100 },
//         failOnStatusCode: false
//     }).then(({ body }) => {
//         let fieldData = body.result.values.filter(item => item.system === false).slice(-1)
//         let dropdownField = body.result.values.filter(item => item.system === false && item.prop === "bas").slice(-1)
//         Cypress.env("fieldName", fieldData[0].label)
//         Cypress.env("dropdownField", dropdownField[0].label)
//     })
// })

Cypress.Commands.add('assetPipeline', (moduleName) => {
    cy.log(JSON.stringify(Cypress.env("token")))
    cy.request({
        method: "GET",
        url: `${apiUrl}/rms/assets/pipelines`,
        headers: { Authorization: "Bearer " + Cypress.env("token") },
        qs: { module: moduleName },
        failOnStatusCode: false
    }).then(({ body }) => {
        let lmspipeline = body.result.values.map(ele => ele.label)
        let lmspipelineId = body.result.values.map(ele => ele.id)
        Cypress.env("lmsIndexZeroPip", lmspipeline[0])
        Cypress.env("lmsIndexFirstPip", lmspipeline[1])
        Cypress.env("lmsIndexZeroPipId", lmspipelineId[0])
        Cypress.env("lmsIndexFirstPipId", lmspipelineId[1])
    })
})

Cypress.Commands.add('Modules', (modElement, modName, modDesEle, modDesc, opnBtn, headerEle, headerName) => {
    cyGet(modElement).should('contain.text', modName)
    cyGet(modDesEle).should('contain.text', modDesc)
    cyGet(opnBtn).contains("Open").click()
    cyGet(headerEle).should('contain.text', headerName)
})

Cypress.Commands.add('address', (addTypeId, fName, lName, email, mobile, street, zip) => {
    addTypeId ||= ""
    // addTypeId = addTypeId || ""
    // if (!addTypeId) addTypeId = ""
    cy.get(`${addTypeId} #firstName`).clear().type(fName)
    cy.get(`${addTypeId} #lastName`).clear().type(lName)
    cy.get(`${addTypeId} #email`).clear().type(email)
    cy.get(`${addTypeId} #mobile`).clear().type(mobile)
    cy.get(`${addTypeId} input[placeholder="Select country"]`).click()
    cy.wait(1000)
    cy.get('[role="tooltip"] .MuiFormControl-root > .MuiInputBase-root input').type("India", { force: true })
    cy.wait(1000)
    cy.get(`[role="tooltip"] ${lead.chooseOptions} > :nth-child(2)`).click()
    cy.get(`${addTypeId} input[placeholder="Select state"]`).then(($ele) => {
        let txt = $ele.attr("value");
        cy.wrap($ele).should("have.value", txt)
    })
    cy.get(`${addTypeId} input[placeholder="Select city"]`).then(($ele) => {
        let txt = $ele.attr("value");
        cy.wrap($ele).should("have.value", txt)
    })
    cy.get(`${addTypeId} #address`).type(street)
    cy.get(`${addTypeId} #zipcode`).type(zip)
})

Cypress.Commands.add('componentLabel', (labelSel, label, domEle) => {
    cy.get(labelSel).contains(label).next().find(domEle)
})

Cypress.Commands.add('recordCountOnPage', (count) => {
    cy.get('[aria-haspopup="listbox"]').click({ force: true })
    cy.get(`[data-value=${count}]`).click().wait(1000)
})

Cypress.Commands.add('roleDialog', (titleEle, titleConten, descEle, descContent, actEle, actContent) => {
    cy.get(titleEle).should("have.text", titleConten)
    cy.get(descEle).should("have.text", descContent)
    cy.get(actEle).contains(actContent).click()
})

Cypress.Commands.add('dragAndDrop', (draggable, droppable) => {
    cyGet(draggable)
        .realMouseDown()
        .realMouseMove(0, 0)

    cyGet(droppable)
        .realMouseMove(0, 0)
        .realMouseUp()
});

Cypress.Commands.add('assetDropdownSel', (assetName) => {
    cy.get('[role="list"] button').children(`[aria-label="${assetName}"]`)
});





