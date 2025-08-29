const { formatModuleName } = require('../../../../helpers/global');
const lead = require('../../../../selector/lead')
describe(`Nevigate the lead page and Test Header componet`, () => {

    const url = Cypress.env("url");
    const module = Cypress.env("module");
    const asset = Cypress.env("asset");
    let updatedUrl = url.replace("one", module);

    beforeEach(() => {
        cy.intercept("GET", `**/crew/users/app-auth?*`).as("appAuth")
        cy.visit(`${updatedUrl}/${asset}s`)
    });

    it(`Header componet of lead management`, () => {
        cy.get('#app-routes > header > .MuiToolbar-root .MuiButtonBase-root > :first ')
        // .should("have.css", "color", "rgba(0, 0, 0, 0.6)").and("have.css", "height")
        // .and("have.css", "width")

        cy.get('#app-routes > header a[href="/dashboard"]').should("have.attr", "style", "display: flex;")
        cy.get('#app-routes > header h6').should("have.text", formatModuleName(module))

        // Check Light/Dark mode functionality
        cy.get('#app-routes > header [aria-label] :first .MuiTypography-root').then(($item) => {
            let data = $item.text()
            cy.log(data)
            if (data === "OFF") {
                cy.get('#app-routes > header [role="switch"]').click({ force: true })
                cy.get('#app-routes > header [aria-label] :first .MuiTypography-root').should("have.text", "ON")
            } else if (data === "ON") {
                cy.get('#app-routes > header [role="switch"]').click({ force: true })
                cy.get('#app-routes > header [aria-label] :first .MuiTypography-root').should("have.text", "OFF")
            }
        })

        // Check Notifications button present on header or not
        cy.get('#app-routes > header [aria-label="Notifications"]').click()
        cy.get('.MuiDrawer-paperAnchorRight h6').should("have.text", "Notifications")
        cy.get('.MuiDrawer-paperAnchorRight .MuiBox-root > .MuiButtonBase-root .MuiSvgIcon-fontSizeSmall').click()

        // Check Settings button present on header or not
        cy.get('#app-routes > header [aria-label="Settings"] button').should("have.attr", "type", "button")

        // Check User Profile button present on header or not
        cy.get('#app-routes > header [aria-label="User Profile"] button').should("have.attr", "aria-label", "account of current user").click()
        cy.wait("@appAuth").then(({ response }) => {
            cy.get('.MuiPaper-root [role="menu"] .MuiTypography-root').contains(response.body.result.user.email)
            cy.get('.MuiPaper-root [role="menu"] .MuiTypography-root').contains(response.body.result.company.label)
            cy.get('.MuiPaper-root [role="menu"] .MuiTypography-root').contains(response.body.result.company.name)
        });
    });
});

