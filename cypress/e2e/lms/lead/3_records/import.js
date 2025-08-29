const { cyGet, buSearchbox, budropdownOption, onesecondWait, twosecondWait } = require('../../../../helpers/global')
const { propwiseFields } = require('../../../../helpers/record')
const globalSel = require('../../../../selector/globalSel')
const lead = require('../../../../selector/lead')
describe(`Visit the import page and import record`, () => {
    const url = Cypress.env("url")
    const module = Cypress.env("module")
    const asset = Cypress.env("asset")
    let updatedUrl = url.replace("one", module);
    let assetData;

    beforeEach(() => {
        cy.intercept("GET", `**/fms/stages?*`).as("stage")
        cy.intercept("GET", `**/rms/assets?*`).as("getAsset")
        cy.intercept("GET", `**/fms/pipelines?*`).as("getPipeline")
        cy.intercept("GET", `**/rms/tools/imports/required-props*`).as("requiredProps")
        cy.visit(`${updatedUrl}/import`)
    })

    const assetDescription = (assetName) => {
        const descriptions = {
            lead: "Import Lead information into Buopso",
            approvel: "The revenue connected to a company, which is commonly called an opportunity.",
            contact: "The people you work with, commonly called leads or customers.",
            deal: "opportunities for generating revenue and building long-term relationships with customers.",
            task: "The revenue connected to a company, which is commonly called an opportunity.",
            product: "Products associated to the company"
        };

        return descriptions[assetName] || "";
    };

    const getFileForAsset = (assetName, pip) => {
        switch (assetName) {
            case 'lead':
            case 'approval':
                return "cypress/fixtures/data.csv";
            case 'contact':
                if (pip === "Customer") {
                    return "cypress/fixtures/customer.csv";
                } else {
                    return "cypress/fixtures/company.csv";
                }
            case 'deal':
                return "cypress/fixtures/deal.csv";

            default:
                throw new Error(`No file defined for asset: ${assetName}`);
        }
    };

    it(`Ensure the asset box is available for import on the Import page.`, () => {
        cy.wait("@getAsset", { timeout: 15000 }).then(({ response }) => {
            const assetData = response?.body?.result?.find(ast => ast.id === asset)
            cyGet(`[data-testid="importactorcard-typography-pacnp8jj6"`)
                .contains(assetData?.label)
                .next()
                .should("contain.text", assetDescription(asset))

            cyGet(`[data-testid="importactorcard-typography-pacnp8jj6"`)
                .contains(assetData?.label)
                .parent()
                .find(`button [aria-label="Select pipeline"]`)
        })
    })

    it(`Ensure the Import button is disabled until a pipeline is selected.`, () => {
        cy.wait("@getAsset", { timeout: 15000 }).then(({ response }) => {
            const assetData = response?.body?.result?.find(ast => ast.id === asset)

            cyGet(`[data-testid="importactorcard-typography-pacnp8jj6"`)
                .contains(assetData?.label)
                .parent()
                .find(`button [aria-label="Select pipeline"]`).should("contain.text", "Select pipeline")
            cyGet(`[data-testid="importactorcard-box-n9imbz6v3"] button`).should("be.disabled")
        })
    })

    it(`Download sample spreadsheet`, () => {
        cy.wait("@getAsset", { timeout: 10000 }).then(({ response }) => {
            const assetData = response?.body?.result?.find(ast => ast.id === asset)

            cyGet(`[data-testid="importactorcard-typography-pacnp8jj6"`)
                .contains(assetData?.label)
                .parent()
                .find(`button [aria-label="Select pipeline"]`).click()
            cy.wait("@getPipeline", { timeout: 10000 }).then(({ response }) => {
                const totalPipelines = response.body.result.pages.totalRecords
                const pipelineLabel = response.body.result.values.slice(0, 1).map(pip => pip.label)
                cy.log(JSON.stringify(pipelineLabel))
                if (totalPipelines > 5) { buSearchbox(globalSel.search, pipelineLabel[0]) }
                budropdownOption(pipelineLabel[0]).first().click()
                cyGet(`[data-testid="download"]`).contains("Download sample spreadsheet").click()
                cyGet(`[data-testid="withtruncate-wrapped-jhk5rb2jw"]`).contains("Download sample spreadsheet")
                cyGet(`[data-testid="downloaddrawer-typography-9qmfph90r"]`).contains("Sample import files")
                cyGet(`[data-testid="downloaddrawer-typography-j1aqze5i1"]`).contains("This sample file shows the required column headers you need for your import file")
                cyGet(`[data-testid="downloaddrawer-box-59hmn381s"] ul`)
                    // .first()
                    .find(`[data-testid="downloaddrawer-box-yv4v1mdli"] [data-testid="downloaddrawer-typography-lysrpjimb"]`)
                    .contains(assetData?.label)
                cyGet(`[data-testid="downloaddrawer-box-59hmn381s"] ul`)
                    .first()
                    .find(`[data-testid="downloaddrawer-b-ft7iumddc"]`)
                    .contains(pipelineLabel[0])
                cyGet(`[data-testid="downloaddrawer-box-59hmn381s"] ul`)
                    .first()
                    .find(`[data-testid="downloaddrawer-typography-xj4o496p9"]`)
                    .contains("CSV")

            })
            // cyGet(`[data-testid="importactorcard-box-n9imbz6v3"] button`).should("be.disabled")
        })

    })

    it(`Import file and generate record`, () => {

        cy.wait("@getAsset", { timeout: 10000 }).then(({ response }) => {
            const assetData = response?.body?.result?.find(ast => ast.id === asset)

            cyGet(`[data-testid="importactorcard-typography-pacnp8jj6"`)
                .contains(assetData?.label)
                .parent()
                .find(`button [aria-label="Select pipeline"]`).click()
            cy.wait("@getPipeline", { timeout: 10000 }).then(({ response }) => {
                const totalPipelines = response.body.result.pages.totalRecords
                const pipelineLabel = response.body.result.values.slice(0, 1).map(pip => pip.label)
                const fileName = getFileForAsset(asset, pipelineLabel[0])
                cy.log(JSON.stringify(pipelineLabel))
                if (totalPipelines > 5) { buSearchbox(globalSel.search, pipelineLabel[0]) }
                budropdownOption(pipelineLabel[0]).first().click({ force: true })
                cyGet(`[data-testid="importactorcard-typography-pacnp8jj6"`)
                    .contains(assetData?.label)
                    .parent()
                    .find(`[data-testid="importactorcard-box-n9imbz6v3"] button`).click()

                cyGet(`[data-testid="uploadfile-input-r5bkv246o"]`).selectFile(fileName, { force: true })
                twosecondWait()
                cyGet(`[data-testid="process-box-s7mkqf9qx"] > button`).contains("Next").click()
                twosecondWait()
                cyGet(`[data-testid="process-box-s7mkqf9qx"] > button`).contains("Next").click()
                cyGet(`#fileName-label`).should("contain.text", "Import file name")
                // cyGet(`input[placeholder="Enter file name"]`).should("have.value", fileName)
                cy.wait("@requiredProps", { timeout: 10000 }).then(({ response }) => {
                    const requiredFields = response.body.result.values.filter(ele => ele.required === true)
                    if (requiredFields.length > 0) {
                        propwiseFields(requiredFields)
                    }

                })
                cyGet(`[data-testid="process-box-s7mkqf9qx"] > button`).contains("Next").click()
                cyGet(`[data-testid="importcommit-box-8kavef2af"] > button`).contains("Confirm import").click()
            });
        });
    });
});

