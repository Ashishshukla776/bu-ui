const { faker } = require("@faker-js/faker");
const { cyGet } = require("../../../helpers/global");

describe(`Verify My Profile Page`, () => {

    beforeEach(() => {
        cy.intercept('GET', '**/crew/users').as("usersList")
        //  cy.session('user', () => { cy.login() });
        cy.visit(`${Cypress.env("url")}/softwares`)
        cy.contains('My account').click();
        cy.wait(500);
    });

    it('Update user name and verify with profile', () => {
        const UpdatedUsername = faker.person.fullName();
        cyGet("#name-label").should("have.text", "Name *")
        cyGet('input#name').should("have.attr", "required")
        cyGet('input#name')
            .clear()
            .type(UpdatedUsername)
        cyGet('.MuiSnackbarContent-message').should("have.text", "Updated successfully.")
        cy.reload();
        cy.wait(500)
        cy.contains(`${UpdatedUsername}'s Profile`).should('be.visible');
    });

    it('User name should be required', () => {
        cy.get('input[placeholder="Name"]').clear();
        cy.get('#name-helper-text').should('have.text', "Field is required!");
    });

    it('Verify email Address', () => {
        cy.componentLabel('#email-label', "Email address", "input").should("have.value", Cypress.env("email"))
    });

    it('Update Mobile number', () => {
        cy.get('#mobile-label').should("have.text", "Mobile number *");
        // cy.get('#mobile').should("have.attr", "required");
        cy.get('#mobile')
            .clear()
            .type(faker.string.numeric(10))
        cy.get('.MuiSnackbarContent-message').should("have.text", "Updated successfully.")
    });

    it('Mobile number should be in mobile number format', () => {
        cy.get('#mobile').clear();
        cy.get('#mobile').type('wesfd');
        cy.get('#mobile-helper-text').should('have.text', "Mobile number is not valid");
        cy.get('.MuiSnackbarContent-message').should('have.text', "Invalid mobile");
    });

    it('Verify that total listed user is equal to Total users', () => {
        cy.wait("@usersList").then(({ response }) => {
            let totalCount = response.body.result.pages.totalRecords;
            cy.get('[role="tabpanel"] > :nth-child(1) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(2) ').contains(totalCount);
        })
    });
});

