const { cyGet, budropdown, buSearchbox, budropdownOption, buSaveButton } = require("../../../helpers/global");
const { getRequiredFieldsByLoanType } = require("../../../helpers/manage_dsa/loan_enquiry");
const { propwiseFields, fieldOnForm } = require("../../../helpers/record");
const globalSel = require("../../../selector/globalSel");

describe(`Nevigate to the referrers asset`, () => {

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
        cy.visit(`${updatedUrl}/referrers`)

    })

    it(`create referrer`, () => {
        cy.wait("@appAuth", { timeout: 10000 }).then(({ response }) => {
            userRole = response.body.result.user.role
            if (userRole === "std") { this.skip() };
            cyGet('[data-testid="Create Referrer"]').click()
            cy.wait("@getfieldOnForm", { timeout: 10000 }).then(({ response }) => {
                const fieldConfig = response?.body?.result?.values || [];
                propwiseFields(fieldConfig);
                cyGet('[data-testid="Create"]').click()
            });
        });
    });
});
