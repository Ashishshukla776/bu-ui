const { fillForms } = require("../../helpers/forms");
const { cyGet, onesecondWait, budropdownInput, buSearchbox, budropdownOption, twosecondWait, logout, buSaveButton } = require("../../helpers/global");
const globalSel = require("../../selector/globalSel");

describe(`Nevigate the lead page and Create Lead`, () => {

    const url = Cypress.env("url");
    const module = Cypress.env("module");
    const asset = Cypress.env("asset");
    let updatedUrl = url.replace("one", module);
    let userRole;

    beforeEach(function () {
        cy.intercept("GET", `**/crew/users/app-auth?*`).as("appAuth")
        cy.intercept("POST", `**/rms/records/grid?*`).as("recordsGrid")
        cy.intercept("GET", `**/fms/forms/shared/*`).as("formShared")
        cy.intercept("GET", `**/crew/users?verified=true`).as("verifiedUser")
        cy.intercept("GET", `**/grd/modules`).as("modules")
        cy.intercept("POST", `**/rms/resources/form/form-cards?*`).as("formCards")

    })

    it(`Publish Form - public`, () => {
        cy.visit(`${updatedUrl}/${asset}s`)
        cy.wait("@appAuth", { timeout: 10000 }).then(({ response }) => {
            userRole = response.body.result.user.role
            if (userRole === "std") { this.skip() }
        });
        cyGet('[data-testid="buelementgroup-box-n1f8dc7ag"]').find('[aria-label="Grid view"] button').click();
        cy.wait(1000)
        cy.wait("@recordsGrid", { timeout: 10000 }).then(({ response }) => {
            const uidField = response.body.result.view.columns.find(fld => fld.prop === "uid")
            const formId = response.body.result.values[0][uidField.id]
            cy.contains('tr', formId).find(`[data-testid="Action"]`).click();
            cyGet(`#Share`).click()
            onesecondWait()
            cyGet(`[role="dialog"] #public`).click()
            cyGet(`[aria-label="Link"] `).click()
            cy.get('textarea.Mui-readOnly')
                .should('be.visible')
                .invoke('val')
                .then((text) => {
                    cy.wrap(text).as("publicUrl")
                });
            cy.get("@publicUrl").then((sharedLink) => {
                cy.visit(sharedLink)
                cyGet(`[data-testid="navbar-typography-vmho70mcp"]`).should("contain.text", "Buopso Forms");
                cy.wait("@formShared", { timeout: 10000 }).then(({ response }) => {
                    const fieldsOnForm = response.body.result.data.fields;
                    const containerFieldIds = response.body.result.data.form.containers.flatMap(c => c.fields).filter(f => !f.hidden).map(i => i.id);
                    fillForms(containerFieldIds, fieldsOnForm)
                    cyGet('[data-testid="Submit"]').click()
                    cy.get('[data-testid="thankyou-typography-wijt6t6z8"]').should("contain.text", "Thank You!")
                    cy.get('[data-testid="thankyou-typography-3goz62tdb"]').should("contain.text", "Your submission has been received.")
                });
            });
        });
    });

    it(`Publish Form - private`, () => {
        cy.visit(`${updatedUrl}/${asset}s`)
        cy.wait("@appAuth", { timeout: 10000 }).then(({ response }) => {
            userRole = response.body.result.user.role
            if (userRole === "std") { this.skip() }
        });
        cyGet('[data-testid="buelementgroup-box-n1f8dc7ag"]').find('[aria-label="Grid view"] button').click();
        cy.wait(1000)
        cy.wait("@recordsGrid", { timeout: 10000 }).then(({ response }) => {
            const uidField = response.body.result.view.columns.find(fld => fld.prop === "uid")
            const nameField = response.body.result.view.columns.find(fld => fld.label === "Name")
            const formId = response.body.result.values[0][uidField.id]
            const formName = response.body.result.values[0][nameField.id]
            cy.contains('tr', formId).find(`[data-testid="Action"]`).click();
            cyGet(`#Share`).click()
            onesecondWait()
            cyGet(`[role="dialog"] #private`).click()
            cyGet(`[role="dialog"] #private`).click()
            budropdownInput(`input`, ``)
            cy.wait("@verifiedUser").then(({ response }) => {
                const user = response.body.result.values.find(ele => ele.subLabel !== Cypress.env("email"));
                const totalUser = response.body.result.pages.totalRecords;
                if (totalUser > 5) { buSearchbox(globalSel.search, user.label) }
                budropdownOption(user.label).first().click()
                budropdownInput(`input`, ``)
                cyGet(`[data-testid="Send"]`).click()
                logout();
                cy.login(user.subLabel);
                cy.wait("@modules").then(({ response }) => {
                    const assignModule = response.body.result
                    let updatedUrl1 = url.replace("one", assignModule[0]);
                    cy.visit(`${updatedUrl1}/resources?p=form`);
                    cy.wait("@formCards").then(({ response }) => {
                        const formDeatail = response.body.result.values.find(ele => ele.label === formName)
                        cy.intercept("GET", `**/fms/forms/${formDeatail.formId}?*`).as("formById")
                        cyGet(`[data-testid="formcardview-grid-4udo31pps"]`)
                            .first()
                            .contains(formName)
                        cyGet(`[data-testid="formcardview-grid-4udo31pps"]`)
                            .first()
                            .find(`[data-testid="Fill-up Form"]`).click()
                        cy.wait(`@formById`, { timeout: 10000 }).then(({ response }) => {
                            const fieldsOnForm = response.body.result.fields;
                            const containerFieldIds = response.body.result.form.containers.flatMap(c => c.fields).filter(f => !f.hidden).map(i => i.id);
                            fillForms(containerFieldIds, fieldsOnForm)
                            buSaveButton().click()
                        });
                    });
                });
            });
        });
    });
});
