import globalSel from "../selector/globalSel"

export const cyGet = (selector) => { return cy.get(selector, { timeout: 15000 }) }
export const butextField = (sel1, sel2) => {
    const fullSelector = `${sel1} ${sel2}`;
    return cyGet(fullSelector);
};

export const buButton = (btnSelector) => { return cyGet(btnSelector) }

export const buSearchbox = (searchSel, search) => {
    cyGet(searchSel).clear().type(search);
    cy.wait(1000)
}

//field Search And Action
export function fieldSearchAndAct(fieldLabel, actionType) {
    cyGet('[data-testid="rightactiontools-textfield-yqs8junxl"] input').type(fieldLabel).wait(2000);
    cyGet('[data-testid="actions-box-it835w1xf"] button').click();
    cyGet(actionType).click();
}


export const busimpledropdown = (selectedLabelSel, expectedLabelText, optionContainerSel, expectedOptionText) => {
    cyGet(`[data-testid="busimpledropdown-box-l5z1y823c"]`)
        .find(selectedLabelSel)
        .and('have.text', expectedLabelText)
        .click();

    cyGet(`[data-testid="busimpledropdown-grow-ljbupdeae"]`)
        .find(`${optionContainerSel} [data-testid="busimpledropdown-typography-pkpid4cdj"]`)
        .contains(expectedOptionText)
        .click({ force: true });
};

export const budropdown = (maincontainer, childSel, expectedText = null, itemlength, searchsel, searchItem, optionSel) => {
    cyGet(maincontainer).within(() => {
        // onesecondWait()
        cyGet(`[data-testid="budropdown-box-ty1opau5a"]`)
            .find(childSel)
            // .should('exist')
            .contains(expectedText)
            .click();
    })

    if (itemlength > 5 && searchsel) { buSearchbox(searchsel, searchItem) }
    if (optionSel) budropdownOption(searchItem, optionSel).should('exist').contains(searchItem).click({ force: true });
};

export const budropdownInput = (childSel, expectedText, itemlength, searchsel, searchItem, optionSel) => {
    cyGet(`[data-testid="budropdown-box-ty1opau5a"]`)
        .find(childSel)
        .should('exist')
        .and("have.value", expectedText)
        .click();
    if (itemlength > 5 && searchsel) { buSearchbox(searchsel, searchItem) }
    if (optionSel) { budropdownOption(searchItem, optionSel).should('exist').contains(searchItem).click() };
};

export const buCaption = (boxSel, boxHeadingSel, headingText, boxsubHeadingSel, subheadingText) => {
    cyGet(boxSel)
        .find(boxHeadingSel)
        .should('exist')
        .and('have.text', headingText)
    cyGet(boxsubHeadingSel)
        .contains(subheadingText)
};

export const budropdownOption = (optionLabel, childSel) => {
    const sel = childSel ?? globalSel.dialogTitleText
    return cyGet(`[data-testid="${optionLabel}"]`).find(sel)

};

export const buSaveButton = () => { return cyGet(globalSel.savetestid) }
export const buCancelButton = () => { return cyGet(globalSel.canceltestid) }
export const onesecondWait = () => { cy.wait(1000) }
export const twosecondWait = () => { cy.wait(2000) }
export const fivesecondWait = () => { cy.wait(5000) }
export const tensecondWait = () => { cy.wait(10000) }
export const fifteensecondWait = () => { cy.wait(150000) }

export function buradio(labelText) {
    cy.contains('label', labelText)
        .should('exist')
        .within(() => {
            cyGet('input[type="radio"]').then($radio => {
                if (!$radio.is(':checked')) {
                    cy.wrap($radio).check({ force: true });
                } else {
                    cy.wrap($radio).should('be.checked');
                }
            });
        });
}

export const recordCountOnPage = (count) => {
    cyGet('[aria-haspopup="listbox"]').click({ force: true })
    cyGet(`[data-value=${count}]`).click()
    onesecondWait()
}
export const logout = () => {
    cyGet(`[aria-label="User Profile"] button`).click()
    cyGet(`[data-testid="userprofile-box-830j3m6ea"]`).contains("Sign out").click()
}

export function formatModuleName(key) {
    const map = {
        lms: 'Lead Management',
        crm: 'CRM',
        cnf: 'Approval',
        task: 'Task Management',
        invoice: 'Invoice',
        recruitment: 'Recruitment',
        employee: 'Employee',
        asset: 'Asset',
        dsa: 'Direct Selling Agent'
    };
    return map[key] || key;
}

