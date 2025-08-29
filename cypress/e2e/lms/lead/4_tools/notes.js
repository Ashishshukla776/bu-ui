const { faker } = require('@faker-js/faker')
const lead = require('../../../../selector/lead');
const { cyGet, buSaveButton, onesecondWait, twosecondWait } = require('../../../../helpers/global');
describe(`Test the functionality of notes`, () => {
    const url = Cypress.env("url");
    const module = Cypress.env("module");
    const asset = Cypress.env("asset");
    let updatedUrl = url.replace("one", module);
    beforeEach(() => {
        cy.visit(`${updatedUrl}/${asset}s?com=note`);
        cy.intercept("POST", `**/fms/pipelines/exists?*`).as("existsPipelines")
        cy.intercept(`GET`, `**/rms/tools/notes*`).as("getNotes")
        cy.intercept(`PUT`, `**/rms/tools/notes*`).as("editNotes")
        cy.wait(2000)
    });

    it(`save button should be disable without input notes`, () => {
        cyGet(`[data-testid="notes-box-q3iecxru9"] button`).contains("Create").wait(2000).click({ force: true });
        // twosecondWait()
        cyGet(`#tool-container [data-testid="Save"]`)
            .contains("Save")
            .trigger('mouseover', { force: true })
            .should("be.disabled")
        cyGet('.MuiTooltip-tooltip').should("have.text", "There is some error in form.")
    })

    it(`Add a notes`, () => {
        cyGet(`[data-testid="notes-box-q3iecxru9"] button`).contains("Create").wait(2000).click({ force: true });
        cyGet("[data-testid='bunotepad-box-8lxcermoa']").type(faker.lorem.sentence());
        cyGet(`#tool-container [data-testid="Save"]`).click()
    })

    it.only(`Update notes`, () => {
        const updateNote = faker.lorem.sentence()
        cyGet('#tool-container [data-testid="buvirtuallist-div-fv0syu6gz"]').first().click()
        cyGet("[data-testid='bunotepad-box-8lxcermoa']").first().clear().type(updateNote);

        cy.wait("@editNotes", { timeout: 10000 }).then(() => {
            cyGet('[data-testid="buwrapper-iconbutton-s8exp1h26"]').click()
            cyGet('[data-testid="header-iconbutton-kigmjsnx1"] > [data-testid="busvgicon-svgicon-5xuxnhkcv"] > [data-testid="search-path-mbnqghet1"]').click({ force: true })
            cyGet('[data-testid="header-textfield-269ovwuta"] input[placeholder="search...."]').type(updateNote)
            cyGet(`#tool-container [data-testid="buvirtuallist-div-fv0syu6gz"]`)
                .find(`[data-testid="card-typography-8vfwf8lhh"]`)
                .should("contain.text", updateNote);
        })
    })

    it(`Pin the notes`, () => {
        cy.wait("@existsPipelines", { timeout: 10000 })
        cy.wait("@getNotes", { timeout: 10000 }).then(({ response }) => {
            const unpinnedNotes = response.body.result.values.find(note => note.pinned === false)
            cyGet('[data-testid="header-iconbutton-kigmjsnx1"] > [data-testid="busvgicon-svgicon-5xuxnhkcv"] > [data-testid="search-path-mbnqghet1"]').click({ force: true })
            cyGet('[data-testid="header-textfield-269ovwuta"] input[placeholder="search...."]').type(unpinnedNotes.body)
            cyGet(`#tool-container [role="rowgroup"] [data-testid="busimpledropdown-iconbutton-81obeefh3"]`).first().click()
            cyGet('#pin').click()
        })

    })

    it(`Unpin the notes`, () => {
        cy.wait("@existsPipelines", { timeout: 10000 })
        cy.wait("@getNotes", { timeout: 10000 }).then(({ response }) => {
            const pinnedNotes = response.body.result.values.find(note => note.pinned === true)
            cyGet('[data-testid="header-iconbutton-kigmjsnx1"] > [data-testid="busvgicon-svgicon-5xuxnhkcv"] > [data-testid="search-path-mbnqghet1"]').click({ force: true })
            cyGet('[data-testid="header-textfield-269ovwuta"] input[placeholder="search...."]').type(pinnedNotes.body)
            cyGet(`#tool-container [role="rowgroup"] [data-testid="busimpledropdown-iconbutton-81obeefh3"]`).first().click()
            cyGet('#unpin').click()
        })

    })

    it(`Like notes`, () => {
        cy.wait("@existsPipelines", { timeout: 10000 })
        cy.wait("@getNotes", { timeout: 10000 }).then(({ response }) => {
            const pinnedNotes = response.body.result.values.find(note => note.liked === false)
            cyGet('[data-testid="header-iconbutton-kigmjsnx1"] > [data-testid="busvgicon-svgicon-5xuxnhkcv"] > [data-testid="search-path-mbnqghet1"]').click({ force: true })
            cyGet('[data-testid="header-textfield-269ovwuta"] input[placeholder="search...."]').type(pinnedNotes.body)
            cyGet('#tool-container [data-testid="buvirtuallist-div-fv0syu6gz"]').first().click()
            cyGet('#tool-container [type="button"]').contains("Likes").click()  // like button
        })
    })

    it(`Add a comment on note`, () => {
        const comment = faker.lorem.sentence()
        cyGet('#tool-container [data-testid="buvirtuallist-div-fv0syu6gz"]').first().click()
        cyGet(`[data-testid="addcomment-typography-34tc065nz"]`).click()
        cyGet('#note-comment').type(comment)
        cyGet(`[data-testid="toolbar-button-b9qu80nyb"]`).contains("Save").click()
        cyGet(`[data-testid="bunotepad-box-8lxcermoa"]`).contains(comment)
    })

    it(`Update Comment on a notes`, () => {
        cyGet('#tool-container [data-testid="buvirtuallist-div-fv0syu6gz"]').first().click()
        cyGet(`[data-testid="commentlist-box-0u6rpj17w"] [data-testid="busimpledropdown-iconbutton-81obeefh3"]`).first().click()
        cyGet('#edit').click()
        cyGet("[data-testid='bunotepad-box-8lxcermoa']").last().clear().type(faker.lorem.sentence());
        cyGet(`[data-testid="toolbar-button-b9qu80nyb"]`).contains("Save").click()
    })

    it(`Delete Comment on a notes`, () => {
        cyGet('#tool-container [data-testid="buvirtuallist-div-fv0syu6gz"]').first().click()
        cyGet(`[data-testid="commentlist-box-0u6rpj17w"] [data-testid="busimpledropdown-iconbutton-81obeefh3"]`).first().click()
        cyGet('#delete').click()
        cyGet(`[role="dialog"] #customized-dialog-title p`).should("contain.text", "Delete Comment")
        cyGet(`[data-testid="buconfirmation-typography-9lgofl82d"]`).should("contain.text", "Are you sure you want to delete comment?")
        cyGet(`[data-testid="Delete"]`).contains("Delete").click()
    })

    it(`Unlike notes`, () => {
        cy.wait("@existsPipelines", { timeout: 10000 })
        cy.wait("@getNotes", { timeout: 10000 }).then(({ response }) => {
            const pinnedNotes = response.body.result.values.find(note => note.liked === true)
            cyGet('[data-testid="header-iconbutton-kigmjsnx1"] > [data-testid="busvgicon-svgicon-5xuxnhkcv"] > [data-testid="search-path-mbnqghet1"]').click({ force: true })
            cyGet('[data-testid="header-textfield-269ovwuta"] input[placeholder="search...."]').type(pinnedNotes.body)
            cyGet('#tool-container [data-testid="buvirtuallist-div-fv0syu6gz"]').first().click()
            cyGet('#tool-container [type="button"]').contains("Likes").click()  // like button
        })
    })

    it(`Delete notes`, () => {
        cyGet(`#tool-container [role="rowgroup"] [data-testid="busimpledropdown-iconbutton-81obeefh3"]`).as("ellipsis").first().click()
        cyGet('#delete').click()
        cyGet(`[role="dialog"] #customized-dialog-title p`).should("contain.text", "Delete Note")
        cyGet(`[data-testid="buconfirmation-typography-9lgofl82d"]`).should("contain.text", "Are you sure you want to delete this note?")
        cyGet(`[data-testid="Delete"]`).contains("Delete").click()
    })
})

