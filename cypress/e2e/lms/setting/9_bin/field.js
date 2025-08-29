const lead = require('../../../../selector/lead')
import { fieldSearchAndAct } from '../../../../helpers/global' 
const url = Cypress.env("url")
const module = Cypress.env("module")
const asset = Cypress.env("asset")
let updatedUrl = url.replace("one", module);

describe(`Nevigate the setting page and delete and restore field`, () => {

    beforeEach(() => {
        cy.intercept('GET', '**/fms/fields/grid?*').as("fieldGrid")
        // cy.intercept('GET', '**/rms/assets/pipelines?*').as("assetPipeline")
        cy.intercept('GET', '**/fms/fields/bin?*').as("binList")
        //  cy.session('user', () => { cy.login() });
    })

    const fieldTypeFilterSel = (fieldType) => {
        cy.get('[role="tooltip"] [placeholder="Search..."]').type(fieldType)
        cy.get(`${lead.chooseOptions} > :nth-child(1)`).contains(fieldType).click()
        // cy.get(':nth-child(1) > .field > .MuiButtonBase-root > .MuiTypography-root').contains(fieldType)
    }

    const verifyTablecolNrow = (head, nthCh, type, body, row) => {

        cy.get(head).children(`[data-testid="buvirtualgrid-box-nece0nerp"] tr :nth-child(${nthCh})`).contains(type)
        cy.get(body).children(`[data-testid="buvirtualgrid-box-nece0nerp"] tr :nth-child(${nthCh})`).each(($row, index) => {
            cy.wrap($row).contains(row[index]);
        });
    }

    const roleDialog = (titleEle, titleConten, descEle, descContent, actEle, actContent) => {
        cy.get(titleEle).should("have.text", titleConten)
        cy.get(descEle).should("have.text", descContent)
        cy.get(actEle).contains(actContent).click()
    }

    it(`Delete or detach a field and verify that it is stored in the deleted field section`, () => {
        cy.visit(`${updatedUrl}/setting/properties`)
        // cy.visit(`${Cypress.env("lmsUrl")}/setting/properties`)
        cy.wait("@fieldGrid", { timeout: 10000 }).then(({ response }) => {
            const nonSystemFields = response.body.result.values.filter(field => field.system === false);
            // cy.log(JSON.stringify(nonSystemFields))
            let fieldData = nonSystemFields.slice(-1)
            // cy.log(JSON.stringify(fieldData))
            let attachedCount = nonSystemFields[0].attachedCount.count
            if (attachedCount <= 1) {
                fieldSearchAndAct(fieldData[0].label, "#delete");
                cy.get("#delete").click();
            } else {
                fieldSearchAndAct(fieldData[0].label, "#detach");
                cy.get("#detach").click(); 
            }
            
            cy.get('[data-testid="busimpletabs-tab-6lg4m8h6g"]', { timeout: 10000 }).contains("Deleted fields").click()
            cy.wait("@binList", { timeout: 10000 }).then(({ response }) => {
                let binField = response.body.result.values.map(ele => ele.label)
                cy.log(JSON.stringify(binField))
                // if (response.body.result.pages.totalNoOfPages == 1) {
                //     expect(binField.slice(-1)).to.be.contains(fieldData[0].label)
                // } else {
                //     cy.get('[aria-label="pagination navigation"] ul > :last').prev().click()
                //     cy.wait("@binList", { timeout: 10000 }).then(({ response }) => {
                //         let binField = response.body.result.values.map(ele => ele.label)
                //         expect(binField.slice(-1)).to.be.contains(fieldData[0].label)
                //     })
                // }
            })
        })
    });

    it(`Restore field from field tab`, () => {
        let title = "Restore 1 field ?"
        let desc = "Are you sure you want to  restore 1 field ?"
        cy.visit(`${updatedUrl}/setting/properties`)
        cy.get('[data-testid="busimpletabs-tab-6lg4m8h6g"]', { timeout: 10000 }).contains("Deleted fields").click()
        cy.wait("@binList", { timeout: 10000 }).then(({ response }) => {
            expect(response.body.result.values).be.length.greaterThan(0)
            cy.get('[data-testid="actions-box-it835w1xf"] button').first().click()
            cy.get("#restore").click()
            roleDialog(lead.dialogTitle, title, lead.dialogDesc, desc, `[data-testid="Restore"]`, "Restore")
        })
    });

    it(`Delete field from field tab`, () => {
        let title = "Delete 1 field ?"
        let desc = "Are you sure you want to  delete 1 field ?"
        cy.visit(`${updatedUrl}/setting/properties`)
        cy.get('[data-testid="busimpletabs-tab-6lg4m8h6g"]', { timeout: 10000 }).contains("Deleted fields").click()
        cy.wait("@binList", { timeout: 10000 }).then(({ response }) => {
            expect(response.body.result.values).be.length.greaterThan(0)
            cy.get('[data-testid="actions-box-it835w1xf"] button').first().click()
            cy.get("#delete").click()
            roleDialog(lead.dialogTitle, title, lead.dialogDesc, desc, `[role="dialog"] ${lead.typeBtn}`, "Delete")
        })
    });

    it(`Filter single line field and verify column with rows us`, () => {
        cy.visit(`${updatedUrl}/setting/bin`)
        cy.get('[data-testid="busimpletabs-tab-6lg4m8h6g"]', { timeout: 10000 }).contains("Field").click()
        cy.recordCountOnPage("10")
        cy.get('[aria-label="Select field type"]').click()
        fieldTypeFilterSel("Multi line text");
        cy.get('.MuiButton-endIcon').click()
        cy.wait("@binList")
        cy.wait("@binList")
        cy.wait("@binList", { timeout: 10000 }).then(({ response }) => {
            expect(response.body.result.values).be.length.greaterThan(0)
            let binFieldLabel = response.body.result.values.map(ele => ele.label);
            let deletedType = response.body.result.values.map(ele => {
                return ele.type.charAt(0).toUpperCase() + ele.type.slice(1);
            });
            let deletedBy = response.body.result.values.map(ele => ele.deletedBy);
            let userName = deletedBy.map(key => {
                let label = key.label;
                return label
            })
            let fieldTypeArray = Array(binFieldLabel.length).fill("Multi line text");
            verifyTablecolNrow(lead.thead, 2, "Field name", lead.tbody, binFieldLabel)
            verifyTablecolNrow(lead.thead, 3, "Field type", lead.tbody, fieldTypeArray)
            verifyTablecolNrow(lead.thead, 4, "Deleted by", lead.tbody, userName)
            verifyTablecolNrow(lead.thead, 5, "Deleted type", lead.tbody, deletedType)
        })
    });

    it(`Restore field from bin tab`, () => {
        let title = "Restore 1 field ?"
        let desc = "Are you sure you want to restore 1 field ? "
        cy.visit(`${updatedUrl}/setting/bin`)
        cy.get('[data-testid="busimpletabs-tab-6lg4m8h6g"]', { timeout: 10000 }).contains("Field").click()
        cy.wait("@binList", { timeout: 10000 }).then(({ response }) => {
            expect(response.body.result.values).be.length.greaterThan(0)
            cy.get('[data-testid="actions-box-it835w1xf"] button').first().click()
            cy.get("#restore").click()
            roleDialog(lead.dialogTitle, title, lead.dialogDesc, desc, `[role="dialog"] ${lead.typeBtn}`, "Restore")
        })
    });

    it(`Delete field from bin tab`, () => {
        let title = "Delete 1  field ?"
        let desc = "Are you sure you want to delete 1 field ? "
        cy.visit(`${updatedUrl}/setting/bin`)
        cy.get('[data-testid="busimpletabs-tab-6lg4m8h6g"]', { timeout: 10000 }).contains("Field").click()
        cy.wait("@binList", { timeout: 10000 }).then(({ response }) => {
            expect(response.body.result.values).be.length.greaterThan(0)
            cy.get('[data-testid="actions-box-it835w1xf"] button').first().click()
            cy.get("#delete").click()
            roleDialog(lead.dialogTitle, title, lead.dialogDesc, desc, `[role="dialog"] ${lead.typeBtn}`, "Delete")
        })
    });
})
