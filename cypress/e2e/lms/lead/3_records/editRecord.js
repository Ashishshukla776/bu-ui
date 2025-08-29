const { cyGet } = require('../../../../helpers/global');
const { updateRecordScript } = require('../../../../helpers/record');

describe(`Nevigate on lead asset page and edit record`, () => {
    const url = Cypress.env("url");
    const module = Cypress.env("module");
    const asset = Cypress.env("asset");
    let updatedUrl = url.replace("one", module);
    let userRole;
    let editAccess;
    let pipelines;

    beforeEach(() => {
        cy.intercept(`**/lens/records/activities?*`).as("activity")
        cy.intercept("GET", `**/crew/users/app-auth?*`).as("appAuth")
        cy.intercept("POST", `**/fms/pipelines/exists?*`).as("existsPipeline")
        cy.intercept('POST', '**/rms/records/split?*').as("splitViewRecord")
        cy.intercept('GET', `**fms/pipelines?*`).as("getPipeline")
        cy.visit(`${updatedUrl}/${asset}s`)
        cyGet('#bu-layout [aria-label="Split view"]').click()
        cy.wait("@appAuth", { timeout: 10000 }).then(({ response }) => {
            userRole = response.body.result.user.role
        })
        cy.wait("@existsPipeline", { timeout: 10000 }).then(({ response }) => {
            editAccess = response.body.result.tools.create
        })
        cyGet(`[data-testid="butoolbar-grid-2yad1y8r5"] [data-testid="budropdown-box-ty1opau5a"] button`).click({ force: true })
        cy.wait("@getPipeline", { timeout: 10000 }).then(({ response }) => {
            pipelines = response.body.result.values
        });
    });


    it(`Edit record with single line text field`, () => { updateRecordScript(["str"], userRole, editAccess, pipelines) });
    it(`Edit record with multi line text field`, () => { updateRecordScript(["txa"], userRole, editAccess, pipelines) });
    it(`Edit record with email field`, () => { updateRecordScript(["eml"], userRole, editAccess, pipelines) });
    it(`Edit record with number field`, () => { updateRecordScript(["num"], userRole, editAccess, pipelines) });
    it(`Edit record with url field`, () => { updateRecordScript(["url"], userRole, editAccess, pipelines) });
    it(`Edit record with phn field`, () => { updateRecordScript(["phn"], userRole, editAccess, pipelines) });
    it(`Edit record with simple dropdown field`, () => { updateRecordScript(["bas"], userRole, editAccess, pipelines) });
    // it(`Edit record with chip dropdown field`, () => { updateRecordScript(["chp"], userRole, editAccess, pipelines) });
    it(`Edit record with checkbox field`, () => { updateRecordScript(["chk"], userRole, editAccess, pipelines) });
    it(`Edit record with radio field`, () => { updateRecordScript(["rad"], userRole, editAccess, pipelines) });
    it(`Edit record with data source field`, () => { updateRecordScript(["dsrc"], userRole, editAccess, pipelines) });
    // it(`Edit record with rating field`, () => { updateRecordScript(["rtg"], userRole, editAccess, pipelines) });

});
