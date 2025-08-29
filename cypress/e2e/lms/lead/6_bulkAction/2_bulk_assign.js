const { buSearchbox, buSaveButton, cyGet } = require('../../../../helpers/global');
const globalSel = require('../../../../selector/globalSel');
const lead = require('../../../../selector/lead')

describe(`Test the functionality of bulk Assign`, () => {

    const url = Cypress.env("url");
    const module = Cypress.env("module");
    const asset = Cypress.env("asset");
    let updatedUrl = url.replace("one", module);

    beforeEach(() => {
        cy.intercept(`**/crew/owners?*`).as("getOwner")
        cy.intercept(`**/rms/records/grid?*`).as("getRecord")
        cy.visit(`${updatedUrl}/${asset}s`)
    });

    const ownerIndex = (label, sublabel) => {
        cy.get(`[data-testid="dropdown-listitemtext-89r0h5cqd"]`).contains(label)
        cy.get(`[data-testid="dropdown-listitemtext-89r0h5cqd"]`).contains(sublabel).click({ force: true })
    }
    const onnerDialogbox = () => {
        cyGet(lead.arealabelGrid).click()
        cyGet('table > thead input').check()
        cyGet('#bulkActions [data-testid="Assign"]').contains("Assign").click()
        cyGet('#customized-dialog-title p').should("have.text", `Assign ${asset}`)
        cyGet(`[data-testid="buselect-typography-v6hljonw2"]`).contains(`Assign selected ${asset}s to owner`)
        cyGet(`[data-testid="buselect-typography-nu968oftr"]`).contains("No owner")
        cyGet('[data-testid="buselect-iconbutton-h6iohitzp"]').click()
    }

    it(`Single owner assignment`, () => {
        onnerDialogbox();
        cy.wait("@getOwner").then(({ response }) => {
            const totalOwner = response.body.result.values.length
            let ownerLabel = response.body.result.values.map(ele => ele.label)
            let subLabel = response.body.result.values.map(ele => ele.subLabel)
            if (totalOwner > 5) { buSearchbox(globalSel.search, subLabel[0]) }
            ownerIndex(ownerLabel[0], subLabel[0])
            cyGet('[data-testid="buselect-iconbutton-h6iohitzp"]').click()
            buSaveButton().click({ force: true })
        })
    })

    it(`Assign lead equally`, () => {
        onnerDialogbox();
        cy.wait("@getOwner").then(({ response }) => {
            const totalOwner = response.body.result.values.length
            let ownerLabel = response.body.result.values.map(ele => ele.label)
            let subLabel = response.body.result.values.map(ele => ele.subLabel)
            if (response.body.result.values.length > 1) {
                if (totalOwner > 5) { buSearchbox(globalSel.search, subLabel[0]) }
                ownerIndex(ownerLabel[0], subLabel[0])
                if (totalOwner > 5) { buSearchbox(globalSel.search, subLabel[1]) }
                ownerIndex(ownerLabel[1], subLabel[1])
                cyGet('[data-testid="buselect-iconbutton-h6iohitzp"]').click()
                cyGet('input[name="eq"]').click()
                cyGet('[aria-label="Assign lead equally"]').should("have.text", "Assign lead equally")
                buSaveButton().click({ force: true })
                cy.wait("@getRecord")
                cy.wait("@getRecord", { timeout: 10000 }).then(({ response }) => {
                    let ownerView = response.body.result.view.columns.filter(ele => ele.label == "Owner")
                    let ownerFieldId = ownerView[0].id
                    let ownerName = response.body.result.values.filter(ele => ele[ownerFieldId][0].label === ownerLabel[0])
                    let ownerName_1 = response.body.result.values.filter(ele => ele[ownerFieldId][0].label === ownerLabel[1])
                    let recordLength = response.body.result.values.length
                    if (recordLength % 2 === 0) {
                        expect(ownerName).have.length(recordLength / 2)
                        expect(ownerName_1).have.length(recordLength / 2)
                    } else {
                        expect(ownerName).have.length((recordLength + 1) / 2)
                        expect(ownerName_1).have.length((recordLength - 1) / 2)
                    }
                })
            } else {
                ownerIndex(ownerLabel[0], subLabel[0])
                cyGet('[data-testid="buselect-iconbutton-h6iohitzp"]').click()
                buSaveButton().click({ force: true })
                cy.wait("@getRecord")
                cy.wait("@getRecord", { timeout: 10000 }).then(({ response }) => {
                    let ownerView = response.body.result.view.columns.filter(ele => ele.label == "Owner")
                    let ownerFieldId = ownerView[0].id
                    let ownerName = response.body.result.values.filter(ele => ele[ownerFieldId][0].label == ownerLabel[0])
                    let recordLength = response.body.result.values.length
                    expect(ownerName).have.length(recordLength)
                })
            }
        })
    })

    it(`Assign all lead`, () => {
        onnerDialogbox();
        cy.wait("@getOwner").then(({ response }) => {
            let ownerLabel = response.body.result.values.map(ele => ele.label)
            let subLabel = response.body.result.values.map(ele => ele.subLabel)
            if (response.body.result.values.length > 1) {
                ownerIndex(ownerLabel[0], subLabel[0], 1)
                ownerIndex(ownerLabel[1], subLabel[1], 2)
                cyGet('[data-testid="buselect-iconbutton-h6iohitzp"]').click()
                cyGet('input[name="all"]').should("be.checked")
                cyGet('[aria-label="Assign all"]').should("have.text", "Assign all")
                buSaveButton().click({ force: true })
                cy.wait("@getRecord")
                cy.wait("@getRecord", { timeout: 10000 }).then(({ response }) => {
                    let ownerView = response.body.result.view.columns.filter(ele => ele.label == "Owner")
                    let ownerFieldId = ownerView[0].id
                    let ownerName = response.body.result.values.filter(ele => ele[ownerFieldId][0].label == ownerLabel[0])
                    let ownerName_1 = response.body.result.values.filter(ele => ele[ownerFieldId][1].label == ownerLabel[1])
                    let recordLength = response.body.result.values.length
                    expect(ownerName).have.length(recordLength)
                    expect(ownerName_1).have.length(recordLength)
                })
            } else {
                ownerIndex(ownerLabel[0], subLabel[0], 1)
                cyGet('[data-testid="buselect-iconbutton-h6iohitzp"]').click()
                cyGet('input[name="all"]').should("be.checked")
                cyGet('[aria-label="Assign all"]').should("have.text", "Assign all")
                buSaveButton().click({ force: true })
                cy.wait("@getRecord")
                cy.wait("@getRecord", { timeout: 10000 }).then(({ response }) => {
                    let ownerView = response.body.result.view.columns.filter(ele => ele.label == "Owner")
                    let ownerFieldId = ownerView[0].id
                    let ownerName = response.body.result.values.filter(ele => ele[ownerFieldId][0].label == ownerLabel[0])
                    let recordLength = response.body.result.values.length
                    expect(ownerName).have.length(recordLength)
                });
            };
        });
    });
});