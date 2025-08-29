const { cyGet, budropdown, buSearchbox, budropdownOption, buSaveButton } = require("../../../helpers/global");
const { getRequiredFieldsByLoanType } = require("../../../helpers/manage_dsa/loan_enquiry");
const { propwiseFields, fieldOnForm } = require("../../../helpers/record");
const globalSel = require("../../../selector/globalSel");

describe(`Nevigate to the Loan Enquiry`, () => {

    const url = Cypress.env("url");
    const module = Cypress.env("module");
    const asset = Cypress.env("asset");
    let updatedUrl = url.replace("one", module);
    let userRole;

    beforeEach(function () {
        cy.intercept("GET", `**/crew/users/app-auth?*`).as("appAuth")
        cy.intercept("POST", `**/rms/records/grid?*`).as("recordsGrid")
        cy.intercept("GET", `**/fms/forms/create?*`).as("getfieldOnForm")
        cy.intercept("GET", "**/fms/biztabs?*").as("getBiztab")
        cy.visit(`${updatedUrl}/loan_enquiries`)

    })

    it(`create loan enquiry`, () => {
        cy.wait("@appAuth", { timeout: 10000 }).then(({ response }) => {
            userRole = response.body.result.user.role
            if (userRole === "std") { this.skip() };
            cy.log(JSON.stringify(userRole))
            cy.get('[data-testid="Create Loan Enquiry"]').click()
            cy.wait("@getfieldOnForm", { timeout: 10000 }).then(({ response }) => {
                const fieldConfig = response?.body?.result?.values || [];
                propwiseFields(fieldConfig);
                cy.get('[data-testid="Create"]').click()
            });
        });
    });

    it(`Fill personal information`, () => {
        cyGet('[data-testid="buelementgroup-box-n1f8dc7ag"]').find('[aria-label="Grid view"] button').click();
        cy.wait("@recordsGrid", { timeout: 10000 }).then(({ response }) => {
            const uidField = response.body.result.view.columns.find(fld => fld.prop === "uid")
            const loanEnquiryId = response.body.result.values[0][uidField.id];
            const recordId = response.body.result.values[0].id;
            cy.contains(`tr`, loanEnquiryId).find(`td`).contains(loanEnquiryId).click({ force: true })
            cy.wait("@getBiztab", { timeout: 10000 }).then(({ response }) => {
                const piField = response.body.result.find(fld => fld.label === "Personal Information");
                cy.intercept("GET", `**/rms/records/${recordId}?module=dsa&asset=loan_enquiry&catId=681c4fcf8428f38032e71227&fieldGroup=${piField.id}`).as("piFieldGroup")
                if (!piField) { this.skip() }
                cyGet(`[aria-label="Simple Tab"] [aria-label="${piField?.label}"]`)
                    .should("contain.text", piField?.label)
                    .click()
                cy.wait("@piFieldGroup", { timeout: 10000 }).then(({ response }) => {
                    const recordProfile = response?.body?.result?.profile || [];
                    propwiseFields(recordProfile);
                    cyGet(`[data-testid="Save tab form"]`).click();
                });
            });

        });
    });

    it(`Fill income detail`, () => {
        cy.viewport(1920, 1200)
        cyGet('[data-testid="buelementgroup-box-n1f8dc7ag"]').find('[aria-label="Grid view"] button').click();
        cy.wait("@recordsGrid", { timeout: 10000 }).then(({ response }) => {
            const uidField = response.body.result.view.columns.find(fld => fld.prop === "uid")
            const loanEnquiryId = response.body.result.values[0][uidField.id];
            const recordId = response.body.result.values[0].id;
            cy.contains(`tr`, loanEnquiryId).find(`td`).contains(loanEnquiryId).click({ force: true })

            cy.wait("@getBiztab", { timeout: 10000 }).then(({ response }) => {
                const incomeField = response.body.result.find(fld => fld.label === "Income Details");
                cy.intercept("GET", `**/rms/records/${recordId}?module=dsa&asset=loan_enquiry&catId=681c4fcf8428f38032e71227&fieldGroup=${incomeField.id}`).as("incomeFieldFieldGroup")
                if (!incomeField) { this.skip() }
                cyGet(`[aria-label="Simple Tab"] [aria-label="${incomeField?.label}"]`)
                    .should("contain.text", incomeField?.label)
                    .click()
                cy.wait("@incomeFieldFieldGroup", { timeout: 10000 }).then(({ response }) => {
                    const recordProfile = response?.body?.result?.profile.slice(0, 11);
                    propwiseFields(recordProfile);
                    cyGet(`[data-testid="Save tab form"]`).click();
                });
            });

        });
    });

    it.skip(`Fill previous loan`, () => {
        cyGet('[data-testid="buelementgroup-box-n1f8dc7ag"]').find('[aria-label="Grid view"] button').click();
        cy.wait("@recordsGrid", { timeout: 10000 }).then(({ response }) => {
            const uidField = response.body.result.view.columns.find(fld => fld.prop === "uid")
            const loanEnquiryId = response.body.result.values[0][uidField.id];
            const recordId = response.body.result.values[0].id;
            cy.contains(`tr`, loanEnquiryId).find(`td`).contains(loanEnquiryId).click({ force: true })
            cy.wait("@getBiztab", { timeout: 10000 }).then(({ response }) => {
                const plField = response.body.result.find(fld => fld.label === "Previous Loan");
                cy.intercept("GET", `**/rms/records/${recordId}?module=dsa&asset=loan_enquiry&catId=681c4fcf8428f38032e71227&fieldGroup=${plField.id}`).as("plFieldFieldGroup")
                if (!plField) { this.skip() }
                cyGet(`[aria-label="Simple Tab"] [aria-label="${plField?.label}"]`)
                    .should("contain.text", plField?.label)
                    .click()
                cy.wait("@plFieldFieldGroup", { timeout: 10000 }).then(({ response }) => {
                    const recordProfile = response?.body?.result?.profile || [];
                    propwiseFields(recordProfile);
                    cyGet(`[data-testid="Save tab form"]`).click();
                });
            });

        });
    });

    it(`upload required documents`, () => {
        cyGet('[data-testid="buelementgroup-box-n1f8dc7ag"]').find('[aria-label="Grid view"] button').click();
        cy.wait("@recordsGrid", { timeout: 10000 }).then(({ response }) => {
            const uidField = response.body.result.view.columns.find(fld => fld.prop === "uid")
            const loanEnquiryId = response.body.result.values[0][uidField.id];
            const recordId = response.body.result.values[0].id;
            cy.contains(`tr`, loanEnquiryId).find(`td`).contains(loanEnquiryId).click({ force: true })
            cy.wait("@getBiztab", { timeout: 10000 }).then(({ response }) => {
                const drField = response.body.result.find(fld => fld.label === "Document Required");
                cy.intercept("GET", `**/rms/records/${recordId}?module=dsa&asset=loan_enquiry&catId=681c4fcf8428f38032e71227&fieldGroup=${drField.id}`).as("drFieldFieldGroup")
                if (!drField) { this.skip() }
                cyGet(`[aria-label="Simple Tab"] [aria-label="${drField?.label}"]`)
                    .should("contain.text", drField?.label)
                    .click()
                cy.wait("@drFieldFieldGroup", { timeout: 10000 }).then(({ response }) => {
                    const allFields = response?.body?.result?.profile || [];
                    const customiseLoanFields = getRequiredFieldsByLoanType(allFields, 'Personal Loan');
                    propwiseFields(customiseLoanFields);
                    cyGet(`[data-testid="Save tab form"]`).click();
                });
            });

        });
    });

});
