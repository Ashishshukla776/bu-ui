const { cyGet, twosecondWait, buSaveButton, onesecondWait } = require('../../../../helpers/global')
const messages = require('../../../../helpers/messages')
const { request, fieldType } = require('../../../../selector/utility')
const { editctmFromScript, validateAlignmentAndFontSize, verifyFieldType } = require('../../../../helpers/forms')
const globalSel = require('../../../../selector/globalSel')
const url = Cypress.env("url")
const module = Cypress.env("module")
const asset = Cypress.env("asset")
const updatedUrl = url.replace("one", module);
const apiUrl = Cypress.env("apiurl");
const biztabUrl = `${apiUrl}/fms/views/biztab`;

describe(`Test the functionality of custom form`, function () {

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


    it(`Add custom form`, function () {
        cy.wait("@existsPipeline", { timeout: 10000 }).then(({ response }) => {
            const pipId = response.body.result.catId;
            cy.wait("@getBiztab", { timeout: 10000 }).then(({ response }) => {

                const biztabFieldIds = response.body.result.map(fld => fld.id);
                if (biztabFieldIds.length > 3) {
                    const toUpdateField = biztabFieldIds.slice(0, 2)
                    const reqHeader = { Authorization: `Bearer ${Cypress.env("token")}` };
                    const reqQs = { "custom": true, module, asset, catId: pipId }
                    const payload = { fields: [...toUpdateField] }

                    request("PATCH", biztabUrl, reqHeader, reqQs, payload).then(({ body }) => {
                        expect(body).has.property("message", messages.updated)
                    })
                }
                cyGet(`[aria-label="Simple Tab"] [data-testid="busimpletabs-tab-bmcqbakaf"]`)
                    .contains("Add form")
                    .click();
                cy.wait("@getFormDetail", { timeout: 10000 }).then(({ response }) => {
                    const { label, align, fontSize } = response.body.result.form;
                    expect(response.body.result.form).has.property("align", "left");
                    expect(response.body.result.form).has.property("fontSize", "14px");
                    expect(response.body.result.form).has.property("width", 500);
                    cyGet(`input[value="${label}"]`).should("have.attr", "style", `font-size: 14px; text-align: left;`)
                })
            });
        });
    });

    it(`save button should be dissable without form title`, function () {
        editctmFromScript().then((ctmformdata) => {
            cyGet(`input[value="${ctmformdata?.label}"]`).clear();
            buSaveButton().should("be.disabled");
            buSaveButton().trigger("mouseover", { force: true });
            cyGet('.MuiTooltip-tooltip').should("contain.text", "Please fill form title!");
        });
    });

    it(`attach fields on custom form`, function () {
        editctmFromScript().then(() => {
            cyGet(`[aria-label="Existing fields"]`).should("contain.text", "Existing fields").click();
            onesecondWait()
            cyGet(`[data-testid="Attach field"]`).should("contain.text", "Attach field").click();
            cy.wait("@availableField", { timeout: 10000 }).then(({ response }) => {
                const availableField = response.body.result.values.slice(0, 2);
                if (availableField.length === 0) { this.skip() }
                const prop1 = availableField[0].prop
                const id1 = availableField[0].id
                const field1_Draggable = `[data-rbd-draggable-id="existingField@${prop1}@${id1}"]`;
                const droppable = '[role="tabpanel"] [data-rbd-droppable-id="new-container"]';
                cyGet(`[data-testid="attachfields-textfield-g0au8eoj4"] [placeholder="Search..."]`).type(availableField[0].label);
                cyGet(`[aria-label="${availableField[0].label}"]`).should("contain.text", availableField[0].label).click();
                if (availableField.length > 1) {
                    cyGet(`[data-testid="attachfields-textfield-g0au8eoj4"] [placeholder="Search..."]`).clear().type(availableField[1].label);
                    cyGet(`[aria-label="${availableField[1].label}"]`).should("contain.text", availableField[1].label).click();
                }
                cyGet(`[data-testid="Attach"]`).click();
                twosecondWait()
                // Drag and Drop first field
                cy.dragAndDrop(field1_Draggable, droppable)
                twosecondWait()
                // Drag and Drop second field
                if (availableField.length > 1) {
                    const prop2 = availableField[1].prop
                    const id2 = availableField[1].id
                    const field2_Draggable = `[data-rbd-draggable-id="existingField@${prop2}@${id2}"]`;
                    cy.dragAndDrop(field2_Draggable, droppable)
                    twosecondWait()
                }
                buSaveButton().click()
                cy.wait("@patchForm", { timeout: 10000 }).then(({ response }) => {
                    expect(response.body).has.property("message", messages.updated)
                })
            })
        });
    });

    it(`attached fields should not be re-attached on form`, function () {
        editctmFromScript().then(() => {
            cyGet(`[aria-label="Existing fields"]`).should("contain.text", "Existing fields").click();
            onesecondWait();
            cy.wait("@getFormDetail", { timeout: 10000 }).then(({ response }) => {
                const fields = Object.values(response.body.result.fields)
                const prop1 = fields[0].prop
                const id1 = fields[0].id
                cyGet(`[data-rbd-draggable-id="existingField@${prop1}@${id1}"]`)
                    .should("have.attr", "style", "opacity: 0.7;")
            });
        });
    });

    it(`Set test-alignment center and font-size medium`, function () {
        validateAlignmentAndFontSize(`[data-testid="textalignment-iconbutton-nqzrlk6uv"]`, "Medium", "16px", "center");
    });

    it(`Set test-alignment right and font-size large`, function () {
        validateAlignmentAndFontSize(`[data-testid="textalignment-iconbutton-xvufy7vwj"]`, "Large", "18px", "right");
    });

    it(`Set test-alignment right and font-size large`, function () {
        validateAlignmentAndFontSize(`[data-testid="textalignment-iconbutton-ztu8e2vt9"]`, "Small", "14px", "left");
    });

    it(`Verify form have str field type`, function () { verifyFieldType(globalSel.dragStr, fieldType.str) });
    it(`Verify form have txa field type`, function () { verifyFieldType(globalSel.dragTxa, fieldType.txa) });
    it(`Verify form have phn field type`, function () { verifyFieldType(globalSel.dragPhn, fieldType.phn) });
    it(`Verify form have num field type`, function () { verifyFieldType(globalSel.dragNum, fieldType.num) });
    it(`Verify form have eml field type`, function () { verifyFieldType(globalSel.dragEml, fieldType.eml) });
    it(`Verify form have url field type`, function () { verifyFieldType(globalSel.dragUrl, fieldType.url) });
    it(`Verify form have bas field type`, function () { verifyFieldType(globalSel.dragBas, fieldType.bas) });
    it(`Verify form have img field type`, function () { verifyFieldType(globalSel.dragImg, fieldType.img) });
    it(`Verify form have dat field type`, function () { verifyFieldType(globalSel.dragDat, fieldType.dat) });
    it(`Verify form have tim field type`, function () { verifyFieldType(globalSel.dragTim, fieldType.tim) });
    it(`Verify form have dtm field type`, function () { verifyFieldType(globalSel.dragDtm, fieldType.dtm) });
    it(`Verify form have chk field type`, function () { verifyFieldType(globalSel.dragChk, fieldType.chk) });
    it(`Verify form have rad field type`, function () { verifyFieldType(globalSel.dragRad, fieldType.rad) });
    it(`Verify form have atc field type`, function () { verifyFieldType(globalSel.dragAtc, fieldType.atc) });
    it(`Verify form have grd field type`, function () { verifyFieldType(globalSel.dragGrd, fieldType.grd) });
    it(`Verify form have fx field type`, function () { verifyFieldType(globalSel.dragFx, fieldType.fx) });
    it(`Verify form have rtg field type`, function () { verifyFieldType(globalSel.dragRtg, fieldType.rtg) });
    it(`Verify form have gloc field type`, function () { verifyFieldType(globalSel.dragGloc, fieldType.gloc) });

});

