const { cyGet, twosecondWait, buSaveButton, budropdownInput } = require('../../../../helpers/global')
const { propwiseFields } = require('../../../../helpers/record')
const { labelNplaceholder } = require('../../../../helpers/field')
const globalSel = require('../../../../selector/globalSel')
const { ctmFieldSettingScript, editctmFromScript } = require('../../../../helpers/forms')
const fieldSel = require('../../../../selector/fieldSel')
const url = Cypress.env("url")
const module = Cypress.env("module")
const asset = Cypress.env("asset")
const updatedUrl = url.replace("one", module);

describe(`Test the functionality of custom form`, function () {

    const droppable = '[role="tabpanel"] [data-rbd-droppable-id="new-container"]';
    const strLabel = `Single line ${new Date().valueOf()}`
    const gridDraggable = '[data-rbd-drag-handle-draggable-id="newField@grd"]';
    const urlLabel = `URL-${new Date().valueOf()}`;
    const emlField = `Email-${new Date().valueOf()}`;

    beforeEach(() => {
        cy.intercept("POST", `**/fms/pipelines/exists?*`).as("existsPipeline")
        cy.intercept("POST", `**/fms/fields/grid?*`).as("postGrid")
        cy.intercept("GET", "**/fms/biztabs?*").as("getBiztab")
        cy.intercept("GET", "**/fms/forms/?*").as("getFormDetail")
        cy.intercept("PATCH", "**/fms/forms/?*").as("patchForm")
        cy.intercept("GET", "**/fms/fields/available?*").as("availableField")
        cy.visit(`${updatedUrl}/${asset}s`)
        cyGet('[data-testid="splitview-g-w1aobu38w"]').click({ force: true })
    });

    function addfieldonGrid(fieldType, fieldLabel) {
        cyGet(`#add`).click()
        cyGet(`${fieldSel.fieldlabelbox}`).contains("Select Field Type")
        budropdownInput(`${globalSel.muiInput} input[name="Select Field Type"]`, "Single line text", 6, `${globalSel.searchbox} input`, fieldType, globalSel.dialogTitleText);
        labelNplaceholder(fieldLabel, `Enter ${fieldLabel}`);
        cyGet('[data-testid="withpopper-dialogactions-q864yr4eh"] > [data-testid="Save"]').click()
        twosecondWait()
    }

    it(`Add field on custom form`, function () {
        editctmFromScript().then((ctmformdata) => {
            cyGet('[aria-label="Field type"]').click();
            twosecondWait()
            cy.dragAndDrop(globalSel.dragStr, droppable)
            labelNplaceholder(strLabel, `Enter ${strLabel}`)
            cyGet('[data-testid="budialog-box-xmpv7w06s"] > * > [data-testid="Save"]').click()
            twosecondWait()
            buSaveButton().click()
        });
    });

    it(`Add grid field on custom form`, function () {
        editctmFromScript().then((ctmformdata) => {
            cyGet('[aria-label="Field type"]').click();
            twosecondWait()
            cyGet(gridDraggable).find(`[data-testid="index-typography-442pqldco"]`).should("contain.text", "Grid")
            cy.dragAndDrop(gridDraggable, droppable)
            cy.wait("@postGrid", { timeout: 10000 }).then(({ response }) => {
                const gridLabel = response.body.result.label;
                const snField = response.body.result.fields.find(fld => fld?.label === "Serial No")
                cyGet(`[aria-label="Add Grid"]`).should("contain.text", "Add Grid");
                cyGet(`[data-testid="gridfield-box-sm139nqrq"] label`).should("contain.text", "Title");
                cyGet(`[data-testid="gridfield-box-sm139nqrq"]`).find("input").as("gridLabel")
                cy.get("@gridLabel").should("have.attr", "required")
                cy.get("@gridLabel").should("have.value", gridLabel);
                cy.contains(`tr`, snField?.label)
                addfieldonGrid("Single line text", strLabel)
                addfieldonGrid("URL", urlLabel)
                addfieldonGrid("Email", emlField)
                // save grid on custom form
                cyGet('[data-testid="buttongroup-dialogactions-fb25djtod"] > * > [data-testid="Save"]').click()
                // save custom form
                buSaveButton().click()
            });
        });
    });

    it(`Make a field required and check field behaviour`, () => { ctmFieldSettingScript("required") });

    it(`save button should be disabled without filling required field`, () => {
        cy.wait("@getBiztab", { timeout: 10000 }).then(({ response }) => {
            const ctmField = response.body.result.find(ele => ele.prop === "ctm");
            cyGet(`[aria-label="Simple Tab"] [aria-label="${ctmField?.label}"]`)
                .contains(ctmField?.label)
                .click()
            cyGet(`[data-testid="Add"]`).contains("Add").click()
            cy.wait("@getFormDetail", { timeout: 10000 }).then(({ response }) => {
                const fields = response.body.result.fields;
                const containers = response.body.result.form.containers;
                const allFieldIds = containers.flatMap(container => container.fields.map(i => i.id));
                const requiredFieldIds = containers.flatMap(container => container.fields.filter(f => f.required === true).map(i => i.id));
                const optionalFields = allFieldIds.map(id => fields[id]).filter(f => !requiredFieldIds.includes(f.id))
                propwiseFields(optionalFields, {}, [], true);
                buSaveButton().should("be.disabled");
            });
        });
    });

    it(`Make a field read-only and check field behaviour`, () => { ctmFieldSettingScript("readOnly", "Read only") });

    it(`Make a field hidden and check field behaviour`, () => { ctmFieldSettingScript("hidden", "Hidden") });

    it(`Make a field editable and check field behaviour`, () => { ctmFieldSettingScript("editable", "Editable") });

});
