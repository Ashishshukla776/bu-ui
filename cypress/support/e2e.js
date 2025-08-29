
import './commands'
import 'cypress-mochawesome-reporter/register';

// afterEach(()=>{
//     cy.signOut()
// })
const excludedFiles = ["login", "manageTemplate"];
const fileName = Cypress.spec["fileName"];
beforeEach(() => {
    if (!excludedFiles.includes(fileName)) {
        cy.session('user', () => { cy.login() });
        cy.checkAndRenewToken();
        if (!Cypress.env('token')) {
            cy.readFile('cypress/fixtures/token.json').then((data) => {
                Cypress.env('token', data.apiToken);
                localStorage.setItem('authToken', data.apiToken);
            });
        };
    };
});

Cypress.on('uncaught:exception', (err, runnable) => {
    return false
});