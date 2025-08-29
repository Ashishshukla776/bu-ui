import fieldSel from "../selector/fieldSel";
import globalSel from "../selector/globalSel";
import { budropdown, budropdownOption, buSearchbox, butextField, cyGet } from "./global";

export const labelNplaceholder = (label, placeholder) => {
  // Always fill the label
  butextField(globalSel.butextfield, fieldSel.fieldlabelboxId).clear().type(label);

  // Check if the placeholder field exists before typing
  cy.get('body').then(($body) => {
    const placeholderSelector = `${globalSel.butextfield} ${fieldSel.fieldPHboxId}`;
    
    if ($body.find(placeholderSelector).length > 0) {
      butextField(globalSel.butextfield, fieldSel.fieldPHboxId).clear().type(placeholder);
    } else {
      cy.log('Placeholder field is not visible — skipping');
    }
  });
};


export const searchNactionField = (searchField, actionSel, action) => {
    buSearchbox(`${fieldSel.searchBoxfieldGrid} ${globalSel.searchplaceholder}`, searchField);
    cyGet('[data-testid="actions-iconbutton-4zbo8fvnl"]').first().click()
    cyGet('[data-testid="actions-grow-5vovx3gsy"]').within(() => {
        cyGet('[data-testid="actions-menulist-fd8e0yq7x"')
            .find(actionSel)
            .contains(action)
            .click()
    })

}

export const headingNsubheading = () => {
    cy.wait("@fieldList", { timeout: 10000 }).then(({ response }) => {
        const fieldListValues = response.body.result.values;
        const lenth = fieldListValues.length;
        const fieldLabels = fieldListValues.map(ele => ele.label);
        const heading = fieldListValues.find(ele => ele.prop === "uid");
        const subHeading = fieldListValues.find(ele => ele.prop != "uid");
        cyGet(globalSel.withtitleinputlabel).contains("Heading Field");
        budropdown(globalSel.dialogContent, `button ${globalSel.buttonTypography}`, fieldLabels[0]);
        if (lenth > 5) buSearchbox(globalSel.search, heading.label);
        budropdownOption(heading?.label, globalSel.dialogTitleText).should('exist').contains(heading?.label).click();
        cyGet(globalSel.withtitleinputlabel).contains(`Sub-Heading Field`);
        budropdown(globalSel.dialogContent, `button ${globalSel.buttonTypography}`, fieldLabels[1]);
        if (lenth > 5) buSearchbox(globalSel.search, subHeading?.label);
        budropdownOption(subHeading?.label, globalSel.dialogTitleText).should('exist').contains(subHeading?.label).click();
    })

}

export const preview = (label, placeholder) => {
    cy.get('[data-testid="butextfield-textfield-lrb6zu6xa"]').contains(label).next()
        .find(`input`).should("have.attr", "placeholder", placeholder)
}
export const previewDateField = (label, placeholder) => {
    cyGet('[data-testid="datefield-box-hmg7ipxcf"]').find(`label`).contains(label).next()
        .find(`input`).should("have.attr", "placeholder", placeholder)
}

export const searchField = (propName, fieldLabel, action) => {
    return cy.wait("@fieldGrid", { timeout: 10000 }).then(({ response }) => {
        const { values, pages } = response.body.result;

        // Set common fields
        cy.wrap(values.find(el => el.label === "Mobile number")).as('mobileId');
        cy.wrap(values.find(el => el.label === "Stage")).as('stageId');
        cy.wrap(values.find(el => el.label === "Owner")).as('ownerId');

        const getFieldAndSearch = (fieldValues) => {
            let fieldData;
            if (fieldLabel) { fieldData = fieldValues.find(el => el.label === fieldLabel) }
            else { fieldData = fieldValues.findLast(el => el.prop === propName && el.system !== true && el.required !== true) }
            cy.log("fieldData", JSON.stringify(fieldData))
            // cy.wrap(fieldData).as('fieldResp');
            searchNactionField(fieldData?.label, globalSel.edit, action);
            return cy.wrap(fieldData); // 👈 Return the fieldData as a Cypress chainable
        };

        if (pages.totalNoOfPages === 1) {
            return getFieldAndSearch(values);
        } else {
            cy.get('[aria-label="pagination navigation"] ul > :last').prev().click();
            return cy.wait("@fieldGrid").then(({ response }) => {
                return getFieldAndSearch(response.body.result.values);
            });
        }
    });
};

export const filedSelection = (type, value) => {
    return cyGet(`[data-testid="buradiogroup-formcontrollabel-si19q88zv"]`)
        .contains(type)
        .prev()
        .find(`input[value="${value}"]`)
}

export const fieldTypeFilterOnSetting = (fieldType) => {
    buSearchbox(globalSel.search, fieldType)
    budropdownOption(fieldType).contains(fieldType).click()
}

export const textCaseFormat = () => {
    cy.get('[role="radiogroup"] > :nth-child(1) [type="radio"]').should("have.value", "none").click()
    cy.get('.MuiFormGroup-root > :nth-child(1) > .MuiTypography-root').should("have.text", "none")
    cy.get('[role="radiogroup"] > :nth-child(2) [type="radio"]').should("have.value", "low").click()
    cy.get('.MuiFormGroup-root > :nth-child(2) > .MuiTypography-root').should("have.text", "abc")
    cy.get('[role="radiogroup"] > :nth-child(3) [type="radio"]').should("have.value", "up").click()
    cy.get('.MuiFormGroup-root > :nth-child(3) > .MuiTypography-root').should("have.text", "ABC")
    cy.get('[role="radiogroup"] > :nth-child(4) [type="radio"]').should("have.value", "cap").click()
    cy.get('.MuiFormGroup-root > :nth-child(4) > .MuiTypography-root').should("have.text", "Abc")
}



