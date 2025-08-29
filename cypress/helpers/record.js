import { faker } from "@faker-js/faker";
import globalSel from "../selector/globalSel";
import { budropdown, budropdownInput, budropdownOption, buSaveButton, buSearchbox, cyGet, onesecondWait, twosecondWait } from "./global";
import { request } from "../selector/utility";
const messages = require("../helpers/messages")
const apiUrl = Cypress.env("apiurl");
const asset = Cypress.env("asset")
const module = Cypress.env("module")
const assetName = asset.charAt(0).toUpperCase() + asset.slice(1)
const configUrl = `${apiUrl}/fms/forms/config/create`;
const detailViewUrl = `${apiUrl}/fms/views/detail`;

// export const prepareFormConfig = (getFormConfigResponse, fieldProp) => {
//     const requiredField = getFormConfigResponse.filter(ele => ele?.required === true);
//     const getFieldIdByLabel = (label) => getFormConfigResponse.find((field) => field?.label === label)?.id;
//     const ownerFieldId = getFieldIdByLabel("Owner");
//     const optionalfield = getFormConfigResponse.find(ele => ele.prop === fieldProp)
//     const updateConfigBody = {
//         fields: requiredField.map((ele) => ele?.id)
//     }
//     if (ownerFieldId) updateConfigBody.fields.push(ownerFieldId);
//     if (!optionalfield) { throw new Error("Field not found.Please create/attach field first!") }
//     if (optionalfield) updateConfigBody.fields.push(optionalfield?.id);
//     updateConfigBody.fields = [...new Set(updateConfigBody.fields)];
//     return updateConfigBody;
// }

export const prepareFormConfig = (getFormConfigResponse, fieldProps = []) => {
    // Get all required fields
    const requiredFields = getFormConfigResponse.filter(field => field?.required === true);
    // Helper: find ID by label
    const getFieldIdByLabel = (label) => getFormConfigResponse.find(field => field?.label === label)?.id;
    // Special: Owner field ID
    const ownerFieldId = getFieldIdByLabel("Owner");
    // Find all optional fields by prop
    const optionalFields = fieldProps.map((prop) => {
        const field = getFormConfigResponse.find(f => f?.prop === prop && f?.required === false);
        if (!field) { cy.log(`Field with prop "${prop}" not found. Please create/attach it first!`) }
        return field;
    });
    // Build the final fields array
    let updateConfigBody = { fields: requiredFields.map(f => f.id) };
    if (ownerFieldId) { updateConfigBody.fields.push(ownerFieldId) }
    optionalFields.forEach(f => updateConfigBody.fields.push(f?.id));
    // Remove duplicates
    updateConfigBody.fields = [...new Set(updateConfigBody.fields)];
    return updateConfigBody;
};


export const fetchOptions = (field) => {
    let apiUrl = Cypress.env("apiurl");
    let reqHeader = { Authorization: "Bearer " + Cypress.env("token") };
    const optUrl = `${apiUrl}${field.url}`;
    return request("GET", optUrl, reqHeader).then(({ body }) => {
        return body.result.values;
    });
};

export const fieldOnForm = (labelSel, fieldData, domEle) => {
    let label;
    let prop;
    if (typeof fieldData === "object" && fieldData !== null) {
        label = fieldData.label;
        prop = fieldData.prop;
    } else { label = fieldData }
    cyGet(labelSel)
        .contains(label)
        .closest('[data-testid^="budropdown-box-"], [data-testid^="butextarea-textfield-"], [data-testid^="bunewform-box-"], [data-testid^="addfile-box-"], [data-testid^="butextfield-textfield-"]')
        .as("fields")
    return cy.get("@fields")
        .then($el => {
            if (prop === "chk" || prop === "rad") { cy.wait(3000) }
            return cy.wrap($el).find(domEle)
        });
};

export const handleDropdownField = (profile, formDomId, chipSelector = null, data, isAddressForm = false) => {
    const formboxSel = isAddressForm ? `[data-testid="buformpreview-stack-g463bix6f"]` : `[data-testid="budropdown-box-ty1opau5a"]`
    const { label, selection } = profile;
    return fetchOptions(profile).then((optionApiResp) => {
        const totalOption = optionApiResp.length;
        if (totalOption) {
            let setOption;
            if (Array.isArray(data) && data.length > 0) { setOption = optionApiResp.find((ele) => ele.label !== data[0].label) }
            else { setOption = optionApiResp[0] }
            const dropdownSelector = `${formDomId} ${formboxSel} label`;
            fieldOnForm(dropdownSelector, profile, "input").click({ force: true });
            if (totalOption > 5 && setOption?.label) { buSearchbox(globalSel.search, setOption?.label) }
            budropdownOption(setOption?.id, chipSelector).first().click({ force: true });
            if (selection === "multi") { fieldOnForm(dropdownSelector, profile, "input").click() };
        } else {
            throw new Error(`${label} Field have not any options`)
        }

    });
};

