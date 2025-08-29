const { busimpledropdown, buCaption, buButton, budropdown } = require('../../../../helpers/global');
const { method } = require('../../../../helpers/helper');
const messages = require('../../../../helpers/messages');
const globalSel = require('../../../../selector/globalSel');
const pipelineSel = require('../../../../selector/pipelineSel');

describe(`Nevigate the setting page and delete pipeline`, () => {
    const url = Cypress.env("url")
    const module = Cypress.env("module")
    const asset = Cypress.env("asset")
    let updatedUrl = url.replace("one", module);

    beforeEach(function () {
        cy.intercept(method.get, '**/fms/pipelines?*').as("getPipeline")
        if (asset === "contact") { this.skip() };
        cy.visit(`${updatedUrl}/setting/${asset}`)

        cy.wait(2000)
    });

    it(`Delete pipeline`, () => {
        let countZeroPip;
        let msg1 = "Delete Pipeline Confirmation";

        cy.wait("@getPipeline", { timeout: 10000 }).then(({ response }) => {
            const pipelines = response.body.result.values.map(ele => ele.label)
            if (pipelines.length === 1) {
                busimpledropdown(pipelineSel.options, messages.pipAction, globalSel.del, messages.deletePip);
                buCaption(globalSel.dialogTitle, globalSel.dialogTitleText, msg1, globalSel.dialogconfirmationbox, msg2)
                buButton(globalSel.deltestid).click()
                cy.get('.MuiSnackbarContent-message').should("have.text", "Last pipeline can't be deleted")
            } else {
                const piplength = response.body.result.values.length
                countZeroPip = response.body.result.values.find(ele => ele.count === 0)
                if (!countZeroPip) {
                    cy.pipelineData(module, asset).then((pipData) => {
                        const piplabel = pipData.map(ele => ele.label)
                        cy.log(JSON.stringify(piplabel))
                        countZeroPip = response.body.result.values.find(ele => ele.count === 0)
                        if (!countZeroPip) { throw new Error(`Pipeline not available for delete`) }
                    });
                };
                let msg2 = `You are about to delete the project titled ${countZeroPip?.label}.`
                budropdown(globalSel.settinglayoutbox, `button ${globalSel.buttonTypography}`, pipelines[0], piplength, globalSel.search, countZeroPip?.label, globalSel.dialogTitleText);
                busimpledropdown(pipelineSel.options, messages.pipAction, globalSel.del, messages.deletePip);
                buCaption(globalSel.dialogTitle, globalSel.dialogTitleText, msg1, globalSel.dialogconfirmationbox, msg2)
                buButton(globalSel.deltestid).click()
            };
        })

    });

    it(`Pipeline should not delete which contains record`, () => {
        let pipcontainRecord;
        cy.wait("@getPipeline", { timeout: 10000 }).then(({ response }) => {
            const pipelines = response.body.result.values.map(ele => ele.label);
            pipcontainRecord = response.body.result.values.find(ele => ele.count > 0)
            if (pipelines.length === 1) {
                busimpledropdown(pipelineSel.options, messages.pipAction, globalSel.del, messages.deletePip);
                buCaption(globalSel.dialogTitle, globalSel.dialogTitleText, msg1, globalSel.dialogconfirmationbox, msg2)
                buButton(globalSel.deltestid).click()
                cy.get('.MuiSnackbarContent-message').should("have.text", "Last pipeline can't be deleted")
            } else {

                budropdown(globalSel.settinglayoutbox, `button ${globalSel.buttonTypography}`, pipelines[0], pipelines.length, globalSel.search, pipcontainRecord?.label, globalSel.dialogTitleText);
                busimpledropdown(pipelineSel.options, messages.pipAction, globalSel.del, messages.deletePip);
                buButton(globalSel.del)
                    .should("have.attr", "aria-disabled", "true")
                    .trigger("mouseover", { force: true })
                cy.get('.MuiTooltip-tooltip').should("have.text", "Pipeline contains lead")
            };
        });

    });
});

