// const { afterEach } = require('mocha')
const { cyGet, twosecondWait, budropdown, budropdownOption, onesecondWait } = require('../../../../helpers/global');
const lead = require('../../../../selector/lead');
import moment from 'moment';
import globalSel from '../../../../selector/globalSel';

const pastDay = moment().subtract(2, "days").date();

describe(`Navigate on lead and test Export functoinality`, () => {
    const url = Cypress.env("url");
    const module = Cypress.env("module");
    const asset = Cypress.env("asset");
    let updatedUrl = url.replace("one", module);
    let email;
    let role

    beforeEach(() => {
        cy.intercept("GET", `**/crew/users/app-auth?*`).as("appAuth")
        cy.intercept("POST", `**/fms/pipelines/exists?*`).as("existsPipelines")
        cy.intercept("GET", `**/fms/stages?*`).as("setStage")
        cy.intercept("POST", `**/rms/records/grid?*`).as("recordGrid")
        cy.intercept("POST", `**/rms/records/count?*`).as("recordCount")
        cy.intercept("GET", `**/rms/tools/filters?*`).as("filters")
        cy.visit(`${updatedUrl}/${asset}s`)
        cy.wait("@appAuth", { timeout: 10000 }).then(({ response }) => {
            email = response.body.result.user.email;
            role = response.body.result.user.role;
        })
        cyGet('#bu-layout [aria-label="Grid view"]').click()
    });

    it(`Check the behavior of the Export button based on the total number of records in a pipeline`, () => {
        // cyGet(`[data-testid="Export"]`).contains("Export").click()
        // cyGet(`[data-testid="title-dialog"] p`).should("contain.text", "Export");
        // cy.wait("@appAuth", { timeout: 10000 }).then(({ response }) => {
        //     email = response.body.result.user.email;
        //     role = response.body.result.user.role;
        // const userRole = response.body.result.user.email;
        cy.wait("@existsPipelines", { timeout: 10000 }).then(({ response }) => {
            const accessToExport = response.body.result.tools.export
            if (role === "std" && !accessToExport) {
                cyGet(`[data-testid="Export"]`).should("be.disabled")
            } else {
                cy.wait("@recordGrid", { timeout: 10000 }).then(({ response }) => {
                    const totalRecord = response.body.result.pages.totalRecords;
                    cyGet(`[data-testid="Export"]`).contains("Export").click()
                    cyGet(`[data-testid="title-dialog"] p`).should("contain.text", "Export");
                    cyGet(`[data-testid="exportactor-typography-7vhpyacm5"]`).contains(`Once exported, the file will be sent to ${email} and you will be notified.`);
                    cyGet(`[data-testid="exportactor-typography-awnrepr3p"]`).contains(`Total number of records after all filters are applied:${totalRecord}`);
                    const total = Number(totalRecord);
                    cyGet('[role="dialog"] [data-testid="Export"]').should(total === 0 || total > 10000 ? 'be.disabled' : 'not.be.disabled');
                });
            };
        });
        // });
    });

    it(`Export records based on the creation date range filter selected on the export page`, () => {
        if (role === "std" && !accessToExport) {
            cyGet(`[data-testid="Export"]`).should("be.disabled")
        } else {

            cy.wait("@recordGrid", { timeout: 10000 }).then(({ response }) => {
                const totalRecord = response.body.result.pages.totalRecords;
                cyGet(`[data-testid="Export"]`).contains("Export").click()
                cyGet(`[data-testid="exportactor-typography-awnrepr3p"]`).contains(`Total number of records after all filters are applied:${totalRecord}`);
                cy.get('[data-testid="exportactor-grid-zywx8bilv"] [data-testid="budate-iconbutton-v63dt06ut"]').click()
                cy.get('[aria-label="Previous month"]').click()
                cy.get('[role="row"]').contains(pastDay).click()

                cyGet(`[name="File format"]`).click()
                budropdownOption("csv").first().click()

                cy.get('[data-testid="exportactor-grid-ti62k6zn2"] [data-testid="budate-iconbutton-v63dt06ut"]').click()
                cy.get('[role="dialog"] [role="row"]')
                    .filter(':visible')
                    .contains(moment().date())
                    .click()
                cy.wait("@recordCount", { timeout: 10000 }).then(({ response }) => {
                    const recordToExport = response.body.result;
                    if (recordToExport > 0 && recordToExport < 10000) {
                        cyGet(`[role="dialog"] [data-testid="Export"]`).click()
                    } else {
                        throw new Error(`Record for Export:${recordToExport}`)
                    }
                })
                cyGet('.MuiSnackbarContent-message')
                    .should("have.text", "Export request submitted successfully. Please check your email address after sometime.");
            });
        };

    });

    it(`Filter record and Export records`, () => {
        if (role === "std" && !accessToExport) {
            cyGet(`[data-testid="Export"]`).should("be.disabled")
        } else {
            cy.wait("@existsPipelines", { timeout: 10000 })
            cyGet(`#filter`).click()
            cy.wait("@filters", { timeout: 10000 }).then(({ response }) => {
                const uidField = response.body.result.find(ele => ele.prop === "uid")
                cyGet(`[placeholder="Search..."]`).type(uidField.label)
                onesecondWait()
                cyGet(`[data-testid="filterheader-box-jox1agcx8"] > [aria-label="${uidField.label}"]`).click()
                cyGet(`[data-testid="comparestringfilter-box-f914y6cfe"] [placeholder="Add value..."]`).type(1)
                onesecondWait()
                cyGet(`[data-testid="Export"]`).contains("Export").click()
                cy.wait("@recordGrid")
                cy.wait("@recordGrid", { timeout: 10000 }).then(({ response }) => {
                    const totalRecord = response.body.result.pages.totalRecords;
                    if (totalRecord > 0 && totalRecord < 10000) {
                        cyGet(`[role="dialog"] [data-testid="Export"]`).click()
                    } else {
                        throw new Error(`Record for Export:${totalRecord}`)
                    }
                    cyGet('.MuiSnackbarContent-message')
                        .should("have.text", "Export request submitted successfully. Please check your email address after sometime.");
                });
            });
        };
    });
});