export const handleCountry = (getAddressRes, formDomId, chipSelector = null, data,) => {
    const getCountryField = getAddressRes.find(ele => ele.prop === "cnt")
    const getStateField = getAddressRes.find(ele => ele.prop === "stt")
    const getCityField = getAddressRes.find(ele => ele.prop === "cty")
    const formboxSel = `[data-testid="buformpreview-stack-g463bix6f"]`;
    const dropdownSelector = `${formDomId} ${formboxSel} label`;
    handleDropdownField(getCountryField, formDomId, null, data, true).then(() => {
        fieldOnForm(dropdownSelector, getStateField, "input").click();
        cy.wait("@states", { timeout: 10000 }).then(({ response }) => {
            const states = response.body.result.values.filter(stt => stt.label)
            if (states.length > 0) {
                if (states.length > 5) { buSearchbox(globalSel.search, states[0].label) }
                budropdownOption(states[0].label).first().click()
                fieldOnForm(dropdownSelector, getCityField, "input").click();
                cy.wait("@cities", { timeout: 10000 }).then(({ response }) => {
                    const cities = response.body.result.values.filter(stt => stt.label)
                    if (cities.length > 0) {
                        if (cities.length > 5) { buSearchbox(globalSel.search, cities[0].label) }
                        budropdownOption(cities[0].label).first().click()
                    };
                });
            };
        });
    });
};

export const handleRadioNCheckboxField = (profile, formDomId, data, chkNradSel, isAddressForm = false) => {
    const formboxSel = isAddressForm ? `[data-testid="buformpreview-stack-g463bix6f"]` : `[data-testid="bunewform-box-s4nmmy5x6"]`;
    return fetchOptions(profile).then((optionApiResp) => {
        const optionsLabel = optionApiResp.map(ele => ele.label);
        let setOption;
        if (Array.isArray(data) && data.length > 0) {
            setOption = optionsLabel.find(ele => ele !== data[0].label) || optionsLabel[0];
        } else {
            setOption = optionsLabel[0];
        }
        return cyGet(`${formDomId} ${formboxSel} label`)
            .contains(profile.label)
            .parent()
            .find(chkNradSel)
            .contains(setOption)
            .click()
    });
};

export const handleAttachmentField = (fieldData, formDomId, chipSelector = null, data = []) => {
    const { label, selection } = fieldData;
    const defaultFiles = selection === "single" ? "cypress/fixtures/data.csv" : ["cypress/fixtures/data.csv", "cypress/fixtures/attachment.jpg"];
    const filesToUpload = data.length ? data : defaultFiles;
    fieldOnForm(`${formDomId} [data-testid="buattachment-box-t18znb5ae"] label`, fieldData, "button").click();
    cyGet('input[type="file"]').selectFile(filesToUpload, { force: true });
    twosecondWait()
};

export const handleEmail = (field, valueOverride) => {
    // Use a reasonable default list
    const supportedDomains = ["gmail.com", "yahoo.com", "outlook.com", "yopmail.com"];
    const excludes = Array.isArray(field.excludes) ? field.excludes : [];
    const mode = field.mode ?? null;

    // Use override if given, else generate random
    const baseEmail = valueOverride || faker.internet.email();
    const emailDomain = baseEmail.split('@')[1].toLowerCase();

    let allowedDomains = supportedDomains;

    if (mode === 0) {
        // Exclude specified domains
        allowedDomains = supportedDomains.filter(domain => !excludes.includes(domain));
    } else if (mode === 1) {
        // Allow only specified domains
        allowedDomains = supportedDomains.filter(domain => excludes.includes(domain));
    }

    // Pick valid domain
    const domain = allowedDomains.includes(emailDomain)
        ? emailDomain
        : faker.helpers.arrayElement(allowedDomains.length > 0 ? allowedDomains : supportedDomains);

    // Return new valid email
    return `${faker.internet.userName()}@${domain}`;
};

export function generateValueByType(type, min, max) {
    switch (type) {
        case 'str':
            return faker.string.alpha({ length: max || 10 });
        case 'txa':
            return faker.string.alpha({ length: max || 30 });
        case 'num':
            return faker.number.int({ "min": min || 3, "max": max || 999 });
        case 'eml':
            return faker.internet.email();
        case 'phn':
            return faker.string.numeric(10);
        case 'url':
            return faker.internet.url();
        default:
            // return faker.string.alphanumeric(6);
            cy.log(`Eigher prop ${type} not configured or invalid prop`)
    }
}

