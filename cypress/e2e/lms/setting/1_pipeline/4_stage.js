const { faker } = require('@faker-js/faker')
const { buCaption, buButton, cyGet, buSaveButton, onesecondWait, budropdown, budropdownInput } = require('../../../../helpers/global')
const pipelineSel = require('../../../../selector/pipelineSel')
const globalSel = require('../../../../selector/globalSel')
const messages = require('../../../../helpers/messages')
const { method } = require('../../../../helpers/helper')

describe(`Stage functionality test for pipeline`, () => {

    const url = Cypress.env("url")
    const module = Cypress.env("module")
    const asset = Cypress.env("asset")
    const updatedUrl = url.replace("one", module);
    const fieldLabel = `Move ${asset} to...`;
    const delNmvStg = "Delete and move Stage";

    beforeEach(function () {
        cy.intercept(method.get, '**/fms/stages?*').as("getStage");
        if (asset === "contact") { this.skip() };
        cy.visit(`${updatedUrl}/setting/${asset}`);
    });

    it(`Add new stage`, () => {
        const stageName = `${faker.commerce.productName()}-${new Date().valueOf()}`
        const subHeadingText = `You can Create/ Rename/ Delete Pipeline for ${asset} only.`
        buCaption(pipelineSel.captionbox, pipelineSel.captionHeading, `${asset}s`, pipelineSel.captionSubHeading, subHeadingText)
        onesecondWait()
        buButton(`[data-testid="Add a ${asset} Stage"]`).should("have.text", `Add a ${asset} Stage`).click()
        cyGet(`${globalSel.inputItemtextfield}`).find(`input[value='']`).type(stageName)
        onesecondWait()
        buSaveButton().should("have.text", "Save").click();
        cyGet(globalSel.SnackbarMessage).invoke('text').should('include', messages.requestSuccess)
    })

    it(`Stage can't be empty.`, () => {
        buButton(`[data-testid="Add a ${asset} Stage"]`).should("have.text", `Add a ${asset} Stage`).click()
        buSaveButton().should("be.disabled").trigger("mouseover", { force: true })
        cyGet(globalSel.tooltip).invoke('text').should('include', "Stage can't be empty.")
    })

    it(`Stage can't be duplicate.`, () => {
        buButton(`[data-testid="Add a ${asset} Stage"]`).should("have.text", `Add a ${asset} Stage`).click()
        cy.wait("@getStage", { timeout: 10000 }).then(({ response }) => {
            const stageName = response.body.result.values.map(ele => ele.label)
            cyGet(`${globalSel.inputItemtextfield}`).find(`input[value='']`).click().type(stageName[0])
        })
        buSaveButton().should("be.disabled").trigger("mouseover", { force: true })
        cyGet(globalSel.tooltip).invoke('text').should('include', "Duplicate stage name.")
    })

    it(`edit stage`, () => {
        const stageName = `${faker.commerce.productName()}-${new Date().valueOf()}`
        cyGet(`${globalSel.inputItemtextfield} input`).last().clear()
        cyGet(`${globalSel.inputItemtextfield} input`).last().type(stageName)
        buSaveButton().should("have.text", "Save").click();
        cyGet(globalSel.SnackbarMessage).invoke('text').should('include', messages.requestSuccess)
    })

    it(`delete stage`, () => {
        let stageName = `${faker.commerce.productName()}-${new Date().valueOf()}`;
        const msg2 = "Are you sure! Want to delete this Stage?"
        buButton(`[data-testid="Add a ${asset} Stage"]`).click()
        cyGet(`${globalSel.inputItemtextfield}`).find(`input[value='']`).click().type(stageName)
        buSaveButton().should("have.text", "Save").click();
        onesecondWait()
        cyGet(`${pipelineSel.stageDelIconBtn}`).last().click()
        buCaption(globalSel.dialogTitle, globalSel.dialogTitleText, "Delete Stage", pipelineSel.deletestagecaption, msg2)
        buButton(`[data-testid="Delete Stage"]`).click()
    })

    it(`Stage should not be deleted which contains record`, function () {
        cy.wait("@getStage", { timeout: 10000 }).then(({ response }) => {
            const stageWithCount = response.body.result.values.find(ele => ele.count > 0 && ele.winChance != "Won");
            if (!stageWithCount) { this.skip() }
            const msg2 = `You need to move ${stageWithCount?.count} ${asset} to delete this stage.`;
            cyGet(`[data-rbd-draggable-id="${stageWithCount?.id}"] ${pipelineSel.stageDelIconBtn}`).click({ force: true });
            buCaption(globalSel.dialogTitle, globalSel.dialogTitleText, delNmvStg, pipelineSel.deletestageConfirmatiion, msg2);
            budropdown(globalSel.dialogContent, globalSel.fieldlabelBox, fieldLabel);
            budropdownInput(`[data-testid="input-muiinput-t8mkcx347"] input`, stageWithCount?.label);
            buButton(`[data-testid="Move ${asset} and delete Stage"]`).should("be.disabled");
        })
    })

    it(`move record and delete stage`, function () {
        cy.wait("@getStage", { timeout: 10000 }).then(({ response }) => {
            const values = response.body.result.values;
            const length = values.length;
            const stageWithCount = values.find(ele => ele.count > 0 && ele.winChance != "Won");
            const msg2 = `You need to move ${stageWithCount?.count} ${asset} to delete this stage.`;
            const moveRecordStage = values.find(ele => ele.label != stageWithCount?.label && ele.winChance != "Won");
            const searchSelecor = `${globalSel.searchbox} ${globalSel.searchplaceholder}`;
            if (!stageWithCount) { this.skip() }
            cyGet(`[data-rbd-draggable-id="${stageWithCount?.id}"] ${pipelineSel.stageDelIconBtn}`).click({ force: true });
            buCaption(globalSel.dialogTitle, globalSel.dialogTitleText, delNmvStg, pipelineSel.deletestageConfirmatiion, msg2);
            budropdownInput(`[data-testid="input-muiinput-t8mkcx347"] input`, stageWithCount?.label, length, searchSelecor, moveRecordStage?.label, globalSel.dialogTitleText);
            buButton(`[data-testid="Move ${asset} and delete Stage"]`).click();
        })
    })
})