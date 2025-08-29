const { faker } = require('@faker-js/faker')
const lead = require('../../../../selector/lead');
const { cyGet, buSaveButton, onesecondWait, twosecondWait, buCaption, budropdown } = require('../../../../helpers/global');
const { propwiseFields } = require('../../../../helpers/record');
const globalSel = require('../../../../selector/globalSel');
const messages = require('../../../../helpers/messages');
describe(`Test the functionality of task`, () => {
    const url = Cypress.env("url");
    const module = Cypress.env("module");
    const asset = Cypress.env("asset");
    let updatedUrl = url.replace("one", module);

    beforeEach(() => {
        cy.intercept("GET", `**/crew/users/app-auth?*`).as("appAuth");
        cy.intercept("POST", `**/fms/pipelines/exists?*`).as("existsPipelines");
        cy.intercept("GET", `**/crew/owners?*`).as("owners");
        cy.intercept(`GET`, `**/fms/forms/create?*`).as("getformDetails");
        cy.intercept(`GET`, `**/rms/tools/tasks?*`).as("getTask");
        cy.intercept(`POST`, `**/rms/tools/tasks?*`).as("postTask");
        cy.visit(`${updatedUrl}/${asset}s`);
        cyGet('[data-testid="buelementgroup-box-n1f8dc7ag"]').find('[aria-label="Split view"] button').click();
        // cy.wait(5000);
    });

    const searchAndChooseTask = (action) => {
        return cy.wait("@getTask", { timeout: 10000 }).then(({ response }) => {
            const values = response.body.result.values.filter(ele => ele.title)
            cy.intercept(`GET`, `**/rms/records/${values[0].id}?*`).as("getTaskById");
            cy.get('[data-testid="header-iconbutton-kigmjsnx1"]').click();
            cyGet('[data-testid="header-textfield-269ovwuta"] input[placeholder="search...."]').type(values[0].title);
            cyGet('[data-testid="communicationbar-box-951cbwqi4"] [data-testid="dynamiccard-box-bi7o2ronw"] [data-testid="dropdownmenu-iconbutton-ewv06idu4"]').first().click();
            cyGet(`[data-testid="dropdownmenu-menuitem-8dkurn6h8"]`).contains(action).click();
        });
    };

    it(`Verify auto assignment to login user`, () => {
        cy.wait("@appAuth", { timeout: 10000 }).then(({ response }) => {
            const loginUser = response.body.result.user
            cy.wait("@existsPipelines", { timeout: 10000 }).then(({ response }) => {

                cyGet(`[aria-label="Tasks"]`).click()
                twosecondWait()
                cyGet(`button[type="button"]`).contains("Create task").click({ force: true });
                cy.wait("@owners", { timeout: 10000 }).then(({ response }) => {
                    const findLoginUser = response.body.result.values.find(ele => ele.subLabel === loginUser.email)
                    cyGet(`#buForm [data-testid="avatarinput-textfield-ojwxr8kdk"]`)
                        .contains("Assigned to")
                        .next()
                        .find(`[data-testid="buchip-chip-5r51zm55o"] span`)
                        .should("contain.text", findLoginUser?.label)
                });
            })
        });
    });

    it(`Create task in ${asset}`, () => {
        cy.wait("@existsPipelines", { timeout: 10000 }).then(({ response }) => {
            cyGet(`[aria-label="Tasks"]`).click()
            twosecondWait()
            cyGet(`button[type="button"]`).contains("Create task").click({ force: true });
            cy.wait("@getformDetails", { timeout: 10000 }).then(({ response }) => {
                // twosecondWait()
                propwiseFields(response.body.result.values)
                // twosecondWait()
                cyGet(`[data-testid="buttongroup-dialogactions-fb25djtod"] [data-testid="Save"]`).click();
                cy.wait("@postTask", { timeout: 10000 }).then(({ response }) => {
                    expect(response.body).has.property("message", messages.created)
                })
            });
        });
    });

    it(`Edit task in ${asset}`, () => {

        cy.wait("@existsPipelines", { timeout: 10000 }).then(({ response }) => {

            cyGet(`[aria-label="Tasks"]`).click()
            twosecondWait()
            searchAndChooseTask("Edit").then(() => {
                cy.wait("@getTaskById", { timeout: 10000 }).then(({ response }) => {
                    const profile = response.body.result.profile;
                    propwiseFields(profile);
                });
                cyGet(`[data-testid="buttongroup-dialogactions-fb25djtod"] [data-testid="Save"]`).click();
            });
        });
    });

    it(`Delete task`, () => {
        const msg1 = "Delete task";
        const msg2 = "Are you sure you want to delete this task?";
        cy.wait("@existsPipelines", { timeout: 10000 }).then(({ response }) => {
            cyGet(`[aria-label="Tasks"]`).click()
            twosecondWait()
            searchAndChooseTask("Delete").then(() => {
                buCaption(globalSel.dialogTitle, globalSel.dialogTitleText, msg1, globalSel.dialogconfirmationbox, msg2);
                cyGet(globalSel.deltestid).click();
            });
        });
    });
})

