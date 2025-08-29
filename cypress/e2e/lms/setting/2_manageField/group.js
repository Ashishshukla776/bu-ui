const { cyGet, onesecondWait } = require('../../../../helpers/global')
const lead = require('../../../../selector/lead')

describe(`Nevigate the setting page and test the field group`, () => {

    beforeEach(() => {
        cy.intercept('GET', '**/fms/fields/grid?*').as("fieldGrid")
        cy.intercept('GET', '**/fms/groups/grid?*').as("groupGrid")
        cy.intercept('GET', '**/fms/groups/exist?*').as("groupExist")
        //  cy.session('user', () => { cy.login() });
        cy.visit(`${Cypress.env("lmsUrl")}/setting/properties`)
        cy.wait(2000)
    })

    it(`Add new group`, () => {
        let groupName = `Group-${new Date().valueOf()}`
        cy.get('#simple-tab-1 > .MuiTypography-root').contains("Groups").click()
        cy.get(lead.typeBtn).contains("Add Group").click()
        cy.get(lead.dialogTitle).should("have.text", "Create group")
        cy.componentLabel(lead.formLabel, "Create group", "input").type(groupName)
        cy.get("#cancel").should("have.text", "Cancel")
        cy.get("#add").click()
    });

    it(`Private group can't be edited and deleted`, () => {
        cyGet('#simple-tab-1 > .MuiTypography-root').contains("Groups").click()
        cy.wait("@groupGrid", { timeout: 10000 }).then(({ response }) => {
            let privateGroup = response.body.result.values.find(ele => ele.scope === "private")
            cy.contains("tr", privateGroup?.label)
                .find(`[data-testid="withtruncate-wrapped-jhk5rb2jw"]`)
                .should("contain.text", privateGroup?.label)
            cy.contains("tr", privateGroup?.label).find("#actions").click()
            cyGet("#edit").trigger("mouseover", { force: true })
            cyGet('.MuiTooltip-tooltip').contains("Private group can't be edited")
            cyGet('#edit > .MuiButtonBase-root ').should("have.attr", "aria-disabled", "true")

            cyGet("#delete").trigger("mouseover", { force: true })
            cyGet('.MuiTooltip-tooltip').contains("Private group can't be deleted")
            cyGet('#delete > .MuiButtonBase-root ').should("have.attr", "aria-disabled", "true")
        })

    });

    it(`Validate assigned fields count with API`, () => {
        cyGet('#simple-tab-1 > .MuiTypography-root').contains("Groups").click()
        cy.wait(1000)
        cy.recordCountOnPage("5")
        cy.wait("@groupGrid").then(({ response }) => {
            let abc = response.body.result.values.map(ele => ele.assignedFields);
            let counts = abc.map(fields => {
                let count = fields.count;
                return count === 0 ? "--" : count;
            });
            cyGet('table > tbody >').children(".MuiTableRow-root > :nth-child(2)").each(($row, index) => {
                cy.wrap($row).contains(counts[index]);
            });
        })
    });

    it(`group name should be unique`, () => {

        cyGet('#simple-tab-1 > .MuiTypography-root').contains("Groups").click()
        cy.wait("@groupGrid", { timeout: 10000 }).then(({ response }) => {
            const group = response.body.result.values.filter(grp => grp.scope === "public");
            cy.contains(`tr`, group[0].label).find("#actions").click()
            cyGet("#edit").click()
            cyGet(`[data-testid="title-dialog"] p`).should("contain.text", "Rename group");
            cyGet(`[data-testid="butextfield-textfield-lrb6zu6xa"] label`)
                .contains("Rename group")
                .next()
                .find(`input`).as("renameGroupInput")
            cy.get("@renameGroupInput").should("have.value", group[0].label)
            cy.get("@renameGroupInput").clear().type(group[1].label);
            onesecondWait()
            cy.wait("@groupExist", { timeout: 10000 }).then(({ response }) => {
                expect(response.body).has.property("message", "Group already exists.")
                // cyGet(".MuiFormHelperText-root").should("contain.text", response.body.message)
                cyGet("#add").should("be.disabled")
            })

        })
    });

    it(`Rename group`, () => {
        let groupName = `Group-${new Date().valueOf()}`
        cyGet('#simple-tab-1 > .MuiTypography-root').contains("Groups").click()
        cy.wait("@groupGrid", { timeout: 10000 }).then(({ response }) => {
            const group = response.body.result.values.find(grp => grp.scope === "public");
            cy.log(JSON.stringify(group))
            cy.contains(`tr`, group?.label).find("#actions").click()
            cyGet("#edit").click()
            cyGet(`[data-testid="butextfield-textfield-lrb6zu6xa"] label`)
                .contains("Rename group")
                .next()
                .find(`input`).as("renameGroupInput")
            cy.get("@renameGroupInput").should("have.value", group?.label)
            cy.get("@renameGroupInput").clear().type(groupName)
            cyGet("#cancel").should("contain.text", "Cancel")
            cyGet("#add").click()
        })
    });

    it(`Delete group`, () => {
        let msg1 = "Delete Group"
        let msg2 = "Are you sure! want to delete this group?"
        cy.get('#simple-tab-1 > .MuiTypography-root').contains("Groups").click()
        cy.wait(1000)
        cy.recordCountOnPage("5")
        cyGet('[aria-label="pagination navigation"] ul > :last').prev().click()
        cy.wait("@groupGrid").then(({ response }) => {
            const group = response.body.result.values.find(grp => grp.assignedFields.count === 0 && grp.scope === "public")
            if (group) {
                cy.contains("tr", group.label).find("#actions").click()
                cyGet("#delete").click()
                cy.roleDialog(lead.dialogTitle, msg1, lead.dialogDesc, msg2, `[role="dialog"] ${lead.typeBtn}`, "Delete")
            } else {
                cy.log(`Either all groups contain the field, or no public groups are available: ${group}`)
            }

        })
    });
})
