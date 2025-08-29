const { cyGet } = require('../../../../helpers/global');
const lead = require('../../../../selector/lead')
describe(`Nevigate the lead page and Test Header componet`, () => {

    const url = Cypress.env("url");
    const module = Cypress.env("module");
    const asset = Cypress.env("asset");
    let updatedUrl = url.replace("one", module);
    const assetName = asset.charAt(0).toUpperCase() + asset.slice(1)

    beforeEach(() => {
        cy.intercept(`**/crew/users/app-auth?*`).as("appAuth")
        cy.intercept("GET", `**/crew/users/pipelines?*`).as("crewPipelines")
        cy.visit(`${updatedUrl}/${asset}s`)
    });

    it(`Header componet of lead management`, () => {
        /*
            Company profile Icon and Name should be present
            Action, Export, Import and Create lead button should be present
            Pipeline-user Show and add icon should be present
            List view, Kanban view and Chart view button should be present
        */

        // Company profile Icon and Name
        cy.wait("@appAuth").then(({ response }) => {
            cy.get('#bu-layout h6').should("have.text", response.body.result.company.label)
        })

        // Action button
        cyGet(`[data-testid="Action"]`).should("contain.text", "Action")

        // Export button
        cyGet(`[data-testid="Export"]`).should("contain.text", "Export")

        // Import Button
        cyGet(`[data-testid="Import"]`).should("contain.text", "Import")

        // Create record button
        cyGet(`[data-testid="Create ${assetName}"]`).should("contain.text", `Create ${assetName}`)

        // Pipeline-user Show and add icon
        cy.wait("@crewPipelines").then(({ response }) => {
            let userOnPip = response.body.result.values.length
            if (userOnPip > 4) {
                let userInPlusIcon = response.body.result.pages.totalRecords - 3
                cy.get('#bu-layout [data-testid="activitybar-box-txgt1t82k"] [data-testid="buavatargroup-avatargroup-dovjvw4cl"] .MuiAvatarGroup-avatar').contains(userInPlusIcon)
            } else {
                cy.get('#bu-layout [data-testid="activitybar-box-txgt1t82k"] [data-testid="buavatargroup-avatargroup-dovjvw4cl"] .MuiAvatarGroup-avatar').then(($el) => {
                    expect($el.length).be.eq(userOnPip)
                })
            }

        })
        // List view button
        cy.get('#bu-layout [aria-label="Grid view"]').children("button").should("have.attr", "type", "button")
        // Kanban view button
        if (asset === "contact") {
            cy.get('#bu-layout [aria-label="Card view"]').children("button").should("have.attr", "type", "button")
        } else {
            cy.get('#bu-layout [aria-label="Kanban view"]').children("button").should("have.attr", "type", "button")
        }

        // Chart view button
        cy.get('#bu-layout [aria-label="Chart view"]').children("button").should("have.attr", "type", "button")
    })
})

