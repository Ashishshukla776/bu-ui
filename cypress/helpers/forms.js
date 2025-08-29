import { faker } from "@faker-js/faker";
import globalSel from "../selector/globalSel";
import { fieldOnForm, generateValueByType, handleAttachmentField, handleCountry, handleDropdownField, handleEmail, handleRadioNCheckboxField } from "./record";
import { budropdown, buSaveButton, cyGet, twosecondWait } from "./global";
import messages from "./messages";

export const fillForms = (fieldIds, formFields, recordData) => {
    let dynamicFormId = `[data-testid="buformpreview-form-fqigmf514"]`;

    fieldIds.forEach((fieldId) => {
        const field = formFields[fieldId];
        const { max, min, prop } = field;

        switch (true) {
            case prop === "stg":
            case prop === "chp":
                handleDropdownField(field, dynamicFormId, `[data-testid="buchip-chip-5r51zm55o"]`, recordData);
                break;

            case ["own", "dsrc", "asc", "bas"].includes(prop):
                handleDropdownField(field, dynamicFormId, null, recordData);
                break;

            case prop === "phn":
                fieldOnForm(`${dynamicFormId} ${globalSel.butextfield}`, field, "input")
                    .clear()
                    .type(faker.string.numeric(10));
                break;

            case prop === "eml":
                const emailToUse = handleEmail(field);
                fieldOnForm(`${dynamicFormId} ${globalSel.butextfield}`, field, "input")
                    .clear()
                    .type(emailToUse);
                break;

            case prop === "str":
                fieldOnForm(`${dynamicFormId} ${globalSel.butextfield}`, field, "input")
                    .clear()
                    .type(faker.string.alpha({ length: max || 10 }));
                break;

            case prop === "txa":
                fieldOnForm(`${dynamicFormId} [data-testid="butextarea-textfield-nvtcklezl"]`, field, "textarea")
                    .first()
                    .clear()
                    .type(faker.string.alpha({ length: max || 30 }));
                break;

            case prop === "num":
                fieldOnForm(`${dynamicFormId} ${globalSel.butextfield}`, field, "input")
                    .first()
                    .clear()
                    .type((faker.number.int({ "min": min, "max": max })));
                break;

            case prop === "url":
                fieldOnForm(`${dynamicFormId} ${globalSel.butextfield}`, field, "input")
                    .clear()
                    .type(faker.internet.url());
                break;

            case prop === "rad":
                handleRadioNCheckboxField(field, dynamicFormId, recordData, `[data-testid="buradiogroup-formgroup-7eq9xarna"]`);
                break;

            case prop === "chk":
                handleRadioNCheckboxField(field, dynamicFormId, recordData, `[data-testid="bucheckboxgroup-formgroup-akikzeb58"]`);
                break;

            case prop === "atc":
                handleAttachmentField(field, dynamicFormId)
                break;
            case prop === "cnt":
                handleCountry(getApiResponse, dynamicFormId, null, recordData)
                break;

            default: {
                cy.log(`Either prop "${prop}" is not configured or invalid.`)
                // throw new Error(`Either prop "${fieldProp}" is not configured or invalid.`) 
            };
        };
    });
};

export const editctmFromScript = () => {
    return cy.wait("@existsPipeline", { timeout: 10000 }).then(() => {
        return cy.wait("@getBiztab", { timeout: 10000 }).then(({ response }) => {
            const ctmField = response.body.result.findLast(ele => ele.prop === "ctm");
            cyGet(`[aria-label="Simple Tab"] [aria-label="${ctmField?.label}"]`)
                .contains(ctmField?.label)
                .click()
            cyGet('[data-testid="customform-box-4cswvjyuc"] > [data-testid="busimpledropdown-box-l5z1y823c"] > [data-testid="busimpledropdown-iconbutton-81obeefh3"]').click({ force: true })
            cyGet(`#edit p`).should("contain.text", "Edit Form").click({ force: true });
            twosecondWait()
            return cy.wrap(ctmField)
        });
    });
};
export const handleFontSize = (fontSize) => {
    if (fontSize === "14px") { return "Small" }
    else if (fontSize === "16px") { return "Medium" }
    else { return "Large" }
}
export const validateAlignmentAndFontSize = (alignSel, setfontSize, expectedFont, expectedAlign) => {
    editctmFromScript().then((ctmformdata) => {
        cy.wait("@getFormDetail", { timeout: 10000 }).then(({ response }) => {
            const { label, align, fontSize } = response.body.result.form;
            const font_size = handleFontSize(fontSize)
            cyGet(`[data-testid="textalignment-box-gbq71jxur"] [data-testid="textalignment-typography-o16aavbmg"]`).should("contain.text", "Text alignment");
            cyGet(`[data-testid="textalignment-box-gbq71jxur"]`).find(alignSel).click();
            budropdown(`[data-testid="form-box-a4es3ch5z"]`, `[data-testid="button-box-72cmtvy8r"] button`, font_size, null, null, setfontSize, `[data-testid="truncatetext-typography-y0hcc4b88"]`)
            buSaveButton().click()
            cy.wait("@patchForm", { timeout: 10000 }).then(({ response }) => {
                expect(response.body).has.property("message", messages.updated);
                cyGet(`input[value="${ctmformdata?.label}"]`)
                    .should("have.attr", "style", `font-size: ${expectedFont}; text-align: ${expectedAlign};`)
            });
        });
    });
};

