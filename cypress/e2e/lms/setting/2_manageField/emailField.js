const { faker } = require('@faker-js/faker')
const lead = require('../../../../selector/lead')
const { searchField, labelNplaceholder, preview } = require('../../../../helpers/field')
const { method } = require('../../../../helpers/helper')
const { buButton, cyGet, budropdownInput, buSaveButton, budropdown } = require('../../../../helpers/global')
const globalSel = require('../../../../selector/globalSel')
const fieldSel = require('../../../../selector/fieldSel')
const { request } = require('../../../../selector/utility')

describe(`Nevigate the setting page and test the email fields`, () => {
    let appAuthRes;
    const url = Cypress.env("url")
    const module = Cypress.env("module")
    const asset = Cypress.env("asset")
    let updatedUrl = url.replace("one", module);
    const allowedMailDomain = ["gmail.com", "yahoo.com", "yopmail.com", "outlook.com", "hotmail.com", "aol.com", "msn.com"]

    beforeEach(() => {
        cy.intercept(method.get, `**/crew/users/app-auth?*`).as("appAuth")
        cy.intercept(method.get, `**/rms/assets/pipelines?*`).as("assetsPipeline")
        cy.intercept(method.get, '**/fms/fields/grid?*').as("fieldGrid")
        cy.visit(`${updatedUrl}/setting/properties`)
    })

    const emlComponentSel = (name, initialMode, setMode, modeType, modeval) => {
        labelNplaceholder(name, `Enter Email`)
        budropdown(globalSel.dialogContent, `button ${globalSel.buttonTypography}`, initialMode, null, null, setMode, globalSel.dialogTitleText);
        budropdown(globalSel.dialogContent, `button ${globalSel.buttonTypography}`, modeType, 6, globalSel.search, modeval, globalSel.dialogTitleText);
        cyGet(`${globalSel.dialogContent} [data-testid="button-stack-alorzfaoj"]`).last().click()     // for close the dropdown
        preview(name, `Enter Email`)
        buSaveButton().click()
    }

    it(`Field name should be unique`, () => {
        cy.wait("@appAuth", { timeout: 10000 }).then(({ response }) => {
            const roleOfUser = response.body.result.user.role
            const manageProperties = response.body.result.settings.permission[asset].manageProperties
            if (roleOfUser === "std" && manageProperties === false) {
                buButton(fieldSel.createFieldBtn).should("be.dissabled");
            } else {
                cy.wait("@fieldGrid", { timeout: 10000 }).then(({ response }) => {
                    const existingField = response.body.result.values.find(fld => fld.group?.scope === "public")
                    buButton(fieldSel.createFieldBtn).contains("Create field").click();
                    labelNplaceholder(existingField?.label, `Please Enter ${existingField?.label}`);
                    cyGet(`#string_label-helper-text`).should("contain.text", "Field label already exists")
                    buSaveButton().should("be.disabled")
                })
            };
        });
    });

    it(`Create email field when Mode of Email is Allow All`, () => {
        const fieldLabel = `Email-${new Date().valueOf()}`;
        cy.wait("@appAuth", { timeout: 10000 }).then(({ response }) => {
            cy.wrap(response.body.result).as("appAuthResponse")
            const roleOfUser = response.body.result.user.role
            const manageProperties = response.body.result.settings.permission[asset].manageProperties
            if (roleOfUser === "std" && manageProperties === false) {
                buButton(fieldSel.createFieldBtn).should("be.dissabled");
            } else {
                buButton(fieldSel.createFieldBtn).contains("Create field").click();
                cyGet(`${fieldSel.fieldlabelbox}`).contains("Select Field Type")
                budropdownInput(`${globalSel.muiInput} input[name="Select Field Type"]`, "Single line text", 6, `${globalSel.searchbox} input`, "Email", globalSel.dialogTitleText)
                labelNplaceholder(fieldLabel, `Please Enter Email`)
                cyGet('[data-testid="withtitle-inputlabel-9gzd3akk8"]').should("have.text", "Mode of Email")
                budropdown(globalSel.dialogContent, `button ${globalSel.buttonTypography}`, "Allow All")
                preview(fieldLabel, `Please Enter Email`)
                buSaveButton().click()
            };
        });
        cy.get("@appAuthResponse").then((res) => {
            appAuthRes = res
        })
    });

    it(`Create email field when Mode of Email is Allow some`, () => {
        let label = `Email-${new Date().valueOf()}`;
        const roleOfUser = appAuthRes.user.role;
        const manageProperties = appAuthRes.settings.permission[asset].manageProperties
        if (roleOfUser === "std" && manageProperties === false) {
            buButton(fieldSel.createFieldBtn).should("be.dissabled");
        } else {
            buButton(fieldSel.createFieldBtn).contains("Create field").click();
            cyGet(`${fieldSel.fieldlabelbox}`).contains("Select Field Type")
            budropdownInput(`${globalSel.muiInput} input[name="Select Field Type"]`, "Single line text", 6, `${globalSel.searchbox} input`, "Email", globalSel.dialogTitleText)
            emlComponentSel(label, "Allow All", "Allow Some", "Select Domains", "gmail.com");
        };
    });

    it(`Edit email field for Allow some Email domains`, () => {
        let label = `Email-${new Date().valueOf()}`;
        cy.wait("@assetsPipeline").then(({ response }) => {
            let assetPipId = response.body.result.values.map(ele => ele.id);
            cy.wrap(assetPipId[0]).as("assetPipId");
        });
        // cy.get("@assetPipId").then((response) => { assetPipelineId = response });
        searchField("eml", null, 'Edit').then((field) => {
            cy.get('[data-testid="close-dialog"]').click()
            // const fieldId = field?.id
            cy.intercept('GET', `**/fms/fields/${field.id}?*`).as("getFieldById")
            searchField("phn", field.label, 'Edit')
            cy.wait("@getFieldById", { timeout: 10000 }).then(({ response }) => {
                let modetype
                const mode = response.body.result.mode
                const exclude = response.body.result.excludes
                const updatedDomains = allowedMailDomain.filter(domain => !exclude.includes(domain));
                if (mode === 1) { modetype = "Allow Some" }
                else if (mode === 0) { modetype = "Restrict Some" }
                else { modetype = "Allow All" }
                emlComponentSel(label, modetype, "Allow Some", exclude[0], updatedDomains[0]);
            })
        });
    });

    it(`Create email field when Mode of Email is Restrict some`, () => {
        let label = `Email-${new Date().valueOf()}`;
        const roleOfUser = appAuthRes.user.role;
        const manageProperties = appAuthRes.settings.permission[asset].manageProperties
        if (roleOfUser === "std" && manageProperties === false) {
            buButton(fieldSel.createFieldBtn).should("be.dissabled");
        } else {
            buButton(fieldSel.createFieldBtn).contains("Create field").click();
            cyGet(`${fieldSel.fieldlabelbox}`).contains("Select Field Type")
            budropdownInput(`${globalSel.muiInput} input[name="Select Field Type"]`, "Single line text", 6, `${globalSel.searchbox} input`, "Email", globalSel.dialogTitleText)
            emlComponentSel(label, "Allow All", "Allow Some", "Select Domains", "yahoo.com");
        };
    });

    it(`Edit email field for Restricted Email domains`, () => {
        let label = `Email-${new Date().valueOf()}`;
        searchField("eml", null, 'Edit').then((field) => {
            cy.get('[data-testid="close-dialog"]').click()
            // const fieldId = field?.id
            cy.intercept('GET', `**/fms/fields/${field.id}?*`).as("getFieldById")
            searchField("phn", field.label, 'Edit')
            cy.wait("@getFieldById", { timeout: 10000 }).then(({ response }) => {
                let modetype
                const mode = response.body.result.mode
                const exclude = response.body.result.excludes
                const updatedDomains = allowedMailDomain.filter(domain => !exclude.includes(domain));
                if (mode === 1) { modetype = "Allow Some" }
                else if (mode === 0) { modetype = "Restrict Some" }
                else { modetype = "Allow All" }
                emlComponentSel(label, modetype, "Restrict Some", exclude[0], updatedDomains[0]);
            })
        });
    })
})