export const handleGrid = (formDomSel, fields) => {

    cyGet(`${formDomSel} [data-testid="invoicegrid-box-6lc3uetqx"]`).first()
        .find(`[data-testid="Add row"]`).click()

    fields.forEach((field, index) => {
        const { min, max } = field
        const colSelector = `table > tbody > .MuiTableRow-root > :nth-child(${index + 1})`;

        cyGet(`${formDomSel} ${colSelector}`).each(($cell) => {
            const value = generateValueByType(field.prop, min, max);
            cy.wrap($cell).clear().type(value);
        });
    });

}

export const propwiseFields = (getApiResponse, overrides = {}, recordData = [], isAddressForm = false) => {
    const dynamicFormId = isAddressForm ? `[data-testid="buformpreview-form-fqigmf514"]` : `[data-testid="bunewform-form-v30g9mvu1"]`;
    getApiResponse.forEach((field) => {
        const { prop: fieldProp, label: fieldLabel, max, min } = field;

        const valueOverride = overrides[fieldProp]; // allow injecting test data

        switch (true) {
            case fieldProp === "stg":
            case fieldProp === "chp":

                if (isAddressForm) {
                    handleDropdownField(field, dynamicFormId, `[data-testid="buchip-chip-5r51zm55o"]`, recordData, true);
                } else {
                    handleDropdownField(field, dynamicFormId, `[data-testid="buchip-chip-5r51zm55o"]`, recordData);
                }

                break;

            case ["own", "dsrc", "asc", "bas"].includes(fieldProp):

                if (isAddressForm) {
                    handleDropdownField(field, dynamicFormId, null, recordData, true);
                } else {
                    handleDropdownField(field, dynamicFormId, null, recordData);
                }

                break;

            case fieldProp === "phn":
                fieldOnForm(`${dynamicFormId} ${globalSel.butextfield}`, field, "input")
                    .clear()
                    .type(valueOverride || faker.string.numeric(10));
                break;

            case fieldProp === "eml":
                const emailToUse = handleEmail(field, valueOverride);
                fieldOnForm(`${dynamicFormId} ${globalSel.butextfield}`, field, "input")
                    .clear()
                    .type(emailToUse);
                break;

            case fieldProp === "str":
                fieldOnForm(`${dynamicFormId} ${globalSel.butextfield}`, field, "input")
                    .clear()
                    .type(valueOverride || faker.string.alpha({ length: max || 10 }));
                break;

            case fieldProp === "txa":
                fieldOnForm(`${dynamicFormId} [data-testid="butextarea-textfield-nvtcklezl"]`, field, "textarea")
                    .first()
                    .clear()
                    .type(valueOverride || faker.string.alpha({ length: max || 30 }));
                break;

            case fieldProp === "num":
                fieldOnForm(`${dynamicFormId} ${globalSel.butextfield}`, field, "input")
                    .first()
                    .clear()
                    .type(valueOverride || (faker.number.int({ "min": min || 3, "max": max || 999 })));
                break;

            case fieldProp === "url":
                fieldOnForm(`${dynamicFormId} ${globalSel.butextfield}`, field, "input")
                    .clear()
                    .type(valueOverride || faker.internet.url());
                break;

            case fieldProp === "rad":

                if (isAddressForm) {
                    handleRadioNCheckboxField(field, dynamicFormId, recordData, `[data-testid="buradiogroup-formgroup-7eq9xarna"]`, true)
                } else {
                    handleRadioNCheckboxField(field, dynamicFormId, recordData, `[data-testid="buradiogroup-formgroup-7eq9xarna"]`);
                }

                break;

            case fieldProp === "chk":
                if (isAddressForm) {
                    handleRadioNCheckboxField(field, dynamicFormId, recordData, `[data-testid="bucheckboxgroup-formgroup-akikzeb58"], true`);
                } else {
                    handleRadioNCheckboxField(field, dynamicFormId, recordData, `[data-testid="bucheckboxgroup-formgroup-akikzeb58"]`);
                }

                break;

            case fieldProp === "atc":
                onesecondWait()
                handleAttachmentField(field, dynamicFormId)
                break;
            case fieldProp === "cnt":
                handleCountry(getApiResponse, dynamicFormId, null, recordData)
                break;

            case fieldProp === "grd":
                const grdFields = field.fields
                handleGrid(dynamicFormId, grdFields)
                // cy.log(JSON.stringify(grdFields))
                // propwiseFields(grdFields)
                break;
            case fieldProp === "img":

                cyGet(`[data-testid="buimage-box-ychnkl6de"] label`).contains(field.label).next().find(`[data-testid="addimage-box-874qby5dy"]`).click()
                cyGet(`input[type="file"]`).selectFile(`cypress/fixtures/buopso_logo.jpg`, { force: true })
                cyGet(`[role="dialog"] [data-testid="Save"]`).click()
                break;
            case fieldProp === "title":
                const title = faker.lorem.sentence()
                fieldOnForm(`${dynamicFormId} ${globalSel.butextfield}`, field, "input")
                    .clear()
                    .type(valueOverride || title)
                    .invoke("val", title)
                    .trigger("input")
                break;

            default: {
                cy.log(`Either prop "${fieldProp}" is not configured or invalid.`)
                // throw new Error(`Either prop "${fieldProp}" is not configured or invalid.`) 
            }

        }
    });
};
export const createRecordScript = (prop, role, access, pip, customPayload = {}) => {
    const pipId = pip.map(ele => ele.id)
    const reqQs = { module, asset, catId: pipId[0] };
    const reqHeader = { Authorization: `Bearer ${Cypress.env("token")}` };

    return request("GET", configUrl, reqHeader, reqQs).then(({ body }) => {
        const formConfigReq = prepareFormConfig(body.result.values, prop);

        return request("PATCH", configUrl, reqHeader, reqQs, formConfigReq).then(({ body: patchBody }) => {
            expect(patchBody).to.have.property("success", true);

            const createButtonSel = `[data-testid="Create ${assetName}"]`;
            const submitButtonSel = `[data-testid="Create"]`;

            if (role === "std" && access === false) {
                cyGet(createButtonSel).should("be.disabled");
                return;
            }

            cyGet(createButtonSel).click();

            cy.wait("@getfieldOnForm", { timeout: 10000 }).then(({ response }) => {
                const fieldConfig = response?.body?.result?.values || [];
                propwiseFields(fieldConfig, customPayload);
            });

            cyGet(submitButtonSel).click();
            cyGet('.MuiSnackbarContent-message').should("have.text", messages.created);
        });
    });
};

