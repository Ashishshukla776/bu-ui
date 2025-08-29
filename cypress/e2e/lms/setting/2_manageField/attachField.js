const { buButton, buSearchbox, cyGet, onesecondWait } = require("../../../../helpers/global");
const fieldSel = require("../../../../selector/fieldSel");
const globalSel = require("../../../../selector/globalSel");
const { method } = require('../../../../helpers/helper');


describe(`Nevigate the setting page and create and update association fields`, () => {
    const url = Cypress.env("url")
    const module = Cypress.env("module")
    const asset = Cypress.env("asset")
    let updatedUrl = url.replace("one", module);
    beforeEach(() => {
        cy.intercept(method.get, '**/fms/fields/available?*').as("availableFiels");
        cy.visit(`${updatedUrl}/setting/properties`)

    })

    it('Attach Field', function () {
        cy.get('[data-testid="Attach field"]').click();
        cy.wait("@availableFiels", { timeout: 10000 }).then(({ response }) => {
            cy.log(JSON.stringify(response))
            const availablefieldLabel = response.body.result.values.map(ele => ele.label)
            buSearchbox(`${fieldSel.attachfieldstextfield} ${globalSel.searchplaceholder}`, availablefieldLabel[0])
            cyGet(`[data-testid="propertylist-formcontrollabel-z6t5ag0ev"] input[type="checkbox"]`).first().click()
            cyGet(`[data-testid="propertylist-formcontrollabel-z6t5ag0ev"] [data-testid="withtruncate-wrapped-jhk5rb2jw"]`)
                .contains(availablefieldLabel[0])
            buButton('[data-testid="Attach"]').click();
            onesecondWait()
            buSearchbox(`${fieldSel.searchBoxfieldGrid} ${globalSel.searchplaceholder}`, availablefieldLabel[0]);
            cyGet(`table tbody tr [aria-label="${availablefieldLabel[0]}"]`).contains(availablefieldLabel[0])
        })

    });

});