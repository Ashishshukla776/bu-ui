const { faker } = require('@faker-js/faker');
const lead = require('../../../../selector/lead');
const { cyGet } = require('../../../../helpers/global');

describe(`Test the functionality of Association`, () => {
    beforeEach(() => {
        cy.intercept("GET", "**/fms/biztabs?*").as("getBiztab");
        cy.intercept("GET", "**/rms/associations?*").as("associations");
        cy.intercept("GET", "**/rms/associations/associable?*").as("associable");
        cy.intercept("DELETE", "**/rms/associations?*").as("deleteAssociation");
        //  cy.session('user', () => { cy.login() });
        cy.visit(`${Cypress.env("lmsUrl")}/leads`);
        cy.get('#bu-layout [aria-label="Split view"]').click();
    });

    context(`Test the functionality of Association`, () => {
        it(`Associate the record`, () => {
            cy.wait("@getBiztab", { timeout: 10000 }).then(({ response }) => {
                let associatonField = response.body.result.find(ele => ele.prop === "asc")
                cyGet(`[aria-label="Simple Tab"] [aria-label="${associatonField?.label}"]`)
                    .should("contain.text", associatonField?.label)
                    .click()
                if (associatonField?.selection == "single") {
                    cy.wait("@associations").then(({ response }) => {
                        if (response.body.result.values.length == 0) {
                            cy.get(lead.tabpanelBtn).contains("Add").click()
                            cy.get(`${lead.selectAssociableRecord} :nth-child(1)`).click()
                            cy.wait(1500)
                        } else {
                            cy.log("Association alredy exist")
                        }
                    });
                } else {
                    cy.get(lead.tabpanelBtn).contains("Add").click()
                    cy.wait("@associable").then(({ response }) => {
                        if (response.body.result.values.length > 1) {

                            cy.get(`${lead.selectAssociableRecord} :nth-child(1) input`).click()
                            cy.get(`${lead.selectAssociableRecord} :nth-child(2) input`).click()
                            cy.wait(1500)
                        } else if (response.body.result.values.length = 1) {
                            cy.get(`${lead.selectAssociableRecord} :nth-child(1) input`).click()
                            cy.wait(1500)
                        }
                        else if (response.body.result.values.length = 0) {
                            expect(response.body.result.values).to.be.length.eq(0)
                        };
                    });
                };
            });
        });
    });

    context(`Test the functionality of Remove Association`, () => {
        it(`Remove associated record from association list`, () => {
            cy.wait("@getBiztab", { timeout: 10000 }).then(({ response }) => {
                let associatonField = response.body.result.find(ele => ele.prop === "asc")
                // expect(associatonField).be.length.greaterThan(0)
                // cy.get(lead.simpleTab).contains(associatonField[0].label).click()
                cyGet(`[aria-label="Simple Tab"] [aria-label="${associatonField?.label}"]`)
                    .should("contain.text", associatonField?.label)
                    .click()

                cy.wait("@associations").then(({ response }) => {
                    if (response.body.result.values == 0) {
                        cy.get(lead.tabpanelBtn).contains("Add").click()
                        cy.get(`${lead.selectAssociableRecord} :nth-child(1) input`).click()
                        cy.wait(1500)
                        cy.get('[data-testid="commoncard-box-ze66boaek"]').first().click()
                        cy.get("#remove").click()
                    } else {
                        cy.get('[data-testid="commoncard-box-ze66boaek"]').first().click()
                        cy.get("#remove").click()
                    };
                    cy.wait("@deleteAssociation").then(({ response }) => {
                        expect(response.body).has.property("message", "Associations removed successfully.")
                    });
                });
            });
        });
    });
});



