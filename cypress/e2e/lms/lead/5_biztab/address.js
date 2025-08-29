const { faker } = require('@faker-js/faker')
const lead = require('../../../../selector/lead')
const { cyGet, twosecondWait, buSaveButton } = require('../../../../helpers/global')
const { propwiseFields } = require('../../../../helpers/record')
const messages = require('../../../../helpers/messages')
const url = Cypress.env("url")
const module = Cypress.env("module")
const asset = Cypress.env("asset")
let updatedUrl = url.replace("one", module);

describe(`Test the functionality of Addresses`, function () {

    let addressField;

    beforeEach(() => {
        cy.intercept("GET", "**/rms/tools/addresses?*").as("addressDeatail")
        cy.intercept("GET", "**/fms/biztabs?*").as("getBiztab")
        cy.intercept("GET", "**/fms/forms/?*").as("getAddresssForm")
        cy.intercept("GET", "**/rms/tools/states?*").as("states")
        cy.intercept("GET", "**/rms/tools/cities?*").as("cities")
        cy.visit(`${updatedUrl}/${asset}s`)
        cyGet('[data-testid="splitview-g-w1aobu38w"]').click({ force: true })
        cy.wait("@getBiztab", { timeout: 10000 }).then(({ response }) => {
            addressField = response.body.result.find(fld => fld.prop === "add");
        })
    });

    context(`Test the functionality of add address`, function () {
        it(`Add address`, function () {
            // cy.wait("@getBiztab", { timeout: 10000 }).then(({ response }) => {
            //     addressField = response.body.result.find(fld => fld.prop === "add");
            if (!addressField) { this.skip() }
            cyGet(`[aria-label="Simple Tab"] [aria-label=${addressField?.label}]`)
                .should("contain.text", addressField?.label)
                .click()
            cyGet(`[data-testid="Add"]`).click()
            twosecondWait()
            cy.wait("@getAddresssForm", { timeout: 10000 }).then(({ response }) => {
                const fieldsOnAddressForm = Object.values(response.body.result.fields);
                propwiseFields(fieldsOnAddressForm, {}, [], true)
                cyGet(`#clone`).check()
                cyGet('[data-testid="buwrapper-box-2gkcmtrgi"] > [data-testid="buttongroup-box-ell22p9ne"] > [data-testid="buttongroup-dialogactions-fb25djtod"] > * > [data-testid="Save"]').click();
                cyGet('.MuiSnackbarContent-message').should("contain.text", messages.created);
            })
            // })
        });
    });

    context(`Test the functionality of edit address`, function () {

        it(`Edit address`, function () {

            if (!addressField) { this.skip() }
            cyGet(`[aria-label="Simple Tab"] [aria-label=${addressField?.label}]`)
                .should("contain.text", addressField?.label)
                .click()
            cy.wait("@addressDeatail", { timeout: 10000 }).then(({ response }) => {
                const addressView = response.body.result.view;
                const billingAddress = response.body.result.billing;
                const shippingAddress = response.body.result.shipping;
                if (billingAddress || shippingAddress) {
                    const country = addressView.find((view) => view.prop === "cnt");
                    const fieldValues = billingAddress ? billingAddress.values[0][country.id] : shippingAddress.values[0][country.id]
                    cyGet(`[data-testid="addresssection-box-ykc0hvq21"] [data-testid="busimpledropdown-box-l5z1y823c"]`).first().click()
                    cyGet(`#edit`).click()
                    propwiseFields(addressView, {}, fieldValues, true)
                    cyGet('[data-testid="buwrapper-box-2gkcmtrgi"] > [data-testid="buttongroup-box-ell22p9ne"] > [data-testid="buttongroup-dialogactions-fb25djtod"] > * > [data-testid="Save"]').click();
                    cyGet('.MuiSnackbarContent-message').should("contain.text", messages.updated);
                }
            })
        });
    });

    context(`Test the functionality of delete address`, () => {

        it(`Delete address`, function () {
            if (!addressField) { this.skip() }
            cyGet(`[aria-label="Simple Tab"] [aria-label=${addressField?.label}]`)
                .should("contain.text", addressField?.label)
                .click()
            cyGet(`[data-testid="addresssection-box-ykc0hvq21"] [data-testid="busimpledropdown-box-l5z1y823c"]`).first().click()
            cyGet(`#delete`).click()
            cyGet('#customized-dialog-title p').should("have.text", "Delete Address")
            cyGet(`[role="dialog"] [data-testid="buconfirmation-typography-9lgofl82d"]`).should("contain.text", "Are you sure to delete this address?")
            cyGet(`[data-testid="Delete"]`).contains("Delete").click()
        });
    })
})
