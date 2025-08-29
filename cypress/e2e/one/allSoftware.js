const one = require('../../selector/one');
// const lead = require('../../selector/one')
import { modules } from '../../helpers/helper';

describe(`Test case for ${Cypress.spec["fileName"]}`, () => {
    beforeEach(() => {
        cy.session('user', () => { cy.login() });
        cy.visit(`${Cypress.env("url")}/softwares`)
    })

    // afterEach(()=>{
    //     cy.signOut()
    // })

    it(`Asset : Lead Management Software(lms)`, () => {
        let lmsDes = 'Efficiently manage and assign lead information.'
        cy.Modules(`#lms ${one.moduleNameID}`, modules.lms, `#lms ${one.moduleDescID}`, lmsDes, `#lms ${one.modOpnbtnID}`, one.moduleHeader, modules.lms)
    });

    it(`Asset : Customer relationship management Software(crm)`, () => {
        let crmDes = 'Drive sales success, build stronger client relationships, and grow revenue with our CRM.'
        cy.Modules(`#crm  ${one.moduleNameID}`, modules.crm, `#crm  ${one.moduleDescID}`, crmDes, `#crm  ${one.modOpnbtnID}`, one.moduleHeader, modules.crm)

    });

    it(`Asset : Approval Management Software(cnf)`, () => {
        let aprDes = 'The approver can approve public and private data as required.'
        cy.Modules(`#cnf  ${one.moduleNameID}`, modules.apr, `#cnf  ${one.moduleDescID}`, aprDes, `#cnf ${one.modOpnbtnID}`, one.moduleHeader, modules.apr)
    });

    // it.skip(`Asset : Product Listing Management Software(pls)`, () => {
    //     let moduleName = 'Product Listing'
    //     let plsDes = 'Manage the product record with dynamic category and type.'
    //     // cy.Modules('#pls  p[class]', moduleName, '#pls  span[class]', plsDes, '#pls  .MuiButtonBase-root', one.moduleHeader, moduleName)
    //     cy.Modules('#pls  [data-testid="appcard-typography-54qh3zrwi"]', moduleName, '#pls  [data-testid="appcard-typography-dgesxt558"]', plsDes, '#pls  [data-testid="Open"]', one.moduleHeader, moduleName)
    // });

    // it.skip(`Asset : Purchase Order Management Software(po)`, () => {
    //     let moduleName = 'Purchase Order'
    //     let poDes = 'Create, track, and control purchases effortlessly. Streamline orders from request to receipt.'
    //     // cy.Modules('#po p[class]', moduleName, '#po span[class]', poDes, '#po .MuiButtonBase-root', one.moduleHeader, moduleName)
    //     cy.Modules('#po [data-testid="appcard-typography-54qh3zrwi"]', moduleName, '#po [data-testid="appcard-typography-dgesxt558"]', poDes, '#po [data-testid="Open"]', one.moduleHeader, moduleName)
    // });

    it(`Asset : Buopso Form`, () => {
        let formsDes = 'Build your form as required and gather the form data.'
        cy.Modules(`#forms  ${one.moduleNameID}`, modules.buForms, `#forms  ${one.moduleDescID}`, formsDes, `#forms  ${one.modOpnbtnID}`, one.moduleHeader, modules.buForms)
    });

    it(`Asset : Task Management`, () => {
        let taskDes = 'Task management system. Manage task records and assign tasks to the user.'
        cy.Modules(`#task  ${one.moduleNameID}`, modules.taskManagement, `#task  ${one.moduleDescID}`,taskDes , `#task  ${one.modOpnbtnID}`, one.moduleHeader, modules.taskManagement)
    });

    it(`Asset : Invoice`, () => {
        let InvoiceDes = 'Invoice for customers and manage payment and ledger history.'
        cy.Modules(`#invoice ${one.moduleNameID}`, modules.invoice, `#invoice  ${one.moduleDescID}`, InvoiceDes, `#invoice ${one.modOpnbtnID}`, one.moduleHeader, modules.invoice)
    });
});