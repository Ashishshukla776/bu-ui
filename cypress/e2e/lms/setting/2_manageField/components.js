const { cyGet, budropdown, budropdownOption, recordCountOnPage, buSearchbox, buCaption, onesecondWait } = require('../../../../helpers/global')
const fieldSel = require('../../../../selector/fieldSel')
const globalSel = require('../../../../selector/globalSel')
const lead = require('../../../../selector/lead')

describe(`Nevigate the setting page and verify the field components`, () => {

    const url = Cypress.env("url")
    const module = Cypress.env("module")
    const asset = Cypress.env("asset")
    let updatedUrl = url.replace("one", module);
    const assetName = asset.charAt(0).toUpperCase() + asset.slice(1)

    beforeEach(() => {
        cy.intercept('GET', '**/fms/fields/grid?*').as("fieldGrid")
        cy.intercept('GET', '**/rms/assets/pipelines?*').as("assetPipeline")
        cy.intercept('GET', '**/fms/groups/list?*').as("groupList")
        cy.visit(`${updatedUrl}/setting/properties`)
        // cy.wait(2000)
    })

    const fieldTypeFilterSel = (fieldType) => {
        buSearchbox(globalSel.search, fieldType)
        budropdownOption(fieldType).contains(fieldType)
    }

    const validatetableRow = (nth, contain) => {
        cyGet('table > tbody > .MuiTableRow-root').each(($row) => {
            cy.wrap($row).as("tableRow")
            cy.get("@tableRow").find(`:nth-child(${nth})`).should('contain', contain)
        });
    }

    it(`Verify and select Asset Pipeline`, () => {
        const moduleName = module.toUpperCase();
        const selectedAsset = asset === "deal" ? `${assetName}s` : `${assetName}`;
        const subHeadingText = `Fields store information about ${moduleName}`
        buCaption(globalSel.settinglayoutbox, fieldSel.captionHeading, "Fields", fieldSel.captionSubHeading, subHeadingText)
        cyGet('[data-testid="properties-typography-ug3bego54"]').contains("Select Asset")
        cy.wait("@assetPipeline", { timeout: 10000 }).then(({ response }) => {
            let piplabel = response.body.result.values.map(ele => ele.label);
            budropdown(globalSel.settinglayoutbox, `${globalSel.buttonBox} button`, piplabel[0]);

            cyGet(`[data-testid="${selectedAsset}"] [data-testid="groupbaseitems-typography-rnufjql1q"]`)
                .should("contain.text", selectedAsset);

            budropdownOption(piplabel[1]).contains(piplabel[1]).click();
            budropdown(globalSel.settinglayoutbox, `${globalSel.buttonBox} button`, piplabel[1]);
        })

        cyGet('#simple-tab-0 > [data-testid="withtruncate-wrapped-jhk5rb2jw"]').contains("All fields");
        cyGet('#simple-tab-1 > [data-testid="withtruncate-wrapped-jhk5rb2jw"]').contains("Groups");
        cyGet('#simple-tab-2 > [data-testid="withtruncate-wrapped-jhk5rb2jw"]').contains("Deleted fields");
    });

    it(`Verify the group filter is working as expected`, () => {
        cy.wait("@assetPipeline", { timeout: 10000 }).then(() => {
            budropdown(globalSel.settinglayoutbox, `button ${globalSel.buttonTypography}`, "All groups")
            cy.wait("@groupList", { timeout: 10000 }).then(({ response }) => {
                let groupLabel = response.body.result.values.map(ele => ele.label)
                budropdownOption(groupLabel[0])
                    .contains(groupLabel[0])
                    .click()
                recordCountOnPage("5")
                validatetableRow(3, groupLabel[0])
            })
        })
    });

    it(`Verify the field type filter should contains all field type`, () => {
        budropdown(globalSel.settinglayoutbox, `button ${globalSel.buttonTypography}`, "All field types")
        fieldTypeFilterSel("Single line text")
        fieldTypeFilterSel("Number")
        fieldTypeFilterSel("Email")
        fieldTypeFilterSel("URL")
        fieldTypeFilterSel("Owner")
        fieldTypeFilterSel("Created By")
        fieldTypeFilterSel("Basic Dropdown")
        fieldTypeFilterSel("Colored dropdown")
        fieldTypeFilterSel("Date field")
        fieldTypeFilterSel("Time field")
        fieldTypeFilterSel("Date and time field")
        fieldTypeFilterSel("Stage")
        fieldTypeFilterSel("Attachment")
        fieldTypeFilterSel("Address")
        fieldTypeFilterSel("Image")
        fieldTypeFilterSel("Multi line text")
        fieldTypeFilterSel("Checkbox")
        fieldTypeFilterSel("Radio")
        fieldTypeFilterSel("Rating")
        fieldTypeFilterSel("Formula")
        fieldTypeFilterSel("Unique Id")
        fieldTypeFilterSel("Custom form")
        fieldTypeFilterSel("Data source")
    });

    it(`Verify the field type filter is working as expected`, () => {
        cy.wait("@assetPipeline", { timeout: 10000 }).then(() => {
            budropdown(globalSel.settinglayoutbox, `button ${globalSel.buttonTypography}`, "All field types");
            onesecondWait();
            budropdownOption("Single line text").contains("Single line text").click();
            budropdown(globalSel.settinglayoutbox, `button ${globalSel.buttonTypography}`, "Single line text");
            recordCountOnPage("5");
            validatetableRow(2, "Single line text")
        });
    });

    it(`Validate used count with API`, () => {
        cyGet('#simple-tab-0 > [data-testid="withtruncate-wrapped-jhk5rb2jw"]').contains("All fields").click()
        cy.wait("@fieldGrid", { timeout: 10000 })
        recordCountOnPage("10")
        cy.wait("@fieldGrid", { timeout: 10000 }).then(({ response }) => {
            let abc = response.body.result.values.map(ele => ele.recordCount);
            cyGet('table > tbody > .MuiTableRow-root').each(($row, index) => {
                cy.wrap($row).as("tableRow")
                cy.get("@tableRow").find(':nth-child(5)').should('contain', abc[index])
            });
        });
    });

    it(`Validate attached count with API`, () => {
        cyGet('#simple-tab-0 > .MuiTypography-root').contains("All fields").click()
        cy.wait("@fieldGrid", { timeout: 10000 })
        recordCountOnPage("10")
        cy.wait("@fieldGrid", { timeout: 10000 }).then(({ response }) => {
            let abc = response.body.result.values.map(ele => ele.attachedCount);
            let counts = abc.map(fields => { return fields.count });
            cyGet('table > tbody > .MuiTableRow-root').each(($row, index) => {
                cy.wrap($row).as("tableRow")
                cy.get("@tableRow").find(':nth-child(6)').should('contain', counts[index])
            });
        });
    });
});