export const verifyFieldType = (fieldTypeSel, fieldType) => {
    editctmFromScript().then(() => {
        cyGet('[aria-label="Field type"]').click();
        twosecondWait()
        cyGet(fieldTypeSel)
            .find(`[data-testid="index-typography-442pqldco"]`)
            .should("contain.text", fieldType)
    });
}

export function ctmFieldSettingScript(action, actionContent) {
    const actionLower = action.toLowerCase();
    editctmFromScript().then((ctmformdata) => {
        cy.wait("@getFormDetail", { timeout: 10000 }).then(({ response }) => {
            const { fields, form: { containers } } = response.body.result;

            // Collect field IDs based on action
            const allFieldIds = containers.flatMap(container =>
                action === "editable"
                    ? container.fields.map(f => f.id)
                    : container.fields.filter(f => f[action] === false).map(f => f.id)
            );

            // Pick a field (skip grid fields)
            const field = allFieldIds.map(id => fields[id]).find(f => f.prop !== "grd");
            if (!field) return;

            const fieldValue = generateValueByType(field.prop);
            const container = containers.find(c => c.fields.some(f => f.id === field.id));

            // Open field settings
            cyGet(`[data-rbd-draggable-id^="field@${field.id}@"]`).click({ force: true });

            // Handle different actions
            if (action === "required") {
                cyGet('[data-testid="mandatory-box-mpp0x05n8"] [data-testid^="mandatory-typography"]')
                    .should("contain.text", "Required");
                cyGet('[data-testid="mandatory-box-mpp0x05n8"] button[role="switch"]')
                    .as("requiredSwitch")
                    .should("have.attr", "aria-checked", "false")
                    .click();
            } else {
                cyGet(`#${action}`).click();
                cyGet('[data-testid="fieldsetting-typography-bq9mnu88m"]')
                    .should("contain.text", actionContent);
                cyGet('[data-testid="fieldsetting-box-cqfmd9dub"] input')
                    .clear()
                    .type(fieldValue);
            }

            // Save and verify response
            buSaveButton().click();
            cy.wait("@patchForm", { timeout: 10000 }).then(({ response }) => {
                expect(response.body).to.have.property("message", messages.updated);

                // Navigate back and re-check form
                cyGet('[data-testid="Back"]').click();
                cyGet(`[aria-label="Simple Tab"] [aria-label="${ctmformdata?.label}"]`).contains(ctmformdata?.label).click();
                cyGet('[data-testid="Add"]').contains("Add").click();

                // Assertions after form update
                if (action === "required") {
                    cyGet(`#custom-form #${container.id} #${field.id}`).should("have.attr", "required");
                } else if (action === "editable") {
                    cyGet(`#custom-form #${container.id} #${field.id}`)
                        .as("inputValue")
                        .should("have.value", fieldValue);

                    cy.get("@inputValue").clear().type(generateValueByType(field.prop));
                } else {
                    cyGet(`#custom-form #${container.id}`)
                        .find('[data-testid="butextfield-textfield-lrb6zu6xa"]')
                        .should("have.attr", actionLower);

                    cyGet(`#custom-form #${field.id}`).should("have.value", fieldValue);
                }
            });
        });
    });
};

export function createctmTemplate() {
    cyGet('[data-testid="Save template"]').click()
    cyGet('[data-testid="title-dialog"] p').should("contain.text", "Save Template")
    cyGet('[data-testid="createtemplate-textfield-ea9a22uo5"] label').contains("Name")
    cyGet('[data-testid="createtemplate-textfield-ea9a22uo5"] input').as("templateName").should("have.attr", "required")
    cy.get("@templateName").type(`Template ${new Date().valueOf()}`)
    cyGet('[data-testid="createtemplate-textfield-gz2bust1u"] label').contains("Description")
    cyGet('[data-testid="createtemplate-textfield-gz2bust1u"] input').type(faker.lorem.lines(1))
    cyGet('[data-testid="Create"]').click() // click on create template
}

export function validatectmRecord(resValue, resView) {
    resView.forEach(field => {
        const { id, prop, label } = field
        const value = resValue[id]
        function basicFieldValidate(findSel, actualValue = null) {
            const fielddata = actualValue ?? value
            cyGet(`[data-testid="displayfields-box-813nd8ftw"] [data-testid="withtruncate-wrapped-jhk5rb2jw"]`)
                .should("contain.text", label)
            cyGet(`[data-testid="displayfields-box-813nd8ftw"] [data-testid="displaycomponents-box-txr5gbl4u"]`)
                .find(findSel)
                .should("contain.text", fielddata)
        }
        switch (prop) {
            case "phn":
            case "str":
            case "num":
            case "txa":
                basicFieldValidate(`p`)
                break;
            case "url":
            case "eml":
                basicFieldValidate(`a`)
                break;
            case "bas":
                const dropdownFieldLabel = value.map(ele => ele.label)
                basicFieldValidate(`p`, dropdownFieldLabel)
                break;
            default: {
                cy.log(`Either prop "${prop}" is not configured or invalid.`)
                // throw new Error(`Either prop "${fieldProp}" is not configured or invalid.`) 
            }
        }
    })
}

