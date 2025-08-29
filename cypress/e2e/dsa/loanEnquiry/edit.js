const { cyGet, budropdown, buSearchbox, budropdownOption, buSaveButton } = require("../../../helpers/global");
const { getRequiredFieldsByLoanType } = require("../../../helpers/manage_dsa/loan_enquiry");
const { propwiseFields, fieldOnForm, fetchOptions } = require("../../../helpers/record");
const globalSel = require("../../../selector/globalSel");

describe(`Nevigate to the Loan Enquiry`, () => {

    const url = Cypress.env("url");
    const module = Cypress.env("module");
    const asset = Cypress.env("asset");
    let updatedUrl = url.replace("one", module);
    let userRole;
    let loanEnquiryId;

    beforeEach(function () {
        cy.intercept("GET", `**/crew/users/app-auth?*`).as("appAuth")
        cy.intercept("POST", `**/rms/records/grid?*`).as("recordsGrid")
        cy.intercept("GET", `**/fms/forms/create?*`).as("getfieldOnForm")
        cy.intercept("GET", "**/fms/biztabs?*").as("getBiztab")


    })

    it(`Edit stage - Application Sumbited`, () => {
        cy.visit(`${updatedUrl}/loan_enquiries`);
        cyGet('[data-testid="buelementgroup-box-n1f8dc7ag"]').find('[aria-label="Grid view"] button').click();
        cy.wait("@recordsGrid", { timeout: 10000 }).then(({ response }) => {
            const uidField = response.body.result.view.columns.find(fld => fld.prop === "uid")
            loanEnquiryId = response.body.result.values[0][uidField.id];
            const recordId = response.body.result.values[0].id;
            cy.intercept("GET", `**/rms/records/${recordId}?*`).as("getRecord")
            cy.contains(`tr`, loanEnquiryId).find(`td`).contains(loanEnquiryId).click({ force: true })
            fieldOnForm(`#detail-form [data-testid="budropdown-box-ty1opau5a"] label`, "Stage", "input").click()
            buSearchbox(globalSel.search, "Application Submitted")
            budropdownOption("Application Submitted", `[data-testid="buchip-chip-5r51zm55o"]`).click()
            buSaveButton().click();
        });
    });


    it(`Confirm that the loan enquiry moved to the Loan Request after application submitted.`, () => {
        cy.visit(`${updatedUrl}/loan_requests`)
        cyGet('[data-testid="buelementgroup-box-n1f8dc7ag"]').find('[aria-label="Grid view"] button').click();
        cy.wait(15000)
        cy.wait("@recordsGrid", { timeout: 10000 }).then(({ response }) => {
            // const uidField = response.body.result.view.columns.find(fld => fld.prop === "uid")
            // const loanEnquiryId = response.body.result.values[0][uidField.id];
            const enquiryAscField = response.body.result.view.columns.find(fld => fld.label === "Enquiry Association")
            const enquiryAscValue = response.body.result.values[0][enquiryAscField.id];
            fetchOptions(enquiryAscValue).then((res) => {
                res.forEach(ele => {
                    expect(ele).has.property("label", loanEnquiryId)
                })
            })
        });
    });
});
