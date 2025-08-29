const lead = require('../../../../selector/lead');
const { cyGet } = require('../../../../helpers/global');

describe(`Test the functionality of bulk delete`, () => {

    const url = Cypress.env("url");
    const module = Cypress.env("module");
    const asset = Cypress.env("asset");
    let updatedUrl = url.replace("one", module);

    beforeEach(() => {
        cy.intercept(`**/rms/records/grid?*`).as("getRecord")
        cy.visit(`${updatedUrl}/${asset}s`)
    });

    const bulkdeletedialogElements = (totalRecord, assetName, delType, recordremainAfterDel) => {
        cyGet('table > thead input').check()
        cyGet('#bulkActions [data-testid="Delete"]').contains("Delete").click()
        cyGet('#customized-dialog-title p').should("have.text", `Delete ${totalRecord} ${assetName}s ?`)
        cyGet(`[data-testid="bulkdelete-box-mhkwwkutr"]`).contains(`You're about to delete ${totalRecord} ${assetName}s.`)
        cyGet(`[data-testid="bulkdelete-box-ihh19chkb"] span`).contains(`Please select appropriate options.`)
        delType === "soft" ? cyGet(`[role="dialog"] [value="${delType}"]`).should("be.checked") : cyGet(`[role="dialog"] [value="${delType}"]`).check();
        cyGet(`[data-testid="buradiogroup-radiogroup-tdw0bqbm7"] label`).contains(`Soft Delete (send to bin)`)
        cyGet(`[data-testid="bulkdelete-typography-07pjxtbt9"]`).contains(`Enter the number of ${assetName}s to be deleted in the below text box to confirm the deletion process.`)
        cyGet(`[data-testid="bulkdelete-box-y109vgxxn"]`).contains(`Number of ${assetName}s to delete`)
        cyGet('[role="dialog"] [type="number"]').should("have.attr", "placeholder", totalRecord)
        cyGet('[role="dialog"] [type="number"]').type(totalRecord)
        cyGet('#delete').click()
        cyGet('.MuiTablePagination-displayedRows').contains(recordremainAfterDel)
    };

    it(`Soft delete records`, () => {
        cyGet(lead.arealabelGrid).click();
        cy.wait("@getRecord", { timeout: 10000 }).then(({ response }) => {
            let recordLength = response.body.result.values.length
            let totalRecord = response.body.result.pages.totalRecords
            let remainsRecord = totalRecord - recordLength
            if (recordLength === 0) {
                cyGet('table > thead input').should("be.disabled")
                expect(recordLength).to.be.eq(0)
            } else {
                bulkdeletedialogElements(recordLength, asset, "soft", remainsRecord)
            };
        });
    });

    it(`Hard delete records`, () => {
        cyGet(lead.arealabelGrid).click();
        cy.wait("@getRecord", { timeout: 10000 }).then(({ response }) => {
            let recordLength = response.body.result.values.length
            let totalRecord = response.body.result.pages.totalRecords
            let remainsRecord = totalRecord - recordLength
            if (recordLength === 0) {
                cyGet('table > thead input').should("be.disabled")
                expect(recordLength).to.be.eq(0)
            } else {
                bulkdeletedialogElements(recordLength, asset, "hard", remainsRecord)
            };
        });
    });
});