const { cyGet, budropdown, buSearchbox, budropdownOption, buSaveButton } = require("../../../helpers/global");
const { getRequiredFieldsByLoanType } = require("../../../helpers/manage_dsa/loan_enquiry");
const { propwiseFields, fieldOnForm } = require("../../../helpers/record");
const globalSel = require("../../../selector/globalSel");

describe(`Nevigate to the Loan Request`, () => {

    const url = Cypress.env("url");
    const module = Cypress.env("module");
    const asset = Cypress.env("asset");
    let updatedUrl = url.replace("one", module);
    let userRole;
    let loanRequestId;
    let recordId;

    beforeEach(function () {
        cy.intercept("GET", `**/crew/users/app-auth?*`).as("appAuth")
        cy.intercept("POST", `**/rms/records/grid?*`).as("recordsGrid")
        cy.intercept("GET", `**/fms/forms/create?*`).as("getfieldOnForm")
        cy.intercept("GET", "**/fms/biztabs?*").as("getBiztab")


    })

    // it(`verify loan request`, () => {
    //     cy.wait("@appAuth", { timeout: 10000 }).then(({ response }) => {
    //         userRole = response.body.result.user.role
    //         if (userRole === "std") { this.skip() };
    //         cy.log(JSON.stringify(userRole))
    //         cyGet('[data-testid="Create Loan Enquiry"]').click()
    //         cy.wait("@getfieldOnForm", { timeout: 10000 }).then(({ response }) => {
    //             const fieldConfig = response?.body?.result?.values || [];
    //             propwiseFields(fieldConfig);
    //             cy.get('[data-testid="Create"]').click()
    //         });
    //     });
    // });

    // it(`Fill personal information`, () => {
    //     cyGet('[data-testid="buelementgroup-box-n1f8dc7ag"]').find('[aria-label="Grid view"] button').click();
    //     cy.wait("@recordsGrid", { timeout: 10000 }).then(({ response }) => {
    //         const uidField = response.body.result.view.columns.find(fld => fld.prop === "uid")
    //         const loanEnquiryId = response.body.result.values[0][uidField.id];
    //         const recordId = response.body.result.values[0].id;
    //         cy.contains(`tr`, loanEnquiryId).find(`td`).contains(loanEnquiryId).click({ force: true })
    //         cy.wait("@getBiztab", { timeout: 10000 }).then(({ response }) => {
    //             const piField = response.body.result.find(fld => fld.label === "Personal Information");
    //             cy.intercept("GET", `**/rms/records/${recordId}?module=dsa&asset=loan_enquiry&catId=681c4fcf8428f38032e71227&fieldGroup=${piField.id}`).as("piFieldGroup")
    //             if (!piField) { this.skip() }
    //             cyGet(`[aria-label="Simple Tab"] [aria-label="${piField?.label}"]`)
    //                 .should("contain.text", piField?.label)
    //                 .click()
    //             cy.wait("@piFieldGroup", { timeout: 10000 }).then(({ response }) => {
    //                 const recordProfile = response?.body?.result?.profile || [];
    //                 propwiseFields(recordProfile);
    //                 cyGet(`[data-testid="Save tab form"]`).click();
    //             });
    //         });

    //     });
    // });

    // it(`Fill income detail`, () => {
    //     cy.viewport(1920, 1200)
    //     cyGet('[data-testid="buelementgroup-box-n1f8dc7ag"]').find('[aria-label="Grid view"] button').click();
    //     cy.wait("@recordsGrid", { timeout: 10000 }).then(({ response }) => {
    //         const uidField = response.body.result.view.columns.find(fld => fld.prop === "uid")
    //         const loanEnquiryId = response.body.result.values[0][uidField.id];
    //         const recordId = response.body.result.values[0].id;
    //         cy.contains(`tr`, loanEnquiryId).find(`td`).contains(loanEnquiryId).click({ force: true })

    //         cy.wait("@getBiztab", { timeout: 10000 }).then(({ response }) => {
    //             const incomeField = response.body.result.find(fld => fld.label === "Income Details");
    //             cy.intercept("GET", `**/rms/records/${recordId}?module=dsa&asset=loan_enquiry&catId=681c4fcf8428f38032e71227&fieldGroup=${incomeField.id}`).as("incomeFieldFieldGroup")
    //             if (!incomeField) { this.skip() }
    //             cyGet(`[aria-label="Simple Tab"] [aria-label="${incomeField?.label}"]`)
    //                 .should("contain.text", incomeField?.label)
    //                 .click()
    //             cy.wait("@incomeFieldFieldGroup", { timeout: 10000 }).then(({ response }) => {
    //                 const recordProfile = response?.body?.result?.profile.slice(0, 11);
    //                 propwiseFields(recordProfile);
    //                 cyGet(`[data-testid="Save tab form"]`).click();
    //             });
    //         });

    //     });
    // });

    // it.skip(`Fill previous loan`, () => {
    //     cyGet('[data-testid="buelementgroup-box-n1f8dc7ag"]').find('[aria-label="Grid view"] button').click();
    //     cy.wait("@recordsGrid", { timeout: 10000 }).then(({ response }) => {
    //         const uidField = response.body.result.view.columns.find(fld => fld.prop === "uid")
    //         const loanEnquiryId = response.body.result.values[0][uidField.id];
    //         const recordId = response.body.result.values[0].id;
    //         cy.contains(`tr`, loanEnquiryId).find(`td`).contains(loanEnquiryId).click({ force: true })
    //         cy.wait("@getBiztab", { timeout: 10000 }).then(({ response }) => {
    //             const plField = response.body.result.find(fld => fld.label === "Previous Loan");
    //             cy.intercept("GET", `**/rms/records/${recordId}?module=dsa&asset=loan_enquiry&catId=681c4fcf8428f38032e71227&fieldGroup=${plField.id}`).as("plFieldFieldGroup")
    //             if (!plField) { this.skip() }
    //             cyGet(`[aria-label="Simple Tab"] [aria-label="${plField?.label}"]`)
    //                 .should("contain.text", plField?.label)
    //                 .click()
    //             cy.wait("@plFieldFieldGroup", { timeout: 10000 }).then(({ response }) => {
    //                 const recordProfile = response?.body?.result?.profile || [];
    //                 propwiseFields(recordProfile);
    //                 cyGet(`[data-testid="Save tab form"]`).click();
    //             });
    //         });

    //     });
    // });



    it(`Edit loan request`, () => {
        cy.visit(`${updatedUrl}/loan_requests`)
        cyGet('[data-testid="buelementgroup-box-n1f8dc7ag"]').find('[aria-label="Grid view"] button').click();
        cy.wait("@recordsGrid", { timeout: 10000 }).then(({ response }) => {
            const uidField = response.body.result.view.columns.find(fld => fld.prop === "uid")
            loanRequestId = response.body.result.values[0][uidField.id];
            recordId = response.body.result.values[0].id;
            cy.intercept("GET", `**/rms/records/${recordId}?*`).as("getRecord")
            cy.contains(`tr`, loanRequestId).find(`td`).contains(loanRequestId).click({ force: true })
            cy.wait("@getRecord", { timeout: 10000 }).then(({ response }) => {
                const fieldsONDetailPage = response.body.result.profile.filter(fld => fld.readOnly === false && fld.label !== "Loan type");
                propwiseFields(fieldsONDetailPage);
                buSaveButton().click();
            });

        });
    });

    it(`Disbursement Details`, () => {
        cy.visit(`${updatedUrl}/loan_requests`)
        cyGet('[data-testid="buelementgroup-box-n1f8dc7ag"]').find('[aria-label="Grid view"] button').click();
        // cy.wait("@recordsGrid", { timeout: 10000 }).then(({ response }) => {
        //     const uidField = response.body.result.view.columns.find(fld => fld.prop === "uid")
        //     const loanreqId = response.body.result.values[0][uidField.id];
        //     const recordId = response.body.result.values[0].id;
        cy.contains(`tr`, loanRequestId).find(`td`).contains(loanRequestId).click({ force: true })
        cy.wait("@getBiztab", { timeout: 10000 }).then(({ response }) => {
            const ddField = response.body.result.find(fld => fld.label === "Disbursement Details");
            cy.intercept("GET", `**/rms/records/${recordId}?module=dsa&asset=loan_request&catId=681c5beac156d3875c09210f&fieldGroup=${ddField.id}`).as("ddFieldFieldGroup")
            if (!ddField) { this.skip() }
            cyGet(`[aria-label="Simple Tab"] [aria-label="${ddField?.label}"]`)
                .should("contain.text", ddField?.label)
                .click()
            cy.wait("@ddFieldFieldGroup", { timeout: 10000 }).then(({ response }) => {
                const allFields = response?.body?.result?.profile || [];
                // const customiseLoanFields = getRequiredFieldsByLoanType(allFields, 'Personal Loan');
                propwiseFields(allFields);
                cyGet(`[data-testid="Save tab form"]`).click();
            });
        });

        // });
    });

    it(`Edit stage - Disbursed`, () => {
        cy.visit(`${updatedUrl}/loan_requests`)
        cyGet('[data-testid="buelementgroup-box-n1f8dc7ag"]').find('[aria-label="Grid view"] button').click();
        // cy.wait("@recordsGrid", { timeout: 10000 }).then(({ response }) => {
        //     const uidField = response.body.result.view.columns.find(fld => fld.prop === "uid")
        //     loanRequestId = response.body.result.values[0][uidField.id];
        //     const recordId = response.body.result.values[0].id;
        cy.intercept("GET", `**/rms/records/${recordId}?*`).as("getRecord")
        cy.contains(`tr`, loanRequestId).find(`td`).contains(loanRequestId).click({ force: true })
        fieldOnForm(`#detail-form [data-testid="budropdown-box-ty1opau5a"] label`, "Stage", "input").click()
        buSearchbox(globalSel.search, "Disbursed")
        budropdownOption("Disbursed", `[data-testid="buchip-chip-5r51zm55o"]`).click()
        buSaveButton().click();
        // });
    });

    it(`Confirm that the loan request moved to the borrower after Disbursed.`, () => {
        cy.visit(`${updatedUrl}/borrowers`)
        cyGet('[data-testid="buelementgroup-box-n1f8dc7ag"]').find('[aria-label="Grid view"] button').click();
        cy.wait("@recordsGrid", { timeout: 10000 }).then(({ response }) => {
            const uidField = response.body.result.view.columns.find(fld => fld.prop === "uid")
            const borrowerId = response.body.result.values[0][uidField.id];

            const recordId = response.body.result.values[0].id;
            cy.contains(`tr`, borrowerId).find(`td`).contains(borrowerId).click({ force: true })
            cy.wait("@getBiztab", { timeout: 10000 }).then(({ response }) => {
                const loanReqAscField = response.body.result.find(fld => fld.label === "Loan Request Association");
                cy.intercept("GET", `**/rms/associations?page=1&rows=25&src=borrower&dest=${loanReqAscField?.catId}&recordId=${recordId}`).as("loanReqAssociaction")
                // if (!ddField) { this.skip() }
                cyGet(`[aria-label="Simple Tab"] [aria-label="${loanReqAscField?.label}"]`)
                    .should("contain.text", loanReqAscField?.label)
                    .click()
                cy.wait("@loanReqAssociaction", { timeout: 10000 }).then(({ response }) => {
                    response.body.result.values.forEach(ele => {
                        expect(ele).has.property("title", loanRequestId)
                    })
                });
            });
        });
    })
});
