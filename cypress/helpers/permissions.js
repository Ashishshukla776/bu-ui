import { buSaveButton, cyGet, logout, onesecondWait, twosecondWait } from "./global";

export const permission = (tempaleName) => {
    cyGet(`[data-testid="templatelist-textfield-e9dj43sha"] input`).type(tempaleName);
    cy.wait("@templateGrid")
    return cy.wait("@templateGrid", { timeout: 10000 }).then(({ response }) => {
        const template = response.body.result.values.find(ele => ele.label === tempaleName)
        // cyGet(`[data-testid="templatelist-textfield-e9dj43sha"] input`).type(template?.label);
        cy.intercept('GET', `**/grd/templates/${template.id}`).as('getTempalteById');
        // twosecondWait()
        cy.contains('tr', template?.label, { timeout: 10000 }).find(`[data-testid="Action"]`).click()
        cyGet("#edit").click()
        return cy.wait("@getTempalteById", { timeout: 10000 }).then(({ response }) => {
            return response.body.result
        });
    });
};

export const setPermissionOnRoleSwitch = (permission, permissionValue, permissionToBeCheck, index) => {
    cyGet('[data-testid="ownershiprow-iconbutton-ph6ah241c"]').click();
    if (permission === permissionValue) {
        cy.contains('tr', permissionToBeCheck).find('button[role="switch"]').eq(index).should('have.attr', `aria-checked`, `${permissionValue}`).click();
        buSaveButton().click();
    } else { buSaveButton().should("be.disabled") }
    //logout the Admin account
    logout();
    cy.clearCookies();
    twosecondWait()
}