export const setFieldOndetail = (apiHeader, qs, fieldData) => {
    cy.get('[role="dialog"] [placeholder="Search..."]').clear().type(fieldName)
        .get('.MuiBox-root > .MuiListItem-root input').first().then(($ele) => {
            if ($ele.is(':checked')) {
                cy.log(`${fieldName} already checked`)
            } else { cy.wrap($ele).first().click() }
        })
}

export const updateRecordScript = (prop, role, access, pip, customPayload = {}) => {
    const pipId = pip.map(ele => ele.id)
    const pipLabel = pip.map(ele => ele.label)
    let reqQs = { module, asset, catId: pipId[0] };
    let reqHeader = { Authorization: "Bearer " + Cypress.env("token") };

    request("GET", configUrl, reqHeader, reqQs).then(({ body }) => {
        const field = body.result.values.filter(ele => ele.prop === prop[0]).slice(0, 1);
        if (field.length === 0) { throw new Error("Field not found for given prop") }
        const fieldLabel = field[0]?.label;
        const payload = { fields: field.map(f => f.id) }
        request("PATCH", detailViewUrl, reqHeader, reqQs, payload).then(({ body }) => {
            expect(body).has.property("message", messages.updated)
            cy.reload();
            cy.wait("@splitViewRecord", { timeout: 10000 }).then(({ response }) => {
                let recordId = response.body.result.values[0].id
                const uid = response.body.result.values[0].title
                const getRecordUrl = `${apiUrl}/rms/records/${recordId}`
                request("GET", getRecordUrl, reqHeader, reqQs, payload).then(({ body }) => {

                    if (asset === "contact") {
                        fieldOnForm(`#detail-form ${globalSel.butextfield}`, `${pipLabel[0]} Id`, "input").should("have.value", uid);
                    } else {
                        fieldOnForm(`#detail-form ${globalSel.butextfield}`, `${assetName} Id`, "input").should("have.value", uid);
                    }

                    const getrecordProfile = body.result.profile.filter(ele => ele.label === fieldLabel)
                    const profilefieldId = getrecordProfile.map(ele => ele.id)
                    const getrecordData = body.result.data[profilefieldId]
                    if (role === "std" && access === false) {
                        fieldOnForm(`#detail-form ${globalSel.butextfield}`, field[0], "input").should("have.attr", "readonly", "true");
                    } else {
                        propwiseFields(getrecordProfile, customPayload, getrecordData);  // true = detailForm mode
                    }
                    buSaveButton().click()
                    // cyGet('.MuiSnackbarContent-message').should("have.text", messages.updated);
                });
            })
        })
    });
};
