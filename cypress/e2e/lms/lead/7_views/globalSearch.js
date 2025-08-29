const { request } = require('../../../../selector/utility');
const { cyGet, budropdownOption, busimpledropdown } = require('../../../../helpers/global');

describe(`Navigate the lead page and test grid view component`, () => {
    const url = Cypress.env("url");
    const module = Cypress.env("module");
    const asset = Cypress.env("asset");
    let updatedUrl = url.replace("one", module);
    const apiUrl = Cypress.env("apiurl");
    const gridViewUrl = `${apiUrl}/fms/views/grid`;

    beforeEach(function () {
        cy.intercept('POST', `**/rms/records/grid?*`).as("recordGrid");
        cy.intercept("POST", `**/fms/pipelines/exists?*`).as("existPipeline");
        cy.intercept("GET", `**/fms/views/grid?*`).as("gridViewConfig");
        cy.intercept("PATCH", `**/fms/views/kanban?*`).as("kanbanViewEdit");
        if (!(asset === "lead" || asset === "contact")) { this.skip() }
        cy.visit(`${updatedUrl}/${asset}s`);
        cyGet('#bu-layout [aria-label="Grid view"]').click();
    });

    const performSearch = (id, recordResponse) => {
        const phnRecord = recordResponse.values.find(ele => ele[id]);
        const uidField = recordResponse.view.columns.find(ele => ele.prop === "uid");
        if (phnRecord) {
            busimpledropdown(`[data-testid="Mobile"]`, "Mobile", `#phone`, "Mobile")
            cyGet(`[role="list"] > [data-testid="butextfield-textfield-lrb6zu6xa"]`)
                .as(`searchBox`)
                .find(`input[type="text"]`)
                .clear()
                .type(phnRecord[id]);
            cy.get("@searchBox").find(`input[type="text"]`).click()
            budropdownOption(phnRecord[uidField?.id]).first().click()
            cyGet(`#detail-form [data-testid="butextfield-textfield-lrb6zu6xa"] label`)
                .contains(uidField?.label)
                .next()
                .find(`input`)
                .should("have.value", phnRecord[uidField?.id])
        } else {
            cy.log("Record not found with Mobile number field");
        }
    };

    context(`Global search for grid view`, () => {
        it(`search using mobile number`, () => {
            cy.wait("@existPipeline", { timeout: 10000 }).then(({ response }) => {
                const { label, catId } = response.body.result;

                cy.wait("@recordGrid", { timeout: 15000 }).then(({ response }) => {
                    let systemPhnFieldId = response.body.result.view.columns.find(ele => ele.label === "Mobile number")?.id;
                    if (!systemPhnFieldId) {
                        const reqQs = { module, asset, catId };
                        const reqHeader = { Authorization: `Bearer ${Cypress.env("token")}` };

                        request("GET", gridViewUrl, reqHeader, reqQs).then(({ body }) => {
                            const mobField = body.result.values.find(ele => ele.label === "Mobile number");
                            const payload = { fields: [mobField?.id] };

                            request("PATCH", gridViewUrl, reqHeader, reqQs, payload).then(({ body }) => {
                                expect(body).to.have.property("success", true);
                            });
                        });

                        cy.reload();
                        cy.wait("@recordGrid", { timeout: 15000 }).then(({ response }) => {
                            systemPhnFieldId = response.body.result.view.columns.find(ele => ele.label === "Mobile number")?.id;
                            performSearch(systemPhnFieldId, response.body.result);
                        });
                    } else {
                        performSearch(systemPhnFieldId, response.body.result);
                    }
                });
            });
        });
    });
});
